import { getProducts } from '@/lib/products'
import ProductCard from '@/components/products/ProductCard'

export const metadata = { title: '상품' }

export default function ProductsPage() {
  const products = getProducts()

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-12">
        <span className="uppercase tracking-wider text-[10px] text-solar-primary font-bold mb-4 block">Products</span>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-white">태양광 패키지</h1>
        <p className="text-on-surface-variant mt-3">우리 집에 맞는 최적의 태양광 패키지를 선택하세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  )
}
