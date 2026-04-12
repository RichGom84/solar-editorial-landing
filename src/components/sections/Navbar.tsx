'use client'

import { useEffect, useState } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToForm = () => {
    document.getElementById('consult-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all ${
        scrolled
          ? 'bg-[#020617]/60 backdrop-blur-xl shadow-[0_0_15px_rgba(16,185,129,0.08)]'
          : 'bg-transparent'
      }`}
    >
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tighter text-emerald-400 font-headline">
          Solar Editorial
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#services" className="text-slate-400 font-medium hover:text-emerald-300 transition-colors text-sm">
            Technology
          </a>
          <a href="#cases" className="text-slate-400 font-medium hover:text-emerald-300 transition-colors text-sm">
            Cases
          </a>
          <a href="#benefits" className="text-slate-400 font-medium hover:text-emerald-300 transition-colors text-sm">
            Subsidies
          </a>
          <a href="#faq" className="text-slate-400 font-medium hover:text-emerald-300 transition-colors text-sm">
            FAQ
          </a>
        </div>
        <button
          onClick={scrollToForm}
          className="bg-solar-primary text-on-primary px-6 py-2 rounded-lg font-bold hover:scale-95 transition-transform active:opacity-80 shadow-[0_0_15px_rgba(78,222,163,0.3)]"
        >
          Consultation
        </button>
      </div>
    </nav>
  )
}
