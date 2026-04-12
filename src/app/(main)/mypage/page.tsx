import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatKRW } from '@/lib/constants'

export const metadata = { title: '마이페이지' }

export default async function MyPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const orders = prisma
    ? await prisma.order.findMany({
        where: { userId: session.user.id },
        include: { product: true },
        orderBy: { createdAt: 'desc' },
      })
    : []

  const consultations = prisma
    ? await prisma.consultation.findMany({
        where: { userId: session.user.id },
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
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Profile */}
      <div className="bg-surface-container-highest rounded-2xl p-8 border border-outline-variant/10 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-solar-primary/20 flex items-center justify-center text-solar-primary text-2xl font-bold">
            {session.user.name?.[0] || '?'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{session.user.name}</h1>
            <p className="text-on-surface-variant text-sm">{session.user.email}</p>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-solar-primary">receipt_long</span>
          주문 내역
        </h2>
        {orders.length === 0 ? (
          <div className="bg-surface-container-low rounded-xl p-8 text-center text-on-surface-variant border border-outline-variant/10">
            주문 내역이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{order.product.name}</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {new Date(order.createdAt).toLocaleDateString('ko-KR')} · {order.method || '-'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{formatKRW(order.amount)}</p>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusLabel[order.status]?.color}`}>
                    {statusLabel[order.status]?.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Consultations */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-solar-primary">forum</span>
          상담 내역
        </h2>
        {consultations.length === 0 ? (
          <div className="bg-surface-container-low rounded-xl p-8 text-center text-on-surface-variant border border-outline-variant/10">
            상담 내역이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {consultations.map((c) => (
              <div key={c.id} className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium">{c.region} · {c.buildingType}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-solar-primary bg-solar-primary/10">{c.status}</span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  {new Date(c.createdAt).toLocaleDateString('ko-KR')} · {c.monthlyBill || '-'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
