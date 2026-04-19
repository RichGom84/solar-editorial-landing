'use client'

import { useMemo, useState } from 'react'
import StarRating from './StarRating'
import type { ReviewDoc } from '@/lib/firestore-db'
import { safeImageUrl } from '@/lib/url-safety'

interface ReviewCardProps {
  review: ReviewDoc
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [lightbox, setLightbox] = useState<string | null>(null)
  const d = (review.createdAt as unknown as { toDate?: () => Date })?.toDate?.()
  const displayName = review.userName || '익명'
  const initial = displayName[0] || '?'

  const safeAvatar = useMemo(() => safeImageUrl(review.userImage), [review.userImage])
  const safeImages = useMemo(
    () => review.images.map((u) => safeImageUrl(u)).filter((u): u is string => !!u),
    [review.images]
  )

  return (
    <>
      <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {safeAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={safeAvatar} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-solar-primary/20 flex items-center justify-center text-solar-primary font-bold">
                {initial}
              </div>
            )}
            <div>
              <p className="text-white font-medium text-sm">{displayName}</p>
              <p className="text-xs text-on-surface-variant">{d ? d.toLocaleDateString('ko-KR') : '-'}</p>
            </div>
          </div>
          <StarRating value={review.rating} size="sm" readOnly />
        </div>

        <p className="text-on-surface-variant leading-relaxed whitespace-pre-line text-sm mb-3">{review.text}</p>

        {safeImages.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {safeImages.map((url, i) => (
              <button
                key={i}
                onClick={() => setLightbox(url)}
                className="aspect-square rounded-lg overflow-hidden bg-surface-container hover:ring-2 hover:ring-solar-primary transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`review image ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="확대 이미지" className="max-w-full max-h-full object-contain" />
          <button
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            aria-label="닫기"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}
    </>
  )
}
