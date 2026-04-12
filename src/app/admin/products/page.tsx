import { prisma } from '@/lib/prisma'
import { formatKRW } from '@/lib/constants'

export default async function AdminProducts() {
  const products = prisma ? await prisma.product.findMany({ orderBy: { sortOrder: 'asc' } }) : []

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white font-headline">상품 관리</h1>
      </div>
      <div className="bg-surface-container-highest rounded-xl border border-outline-variant/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant/10">
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">상품명</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">가격</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">상태</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">등록일</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-outline-variant/5 hover:bg-surface-container-high/50 transition-colors">
                <td className="px-6 py-4 text-white font-medium">{p.name}</td>
                <td className="px-6 py-4 text-solar-primary font-bold">{formatKRW(p.price)}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.isActive ? 'text-solar-primary bg-solar-primary/10' : 'text-red-400 bg-red-400/10'}`}>
                    {p.isActive ? '판매중' : '비활성'}
                  </span>
                </td>
                <td className="px-6 py-4 text-on-surface-variant text-sm">{new Date(p.createdAt).toLocaleDateString('ko-KR')}</td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant">등록된 상품이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
