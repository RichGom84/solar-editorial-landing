'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { signOutFirebase } from '@/lib/firebase'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, role, loading } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToForm = () => {
    document.getElementById('consult-form')?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const handleSignOut = async () => {
    await signOutFirebase()
    window.location.href = '/'
  }

  const initial = user?.displayName?.[0] || user?.email?.[0] || '?'

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all ${
        scrolled
          ? 'bg-[#020617]/60 backdrop-blur-xl shadow-[0_0_15px_rgba(16,185,129,0.08)]'
          : 'bg-transparent'
      }`}
    >
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-emerald-400 font-headline">
          Solar Editorial
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#services" className="text-slate-400 font-medium hover:text-emerald-300 transition-colors text-sm">Technology</a>
          <a href="#cases" className="text-slate-400 font-medium hover:text-emerald-300 transition-colors text-sm">Cases</a>
          <Link href="/products" className="text-slate-400 font-medium hover:text-emerald-300 transition-colors text-sm">Products</Link>
          <a href="#faq" className="text-slate-400 font-medium hover:text-emerald-300 transition-colors text-sm">FAQ</a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <div className="w-20 h-8" />
          ) : user ? (
            <>
              <Link href="/mypage" className="text-slate-400 hover:text-emerald-300 transition-colors text-sm font-medium">마이페이지</Link>
              {role === 'ADMIN' && (
                <Link href="/admin" className="text-slate-400 hover:text-emerald-300 transition-colors text-sm font-medium">관리자</Link>
              )}
              <button onClick={handleSignOut} className="text-slate-400 hover:text-red-400 transition-colors text-sm font-medium">로그아웃</button>
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">
                {initial}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-400 hover:text-emerald-300 transition-colors text-sm font-medium">로그인</Link>
              <Link href="/register" className="bg-solar-primary text-on-primary px-5 py-2 rounded-lg font-bold text-sm hover:scale-95 transition-transform shadow-[0_0_15px_rgba(78,222,163,0.3)]">
                회원가입
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
          <span className="material-symbols-outlined text-2xl">{menuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#020617]/95 backdrop-blur-xl border-t border-slate-800/50 px-8 py-4 space-y-3">
          <a href="#services" onClick={() => setMenuOpen(false)} className="block text-slate-400 hover:text-white py-2">Technology</a>
          <a href="#cases" onClick={() => setMenuOpen(false)} className="block text-slate-400 hover:text-white py-2">Cases</a>
          <Link href="/products" onClick={() => setMenuOpen(false)} className="block text-slate-400 hover:text-white py-2">Products</Link>
          <a href="#faq" onClick={() => setMenuOpen(false)} className="block text-slate-400 hover:text-white py-2">FAQ</a>
          <hr className="border-slate-800" />
          {user ? (
            <>
              <Link href="/mypage" onClick={() => setMenuOpen(false)} className="block text-slate-400 hover:text-white py-2">마이페이지</Link>
              {role === 'ADMIN' && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="block text-slate-400 hover:text-white py-2">관리자</Link>
              )}
              <button onClick={handleSignOut} className="block text-red-400 py-2">로그아웃</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block text-slate-400 hover:text-white py-2">로그인</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="block text-solar-primary font-bold py-2">회원가입</Link>
            </>
          )}
          <button onClick={scrollToForm} className="w-full bg-solar-primary text-on-primary py-3 rounded-lg font-bold mt-2">Consultation</button>
        </div>
      )}
    </nav>
  )
}
