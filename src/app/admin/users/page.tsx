import { prisma } from '@/lib/prisma'

export default async function AdminUsers() {
  const users = prisma
    ? await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { orders: true } } },
      })
    : []

  return (
    <div>
      <h1 className="text-2xl font-bold text-white font-headline mb-8">회원 관리</h1>
      <div className="bg-surface-container-highest rounded-xl border border-outline-variant/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant/10">
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">이름</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">이메일</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">역할</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">주문수</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">가입일</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-outline-variant/5">
                <td className="px-6 py-4 text-white font-medium">{u.name || '-'}</td>
                <td className="px-6 py-4 text-on-surface-variant">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'text-yellow-400 bg-yellow-400/10' : 'text-on-surface-variant bg-surface-container-high'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-on-surface-variant">{u._count.orders}</td>
                <td className="px-6 py-4 text-on-surface-variant text-sm">{new Date(u.createdAt).toLocaleDateString('ko-KR')}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">회원이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
