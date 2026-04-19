'use client'

import { useMemo } from 'react'
import { PRODUCTS } from '@/lib/products'
import { formatKRW } from '@/lib/constants'

export default function AdminProducts() {
  const products = useMemo(() => [...PRODUCTS].sort((a, b) => a.sortOrder - b.sortOrder), [])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white font-headline">상품 관리</h1>
        <p className="text-xs text-on-surface-variant">src/lib/products.ts 파일에서 관리됩니다</p>
      </div>
      <div className="bg-surface-container-highest rounded-xl border border-outline-variant/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant/10">
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">ID</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">상품명</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">가격</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">상태</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">정렬</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-outline-variant/5 hover:bg-surface-container-high/50 transition-colors">
                <td className="px-6 py-4 text-on-surface-variant text-sm font-mono">{p.id}</td>
                <td className="px-6 py-4 text-white font-medium">{p.name}</td>
                <td className="px-6 py-4 text-solar-primary font-bold">{formatKRW(p.price)}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.isActive ? 'text-solar-primary bg-solar-primary/10' : 'text-red-400 bg-red-400/10'}`}>
                    {p.isActive ? '판매중' : '비활성'}
                  </span>
                </td>
                <td className="px-6 py-4 text-on-surface-variant text-sm">{p.sortOrder}</td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">등록된 상품이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
