import Link from 'next/link'
import { formatKRW } from '@/lib/constants'

interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  image?: string | null
}

export default function ProductCard({ id, name, description, price, image }: ProductCardProps) {
  return (
    <Link href={`/products/${id}`} className="group">
      <div className="bg-surface-container-highest rounded-2xl border border-outline-variant/10 overflow-hidden hover:border-solar-primary/30 transition-all">
        <div className="h-48 bg-gradient-to-br from-solar-primary-container/20 to-surface-container-lowest/80 flex items-center justify-center">
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-solar-primary text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              solar_power
            </span>
          )}
        </div>
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-solar-primary transition-colors">{name}</h3>
          <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">{description}</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-solar-primary">{formatKRW(price)}</span>
            <span className="text-sm text-on-surface-variant group-hover:text-solar-primary transition-colors">자세히 보기 →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
