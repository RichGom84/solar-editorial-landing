import { prisma } from '@/lib/prisma'
import { formatKRW } from '@/lib/constants'

export default async function AdminOrders() {
  const orders = prisma
    ? await prisma.order.findMany({
        include: { user: true, product: true },
        orderBy: { createdAt: 'desc' },
      })
    : []

  const statusLabel: Record<string, { text: string; color: string }> = {
    PENDING: { text: '대기중', color: 'text-yellow-400 bg-yellow-400/10' },
    PAID: { text: '결제완료', color: 'text-solar-primary bg-solar-primary/10' },
    CANCELLED: { text: '취소됨', color: 'text-red-400 bg-red-400/10' },
    REFUNDED: { text: '환불됨', color: 'text-orange-400 bg-orange-400/10' },
    FAILED: { text: '실패', color: 'text-red-400 bg-red-400/10' },
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white font-headline mb-8">주문 관리</h1>
      <div className="bg-surface-container-highest rounded-xl border border-outline-variant/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant/10">
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">주문자</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">상품</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">금액</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">상태</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">일시</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-outline-variant/5">
                <td className="px-6 py-4 text-white">{o.user.name || o.user.email}</td>
                <td className="px-6 py-4 text-on-surface-variant">{o.product.name}</td>
                <td className="px-6 py-4 text-solar-primary font-bold">{formatKRW(o.amount)}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusLabel[o.status]?.color}`}>
                    {statusLabel[o.status]?.text}
                  </span>
                </td>
                <td className="px-6 py-4 text-on-surface-variant text-sm">{new Date(o.createdAt).toLocaleDateString('ko-KR')}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">주문 내역이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
