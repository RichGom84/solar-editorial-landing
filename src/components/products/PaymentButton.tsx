'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { formatKRW } from '@/lib/constants'
import { useAuth } from '@/components/providers/AuthProvider'

interface PaymentButtonProps {
  productId: string
  productName: string
  price: number
}

export default function PaymentButton({ productId, productName, price }: PaymentButtonProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
      if (!clientKey) {
        alert('결제 시스템이 준비 중입니다. 관리자에게 문의해주세요.')
        return
      }

      const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk')
      const tossPayments = await loadTossPayments(clientKey)
      const payment = tossPayments.payment({ customerKey: user.uid })

      const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: price },
        orderId,
        orderName: productName,
        customerEmail: user.email || '',
        customerName: user.displayName || '',
        successUrl: `${window.location.origin}/payment/success?productId=${productId}`,
        failUrl: `${window.location.origin}/payment/fail`,
      })
    } catch (err) {
      if ((err as { code?: string })?.code === 'USER_CANCEL') return
      console.error('Payment error:', err)
      alert('결제 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading || authLoading}
      className="w-full bg-solar-primary text-on-primary font-bold py-4 rounded-xl text-lg shadow-[0_0_20px_rgba(78,222,163,0.3)] hover:scale-[0.98] transition-transform disabled:opacity-50"
    >
      {loading ? '결제 준비 중...' : `${formatKRW(price)} 결제하기`}
    </button>
  )
}
