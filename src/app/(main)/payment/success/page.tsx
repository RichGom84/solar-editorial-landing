'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, Suspense } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { createOrder } from '@/lib/firestore-db'
import { getProductById } from '@/lib/products'
import ReviewModal from '@/components/reviews/ReviewModal'

interface ConfirmedPayment {
  paymentKey: string
  orderId: string
  orderName: string
  method: string
  totalAmount: number
  approvedAt: string
  status: string
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null)
  const [productId, setProductId] = useState<string>('')
  const [productName, setProductName] = useState<string>('')
  const [reviewOpen, setReviewOpen] = useState(false)
  const processedRef = useRef(false)

  useEffect(() => {
    if (authLoading) return
    if (processedRef.current) return

    const paymentKey = searchParams.get('paymentKey')
    const orderIdParam = searchParams.get('orderId')
    const amount = searchParams.get('amount')
    const pid = searchParams.get('productId') || ''

    if (!paymentKey || !orderIdParam || !amount) {
      setStatus('error')
      setMessage('결제 정보가 올바르지 않습니다.')
      return
    }

    processedRef.current = true
    setProductId(pid)

    ;(async () => {
      try {
        const res = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId: orderIdParam, amount: Number(amount) }),
        })
        const data = await res.json()

        if (!data.success) {
          setStatus('error')
          setMessage(data.error || '결제 확인에 실패했습니다.')
          return
        }

        const payment: ConfirmedPayment = data.payment
        const product = getProductById(pid)
        setProductName(product?.name ?? payment.orderName)

        if (user) {
          try {
            const docId = await createOrder({
              userId: user.uid,
              userEmail: user.email,
              userName: user.displayName,
              productId: pid,
              productName: product?.name ?? payment.orderName,
              amount: payment.totalAmount,
              status: 'PAID',
              paymentKey: payment.paymentKey,
              orderId: payment.orderId,
              method: payment.method,
              approvedAt: null,
            })
            setSavedOrderId(docId)
            setReviewOpen(true)
          } catch (fsErr) {
            console.error('Firestore order save error:', fsErr)
          }
        }

        setStatus('success')
        setMessage('결제가 완료되었습니다!')
      } catch (e) {
        console.error(e)
        setStatus('error')
        setMessage('결제 확인 중 오류가 발생했습니다.')
      }
    })()
  }, [authLoading, searchParams, user])

  if (status === 'loading') {
    return (
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-solar-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-on-surface-variant">결제를 확인하고 있습니다...</p>
      </div>
    )
  }

  return (
    <>
      <div className="text-center">
        <span
          className={`material-symbols-outlined text-6xl mb-4 ${status === 'success' ? 'text-solar-primary' : 'text-red-400'}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {status === 'success' ? 'check_circle' : 'error'}
        </span>
        <h1 className="text-2xl font-bold text-white font-headline mb-3">{message}</h1>

        {status === 'success' && savedOrderId && !reviewOpen && (
          <button
            onClick={() => setReviewOpen(true)}
            className="mt-2 text-solar-primary font-bold text-sm hover:underline"
          >
            리뷰 작성하기 →
          </button>
        )}

        <div className="flex gap-4 justify-center mt-8">
          <Link href="/mypage" className="bg-solar-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:scale-[0.98] transition-transform">
            주문 내역 보기
          </Link>
          <Link href="/products" className="bg-surface-container-high text-white px-6 py-3 rounded-xl border border-outline-variant/30 hover:bg-surface-container-highest transition-colors">
            상품 더 보기
          </Link>
        </div>
      </div>

      {savedOrderId && productId && (
        <ReviewModal
          open={reviewOpen}
          productId={productId}
          productName={productName}
          orderId={savedOrderId}
          onClose={() => setReviewOpen(false)}
        />
      )}
    </>
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
