'use client'

import { useSearchParams, } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function PaymentFailContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || '결제가 취소되었거나 실패했습니다.'

  return (
    <div className="max-w-xl mx-auto px-6 py-32 text-center">
      <span className="material-symbols-outlined text-red-400 text-6xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
        cancel
      </span>
      <h1 className="text-2xl font-bold text-white font-headline mb-3">결제 실패</h1>
      <p className="text-on-surface-variant mb-8">{message}</p>
      <Link href="/products" className="bg-solar-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:scale-[0.98] transition-transform">
        상품 목록으로 돌아가기
      </Link>
    </div>
  )
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className="text-center py-32 text-on-surface-variant">로딩 중...</div>}>
      <PaymentFailContent />
    </Suspense>
  )
}
