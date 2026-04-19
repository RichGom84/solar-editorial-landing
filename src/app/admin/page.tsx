'use client'

import { useEffect, useState } from 'react'
import { collection, getCountFromServer, getDocs, query, where } from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/firestore-db'
import { formatKRW } from '@/lib/constants'
import { getProducts } from '@/lib/products'

type Stats = {
  userCount: number
  productCount: number
  orderCount: number
  consultCount: number
  revenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const [userSnap, orderSnap, consultSnap, paidSnap] = await Promise.all([
          getCountFromServer(collection(firestore, COLLECTIONS.users)),
          getCountFromServer(collection(firestore, COLLECTIONS.orders)),
          getCountFromServer(collection(firestore, COLLECTIONS.consultations)),
          getDocs(query(collection(firestore, COLLECTIONS.orders), where('status', '==', 'PAID'))),
        ])

        const revenue = paidSnap.docs.reduce((sum, d) => sum + Number((d.data() as { amount?: number }).amount || 0), 0)

        setStats({
          userCount: userSnap.data().count,
          productCount: getProducts().length,
          orderCount: orderSnap.data().count,
          consultCount: consultSnap.data().count,
          revenue,
        })
      } catch (e) {
        console.error('Dashboard load error:', e)
        setError('통계를 불러오지 못했습니다.')
      }
    })()
  }, [])

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white font-headline mb-8">대시보드</h1>
        <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-6 text-center text-red-400">{error}</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white font-headline mb-8">대시보드</h1>
        <div className="text-on-surface-variant">로딩 중...</div>
      </div>
    )
  }

  const cards = [
    { label: '총 회원수', value: stats.userCount.toString(), icon: 'group', color: 'text-blue-400' },
    { label: '등록 상품', value: stats.productCount.toString(), icon: 'inventory_2', color: 'text-emerald-400' },
    { label: '총 주문수', value: stats.orderCount.toString(), icon: 'receipt_long', color: 'text-purple-400' },
    { label: '총 매출', value: formatKRW(stats.revenue), icon: 'payments', color: 'text-yellow-400' },
    { label: '상담 신청', value: stats.consultCount.toString(), icon: 'forum', color: 'text-orange-400' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-white font-headline mb-8">대시보드</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((stat) => (
          <div key={stat.label} className="bg-surface-container-highest rounded-xl p-6 border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-3">
              <span className={`material-symbols-outlined ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {stat.icon}
              </span>
              <span className="text-sm text-on-surface-variant">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
