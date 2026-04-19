'use client'

interface StarRatingProps {
  value: number
  onChange?: (v: number) => void
  size?: 'sm' | 'md' | 'lg'
  readOnly?: boolean
}

const SIZES = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-3xl',
}

export default function StarRating({ value, onChange, size = 'md', readOnly }: StarRatingProps) {
  const interactive = !readOnly && !!onChange

  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(n)}
            className={`${SIZES[size]} leading-none transition-colors ${
              filled ? 'text-yellow-400' : 'text-outline-variant/30'
            } ${interactive ? 'hover:text-yellow-300 cursor-pointer' : 'cursor-default'}`}
            aria-label={`${n}점`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}
