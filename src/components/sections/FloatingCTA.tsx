'use client'

import { useEffect, useState } from 'react'

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 800)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToForm = () => {
    document.getElementById('consult-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#020617]/90 backdrop-blur-xl border-t border-slate-800/50 md:hidden transition-transform ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <button
        onClick={scrollToForm}
        className="w-full py-3.5 text-base font-bold text-on-primary bg-solar-primary rounded-xl hover:scale-[0.98] transition-transform shadow-[0_0_15px_rgba(78,222,163,0.3)]"
      >
        무료 상담 신청하기
      </button>
    </div>
  )
}
