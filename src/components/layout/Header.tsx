'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { signOutFirebase } from '@/lib/firebase'

export default function Header() {
  const { user, role } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: '홈' },
    { href: '/products', label: '상품' },
  ]

  const handleSignOut = async () => {
    await signOutFirebase()
    window.location.href = '/'
  }

  const initial = user?.displayName?.[0] || user?.email?.[0] || '?'

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="text-xl font-bold tracking-tighter text-emerald-400 font-headline">
          Solar Editorial
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-slate-400 hover:text-emerald-300 transition-colors text-sm font-medium">
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/mypage" className="text-slate-400 hover:text-emerald-300 transition-colors text-sm font-medium">
                마이페이지
              </Link>
              {role === 'ADMIN' && (
                <Link href="/admin" className="text-slate-400 hover:text-emerald-300 transition-colors text-sm font-medium">
                  관리자
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="text-slate-400 hover:text-red-400 transition-colors text-sm font-medium"
              >
                로그아웃
              </button>
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">
                {initial}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-slate-400 hover:text-emerald-300 transition-colors text-sm font-medium">
                로그인
              </Link>
              <Link href="/register" className="bg-solar-primary text-on-primary px-5 py-2 rounded-lg font-bold text-sm hover:scale-95 transition-transform">
                회원가입
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
          <span className="material-symbols-outlined text-2xl">{menuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface-container border-t border-outline-variant/10 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block text-on-surface-variant hover:text-white transition-colors py-2">
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/mypage" onClick={() => setMenuOpen(false)} className="block text-on-surface-variant hover:text-white transition-colors py-2">마이페이지</Link>
              {role === 'ADMIN' && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="block text-on-surface-variant hover:text-white transition-colors py-2">관리자</Link>
              )}
              <button onClick={handleSignOut} className="block text-red-400 py-2">로그아웃</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block text-on-surface-variant hover:text-white transition-colors py-2">로그인</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="block text-solar-primary font-bold py-2">회원가입</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
