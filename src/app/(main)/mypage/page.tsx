'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  listOrdersByUser,
  listConsultationsByUser,
  listReviewsByUser,
  type OrderDoc,
  type ConsultationDoc,
  type ReviewDoc,
} from '@/lib/firestore-db'
import { formatKRW } from '@/lib/constants'
import ReviewModal from '@/components/reviews/ReviewModal'

const statusLabel: Record<string, { text: string; color: string }> = {
  PENDING: { text: '대기중', color: 'text-yellow-400 bg-yellow-400/10' },
  PAID: { text: '결제완료', color: 'text-solar-primary bg-solar-primary/10' },
  CANCELLED: { text: '취소됨', color: 'text-red-400 bg-red-400/10' },
  REFUNDED: { text: '환불됨', color: 'text-orange-400 bg-orange-400/10' },
  FAILED: { text: '실패', color: 'text-red-400 bg-red-400/10' },
}

function tsToDate(ts: { toDate?: () => Date } | null | undefined): Date | null {
  if (!ts) return null
  if (typeof ts.toDate === 'function') return ts.toDate()
  return null
}

export default function MyPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<OrderDoc[]>([])
  const [consultations, setConsultations] = useState<ConsultationDoc[]>([])
  const [reviews, setReviews] = useState<ReviewDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewTarget, setReviewTarget] = useState<OrderDoc | null>(null)

  const reviewedOrderIds = useMemo(() => new Set(reviews.map((r) => r.orderId)), [reviews])

  const load = async (uid: string) => {
    const [o, c, r] = await Promise.all([listOrdersByUser(uid), listConsultationsByUser(uid), listReviewsByUser(uid)])
    setOrders(o)
    setConsultations(c)
    setReviews(r)
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    ;(async () => {
      try {
        await load(user.uid)
      } catch (e) {
        console.error('MyPage load error:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [authLoading, user, router])

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-32 text-center text-on-surface-variant">
        로딩 중...
      </div>
    )
  }

  if (!user) return null

  const initial = user.displayName?.[0] || user.email?.[0] || '?'

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Profile */}
      <div className="bg-surface-container-highest rounded-2xl p-8 border border-outline-variant/10 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-solar-primary/20 flex items-center justify-center text-solar-primary text-2xl font-bold">
            {initial}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user.displayName || '회원'}</h1>
            <p className="text-on-surface-variant text-sm">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-solar-primary">receipt_long</span>
          주문 내역
        </h2>
        {orders.length === 0 ? (
          <div className="bg-surface-container-low rounded-xl p-8 text-center text-on-surface-variant border border-outline-variant/10">
            주문 내역이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const d = tsToDate(order.createdAt)
              const canReview = order.status === 'PAID' && !reviewedOrderIds.has(order.id)
              const hasReview = reviewedOrderIds.has(order.id)
              return (
                <div key={order.id} className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{order.productName || order.productId}</p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {d ? d.toLocaleDateString('ko-KR') : '-'} · {order.method || '-'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{formatKRW(order.amount)}</p>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusLabel[order.status]?.color}`}>
                        {statusLabel[order.status]?.text}
                      </span>
                    </div>
                  </div>
                  {(canReview || hasReview) && (
                    <div className="mt-3 pt-3 border-t border-outline-variant/10 flex justify-end">
                      {canReview ? (
                        <button
                          onClick={() => setReviewTarget(order)}
                          className="text-xs bg-solar-primary text-on-primary font-bold px-3 py-1.5 rounded-lg hover:scale-95 transition-transform"
                        >
                          리뷰 쓰기
                        </button>
                      ) : (
                        <span className="text-xs text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          리뷰 작성 완료
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Consultations */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-solar-primary">forum</span>
          상담 내역
        </h2>
        {consultations.length === 0 ? (
          <div className="bg-surface-container-low rounded-xl p-8 text-center text-on-surface-variant border border-outline-variant/10">
            상담 내역이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {consultations.map((c) => {
              const d = tsToDate(c.createdAt)
              return (
                <div key={c.id} className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">{c.region} · {c.buildingType}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-solar-primary bg-solar-primary/10">{c.status}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {d ? d.toLocaleDateString('ko-KR') : '-'} · {c.monthlyBill || '-'}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {reviewTarget && (
        <ReviewModal
          open={!!reviewTarget}
          productId={reviewTarget.productId}
          productName={reviewTarget.productName || reviewTarget.productId}
          orderId={reviewTarget.id}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => user && load(user.uid).catch(console.error)}
        />
      )}
    </div>
  )
}
