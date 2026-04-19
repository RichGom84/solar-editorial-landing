'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'

const adminLinks = [
  { href: '/admin', icon: 'dashboard', label: '대시보드' },
  { href: '/admin/products', icon: 'inventory_2', label: '상품 관리' },
  { href: '/admin/orders', icon: 'receipt_long', label: '주문 관리' },
  { href: '/admin/users', icon: 'group', label: '회원 관리' },
  { href: '/admin/consultations', icon: 'forum', label: '상담 목록' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (role !== 'ADMIN') {
      router.replace('/')
    }
  }, [loading, user, role, router])

  if (loading || !user || role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface-variant">
        {loading ? '인증 확인 중...' : '접근 권한 확인 중...'}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex">
      <aside className="w-64 bg-surface-container-low border-r border-outline-variant/10 p-6 hidden md:block">
        <Link href="/" className="text-lg font-bold text-emerald-400 font-headline tracking-tighter block mb-8">
          Solar Admin
        </Link>
        <nav className="space-y-1">
          {adminLinks.map((link) => {
            const active = pathname === link.href || (link.href !== '/admin' && pathname?.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                  active
                    ? 'bg-solar-primary/10 text-solar-primary'
                    : 'text-on-surface-variant hover:text-white hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
