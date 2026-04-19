'use client'

import { useEffect } from 'react'
import ReviewForm from './ReviewForm'

interface ReviewModalProps {
  open: boolean
  productId: string
  productName?: string
  orderId: string
  onClose: () => void
  onSuccess?: () => void
}

export default function ReviewModal({ open, productId, productName, orderId, onClose, onSuccess }: ReviewModalProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-surface-container-highest border border-outline-variant/10 rounded-2xl w-full max-w-lg p-6 my-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-white font-headline">리뷰 작성</h2>
            {productName && <p className="text-sm text-on-surface-variant mt-1">{productName}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-white transition-colors"
            aria-label="닫기"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <ReviewForm
          productId={productId}
          orderId={orderId}
          onSuccess={() => {
            onSuccess?.()
            onClose()
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}
