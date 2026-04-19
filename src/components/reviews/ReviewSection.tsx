'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  listReviewsByProduct,
  listOrdersByUser,
  listReviewsByUser,
  type ReviewDoc,
  type OrderDoc,
} from '@/lib/firestore-db'
import StarRating from './StarRating'
import ReviewCard from './ReviewCard'
import ReviewModal from './ReviewModal'

interface ReviewSectionProps {
  productId: string
  productName: string
}

export default function ReviewSection({ productId, productName }: ReviewSectionProps) {
  const { user, loading: authLoading } = useAuth()
  const [reviews, setReviews] = useState<ReviewDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [writableOrderId, setWritableOrderId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const loadReviews = async () => {
    const list = await listReviewsByProduct(productId)
    setReviews(list)
    return list
  }

  const computeWritable = async (reviewsForProduct: ReviewDoc[]) => {
    if (!user) {
      setWritableOrderId(null)
      return
    }
    const [orders, userReviews] = await Promise.all([listOrdersByUser(user.uid), listReviewsByUser(user.uid)])
    const paidOrdersForProduct: OrderDoc[] = orders.filter((o) => o.productId === productId && o.status === 'PAID')
    const reviewedOrderIds = new Set([
      ...reviewsForProduct.filter((r) => r.userId === user.uid).map((r) => r.orderId),
      ...userReviews.map((r) => r.orderId),
    ])
    const nextOrder = paidOrdersForProduct.find((o) => !reviewedOrderIds.has(o.id))
    setWritableOrderId(nextOrder?.id ?? null)
  }

  useEffect(() => {
    if (authLoading) return
    ;(async () => {
      try {
        const list = await loadReviews()
        await computeWritable(list)
      } catch (e) {
        console.error('Review load error:', e)
      } finally {
        setLoading(false)
      }
    })()

  }, [authLoading, user?.uid, productId])

  const { average, count, distribution } = useMemo(() => {
    const c = reviews.length
    if (!c) return { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] }
    const sum = reviews.reduce((s, r) => s + r.rating, 0)
    const dist = [0, 0, 0, 0, 0]
    reviews.forEach((r) => {
      const idx = Math.max(0, Math.min(4, 5 - r.rating))
      dist[idx]++
    })
    return { average: sum / c, count: c, distribution: dist }
  }, [reviews])

  const handleReviewSuccess = async () => {
    const list = await loadReviews()
    await computeWritable(list)
  }

  return (
    <section className="mt-16">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-2xl font-bold text-white font-headline flex items-center gap-3">
          리뷰 <span className="text-solar-primary">{count}</span>
        </h2>
        {writableOrderId && (
          <button
            onClick={() => setModalOpen(true)}
            className="bg-solar-primary text-on-primary font-bold px-5 py-2 rounded-lg text-sm hover:scale-95 transition-transform"
          >
            리뷰 쓰기
          </button>
        )}
      </div>

      {count > 0 && (
        <div className="bg-surface-container-highest rounded-xl p-6 border border-outline-variant/10 mb-6 flex flex-col md:flex-row items-center gap-8">
          <div className="text-center">
            <p className="text-5xl font-bold text-white">{average.toFixed(1)}</p>
            <StarRating value={Math.round(average)} size="md" readOnly />
            <p className="text-xs text-on-surface-variant mt-1">{count}개 리뷰</p>
          </div>
          <div className="flex-1 w-full space-y-1">
            {[5, 4, 3, 2, 1].map((star, i) => {
              const n = distribution[i]
              const pct = count ? (n / count) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="text-on-surface-variant w-6">{star}점</span>
                  <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-on-surface-variant w-8 text-right">{n}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-on-surface-variant">리뷰를 불러오는 중...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-surface-container-low rounded-xl p-12 text-center border border-outline-variant/10">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3">rate_review</span>
          <p className="text-on-surface-variant">아직 작성된 리뷰가 없습니다.</p>
          {writableOrderId && (
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 text-solar-primary font-bold text-sm hover:underline"
            >
              첫 리뷰를 남겨주세요 →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}

      {writableOrderId && (
        <ReviewModal
          open={modalOpen}
          productId={productId}
          productName={productName}
          orderId={writableOrderId}
          onClose={() => setModalOpen(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </section>
  )
}
