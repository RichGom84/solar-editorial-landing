'use client'

import { useEffect, useState } from 'react'
import { listOrders, updateOrderStatus, type OrderDoc, type OrderStatus } from '@/lib/firestore-db'
import { formatKRW } from '@/lib/constants'

const statusLabel: Record<OrderStatus, { text: string; color: string }> = {
  PENDING: { text: '대기중', color: 'text-yellow-400 bg-yellow-400/10' },
  PAID: { text: '결제완료', color: 'text-solar-primary bg-solar-primary/10' },
  CANCELLED: { text: '취소됨', color: 'text-red-400 bg-red-400/10' },
  REFUNDED: { text: '환불됨', color: 'text-orange-400 bg-orange-400/10' },
  FAILED: { text: '실패', color: 'text-red-400 bg-red-400/10' },
}

const STATUS_OPTIONS: OrderStatus[] = ['PENDING', 'PAID', 'CANCELLED', 'REFUNDED', 'FAILED']

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderDoc[] | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = async () => {
    const data = await listOrders()
    setOrders(data)
  }

  useEffect(() => {
    load().catch(console.error)
  }, [])

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    setUpdatingId(id)
    try {
      await updateOrderStatus(id, status)
      await load()
    } catch (e) {
      console.error(e)
      alert('상태 변경에 실패했습니다.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (!orders) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white font-headline mb-8">주문 관리</h1>
        <div className="text-on-surface-variant">로딩 중...</div>
      </div>
    )
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
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">결제수단</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">상태</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">일시</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const d = (o.createdAt as unknown as { toDate?: () => Date })?.toDate?.()
              return (
                <tr key={o.id} className="border-b border-outline-variant/5">
                  <td className="px-6 py-4 text-white">{o.userName || o.userEmail || o.userId.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{o.productName || o.productId}</td>
                  <td className="px-6 py-4 text-solar-primary font-bold">{formatKRW(o.amount)}</td>
                  <td className="px-6 py-4 text-on-surface-variant text-sm">{o.method || '-'}</td>
                  <td className="px-6 py-4">
                    <select
                      value={o.status}
                      disabled={updatingId === o.id}
                      onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-full bg-transparent border border-outline-variant/20 ${statusLabel[o.status]?.color}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="bg-surface text-white">
                          {statusLabel[s].text}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant text-sm">{d ? d.toLocaleString('ko-KR') : '-'}</td>
                </tr>
              )
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">주문 내역이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
