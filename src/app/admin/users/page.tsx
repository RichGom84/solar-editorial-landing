'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { listUsers, updateUserRole, type UserDoc, type Role } from '@/lib/firestore-db'

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserDoc[] | null>(null)
  const [updatingUid, setUpdatingUid] = useState<string | null>(null)

  const load = async () => {
    const data = await listUsers()
    setUsers(data)
  }

  useEffect(() => {
    load().catch(console.error)
  }, [])

  const handleRoleChange = async (uid: string, role: Role) => {
    if (uid === currentUser?.uid && role === 'USER') {
      if (!confirm('본인 권한을 USER로 변경하시겠습니까? 관리자 페이지 접근이 불가능해집니다.')) return
    }
    setUpdatingUid(uid)
    try {
      await updateUserRole(uid, role)
      await load()
    } catch (e) {
      console.error(e)
      alert('권한 변경에 실패했습니다.')
    } finally {
      setUpdatingUid(null)
    }
  }

  if (!users) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white font-headline mb-8">회원 관리</h1>
        <div className="text-on-surface-variant">로딩 중...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white font-headline mb-8">회원 관리</h1>
      <div className="bg-surface-container-highest rounded-xl border border-outline-variant/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant/10">
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">이름</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">이메일</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">UID</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">역할</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">가입일</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const d = (u.createdAt as unknown as { toDate?: () => Date })?.toDate?.()
              return (
                <tr key={u.uid} className="border-b border-outline-variant/5">
                  <td className="px-6 py-4 text-white font-medium">{u.name || '-'}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{u.email || '-'}</td>
                  <td className="px-6 py-4 text-on-surface-variant text-xs font-mono">{u.uid.slice(0, 10)}...</td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      disabled={updatingUid === u.uid}
                      onChange={(e) => handleRoleChange(u.uid, e.target.value as Role)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-full bg-transparent border border-outline-variant/20 ${u.role === 'ADMIN' ? 'text-yellow-400' : 'text-on-surface-variant'}`}
                    >
                      <option value="USER" className="bg-surface text-white">USER</option>
                      <option value="ADMIN" className="bg-surface text-white">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant text-sm">{d ? d.toLocaleDateString('ko-KR') : '-'}</td>
                </tr>
              )
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">회원이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
