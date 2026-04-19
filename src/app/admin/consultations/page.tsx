'use client'

import { useEffect, useState } from 'react'
import { listConsultations, updateConsultationStatus, deleteConsultation, type ConsultationDoc } from '@/lib/firestore-db'

const STATUS_OPTIONS = ['신규', '상담중', '완료', '보류']

export default function AdminConsultations() {
  const [consultations, setConsultations] = useState<ConsultationDoc[] | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = async () => {
    const data = await listConsultations()
    setConsultations(data)
  }

  useEffect(() => {
    load().catch(console.error)
  }, [])

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id)
    try {
      await updateConsultationStatus(id, status)
      await load()
    } catch (e) {
      console.error(e)
      alert('상태 변경에 실패했습니다.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('상담 내역을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    setUpdatingId(id)
    try {
      await deleteConsultation(id)
      await load()
    } catch (e) {
      console.error(e)
      alert('삭제에 실패했습니다.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (!consultations) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white font-headline mb-8">상담 목록</h1>
        <div className="text-on-surface-variant">로딩 중...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white font-headline mb-8">상담 목록</h1>
      <div className="bg-surface-container-highest rounded-xl border border-outline-variant/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant/10">
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">이름</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">연락처</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">지역</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">건물유형</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">월요금</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">상태</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">일시</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">액션</th>
            </tr>
          </thead>
          <tbody>
            {consultations.map((c) => {
              const d = (c.createdAt as unknown as { toDate?: () => Date })?.toDate?.()
              return (
                <tr key={c.id} className="border-b border-outline-variant/5">
                  <td className="px-6 py-4 text-white font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{c.phone}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{c.region}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{c.buildingType}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{c.monthlyBill || '-'}</td>
                  <td className="px-6 py-4">
                    <select
                      value={c.status}
                      disabled={updatingId === c.id}
                      onChange={(e) => handleStatusChange(c.id, e.target.value)}
                      className="text-[10px] font-bold px-2 py-1 rounded-full bg-transparent border border-outline-variant/20 text-solar-primary"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="bg-surface text-white">{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant text-sm">{d ? d.toLocaleString('ko-KR') : '-'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={updatingId === c.id}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              )
            })}
            {consultations.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-on-surface-variant">상담 내역이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
