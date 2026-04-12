import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const adminLinks = [
  { href: '/admin', icon: 'dashboard', label: '대시보드' },
  { href: '/admin/products', icon: 'inventory_2', label: '상품 관리' },
  { href: '/admin/orders', icon: 'receipt_long', label: '주문 관리' },
  { href: '/admin/users', icon: 'group', label: '회원 관리' },
  { href: '/admin/consultations', icon: 'forum', label: '상담 목록' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) redirect('/login')
  if ((session.user as { role?: string }).role !== 'ADMIN') redirect('/')

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container-low border-r border-outline-variant/10 p-6 hidden md:block">
        <Link href="/" className="text-lg font-bold text-emerald-400 font-headline tracking-tighter block mb-8">
          Solar Admin
        </Link>
        <nav className="space-y-1">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-lg">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
