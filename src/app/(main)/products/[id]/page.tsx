import { getProductById, getProducts } from '@/lib/products'
import { notFound } from 'next/navigation'
import { formatKRW } from '@/lib/constants'
import PaymentButton from '@/components/products/PaymentButton'
import Link from 'next/link'

export function generateStaticParams() {
  return getProducts().map((p) => ({ id: p.id }))
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = getProductById(id)
  if (!product) notFound()

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link href="/products" className="text-on-surface-variant hover:text-solar-primary transition-colors text-sm inline-flex items-center gap-1">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        상품 목록
      </Link>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="h-80 lg:h-[400px] bg-gradient-to-br from-solar-primary-container/20 to-surface-container-lowest/80 rounded-2xl flex items-center justify-center">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <div className="text-center">
              <span className="material-symbols-outlined text-solar-primary text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                solar_power
              </span>
              <p className="text-on-surface-variant text-sm mt-3">{product.name}</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="inline-block px-3 py-1 bg-solar-primary-container/20 text-solar-primary text-[10px] font-bold tracking-wider uppercase rounded mb-4">
              {product.price === 100 ? 'Test Product' : product.price === 490000 ? 'Standard' : 'Premium'}
            </span>
            <h1 className="text-3xl font-bold text-white font-headline mb-4">{product.name}</h1>
            <div className="text-4xl font-bold text-solar-primary mb-6">{formatKRW(product.price)}</div>
            <div className="text-on-surface-variant leading-relaxed whitespace-pre-line text-sm">{product.description}</div>
          </div>

          <div className="mt-8 space-y-4">
            <PaymentButton productId={product.id} productName={product.name} price={product.price} />
            <div className="flex items-center justify-center gap-6 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-solar-primary">verified</span>
                안전 결제
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-solar-primary">lock</span>
                토스페이먼츠
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-solar-primary">support_agent</span>
                A/S 보증
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
