import { prisma } from '@/lib/prisma'
import { formatKRW } from '@/lib/constants'

export default async function AdminDashboard() {
  if (!prisma) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white font-headline mb-8">대시보드</h1>
        <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-xl p-6 text-center">
          <p className="text-yellow-400">데이터베이스가 연결되지 않았습니다.</p>
        </div>
      </div>
    )
  }

  const [userCount, productCount, orderCount, consultCount, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.consultation.count(),
    prisma.order.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
  ])

  const stats = [
    { label: '총 회원수', value: userCount.toString(), icon: 'group', color: 'text-blue-400' },
    { label: '등록 상품', value: productCount.toString(), icon: 'inventory_2', color: 'text-emerald-400' },
    { label: '총 주문수', value: orderCount.toString(), icon: 'receipt_long', color: 'text-purple-400' },
    { label: '총 매출', value: formatKRW(revenue._sum.amount || 0), icon: 'payments', color: 'text-yellow-400' },
    { label: '상담 신청', value: consultCount.toString(), icon: 'forum', color: 'text-orange-400' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-white font-headline mb-8">대시보드</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface-container-highest rounded-xl p-6 border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-3">
              <span className={`material-symbols-outlined ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
              <span className="text-sm text-on-surface-variant">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
