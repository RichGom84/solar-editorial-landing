'use client'

import { useState, useRef } from 'react'
import StarRating from './StarRating'
import { uploadReviewImages, validateImage } from '@/lib/storage'
import { createReview } from '@/lib/firestore-db'
import { useAuth } from '@/components/providers/AuthProvider'

interface ReviewFormProps {
  productId: string
  orderId: string
  onSuccess?: () => void
  onCancel?: () => void
}

const MAX_IMAGES = 4

export default function ReviewForm({ productId, orderId, onSuccess, onCancel }: ReviewFormProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    if (!selected.length) return

    const remainingSlots = MAX_IMAGES - files.length
    const toAdd = selected.slice(0, remainingSlots)

    for (const f of toAdd) {
      const err = validateImage(f)
      if (err) {
        setError(err)
        return
      }
    }

    setError('')
    const nextFiles = [...files, ...toAdd]
    setFiles(nextFiles)
    setPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))])

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(previews[idx])
    setFiles(files.filter((_, i) => i !== idx))
    setPreviews(previews.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('로그인이 필요합니다.')
      return
    }
    if (!text.trim()) {
      setError('리뷰 내용을 입력해주세요.')
      return
    }
    if (text.trim().length < 5) {
      setError('리뷰 내용을 5자 이상 입력해주세요.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const imageUrls = files.length > 0 ? await uploadReviewImages(user.uid, orderId, files) : []
      await createReview({
        productId,
        orderId,
        userId: user.uid,
        userName: user.displayName,
        userImage: user.photoURL,
        rating,
        text: text.trim(),
        images: imageUrls,
      })
      previews.forEach((p) => URL.revokeObjectURL(p))
      onSuccess?.()
    } catch (err) {
      console.error('Review submit error:', err)
      setError(err instanceof Error ? err.message : '리뷰 등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">별점</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div>
        <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">리뷰 내용</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="제품에 대한 솔직한 후기를 남겨주세요."
          rows={5}
          maxLength={1000}
          className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-white placeholder:text-on-surface-variant/50 focus:border-solar-primary focus:outline-none resize-none"
        />
        <p className="text-right text-xs text-on-surface-variant mt-1">{text.length} / 1000</p>
      </div>

      <div>
        <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">
          이미지 첨부 ({files.length}/{MAX_IMAGES})
        </label>
        <div className="grid grid-cols-4 gap-2">
          {previews.map((src, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-surface-container-low">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                aria-label="이미지 제거"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ))}
          {files.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col items-center justify-center gap-1 text-on-surface-variant"
            >
              <span className="material-symbols-outlined">add_photo_alternate</span>
              <span className="text-xs">사진 추가</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesSelected}
          className="hidden"
        />
        <p className="text-xs text-on-surface-variant mt-2">최대 {MAX_IMAGES}장 · 업로드 시 자동으로 WebP로 압축됩니다</p>
      </div>

      {error && <div className="p-3 bg-red-900/30 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 bg-surface-container-high text-white font-medium py-3 rounded-xl border border-outline-variant/20 hover:bg-surface-container-highest transition-colors disabled:opacity-50"
          >
            나중에
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-solar-primary text-on-primary font-bold py-3 rounded-xl hover:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {submitting ? '등록 중...' : '리뷰 등록'}
        </button>
      </div>
    </form>
  )
}
