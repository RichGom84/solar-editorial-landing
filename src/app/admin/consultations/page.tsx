import { prisma } from '@/lib/prisma'

export default async function AdminConsultations() {
  const consultations = prisma
    ? await prisma.consultation.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      })
    : []

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
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">상태</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-on-surface-variant tracking-widest">일시</th>
            </tr>
          </thead>
          <tbody>
            {consultations.map((c) => (
              <tr key={c.id} className="border-b border-outline-variant/5">
                <td className="px-6 py-4 text-white font-medium">{c.name}</td>
                <td className="px-6 py-4 text-on-surface-variant">{c.phone}</td>
                <td className="px-6 py-4 text-on-surface-variant">{c.region}</td>
                <td className="px-6 py-4 text-on-surface-variant">{c.buildingType}</td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-solar-primary bg-solar-primary/10">{c.status}</span>
                </td>
                <td className="px-6 py-4 text-on-surface-variant text-sm">{new Date(c.createdAt).toLocaleDateString('ko-KR')}</td>
              </tr>
            ))}
            {consultations.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">상담 내역이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
