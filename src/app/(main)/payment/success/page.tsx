'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey')
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')
    const productId = searchParams.get('productId')

    if (!paymentKey || !orderId || !amount) {
      setStatus('error')
      setMessage('결제 정보가 올바르지 않습니다.')
      return
    }

    fetch('/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount), productId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('success')
          setMessage('결제가 완료되었습니다!')
        } else {
          setStatus('error')
          setMessage(data.error || '결제 확인에 실패했습니다.')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('결제 확인 중 오류가 발생했습니다.')
      })
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-solar-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-on-surface-variant">결제를 확인하고 있습니다...</p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <span
        className={`material-symbols-outlined text-6xl mb-4 ${status === 'success' ? 'text-solar-primary' : 'text-red-400'}`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {status === 'success' ? 'check_circle' : 'error'}
      </span>
      <h1 className="text-2xl font-bold text-white font-headline mb-3">{message}</h1>
      <div className="flex gap-4 justify-center mt-8">
        <Link href="/mypage" className="bg-solar-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:scale-[0.98] transition-transform">
          주문 내역 보기
        </Link>
        <Link href="/products" className="bg-surface-container-high text-white px-6 py-3 rounded-xl border border-outline-variant/30 hover:bg-surface-container-highest transition-colors">
          상품 더 보기
        </Link>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-32">
      <Suspense fallback={<div className="text-center text-on-surface-variant">로딩 중...</div>}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  )
}
