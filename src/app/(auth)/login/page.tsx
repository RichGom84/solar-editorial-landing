'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SocialButtons from '@/components/auth/SocialButtons'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const inputClass = "w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-white placeholder:text-on-surface-variant/50 focus:border-solar-primary focus:ring-0 focus:outline-none transition-colors"

  return (
    <div className="bg-surface-container-highest rounded-2xl p-8 border border-outline-variant/10">
      <h1 className="text-2xl font-bold text-white text-center mb-6 font-headline">로그인</h1>

      <SocialButtons />

      <div className="flex items-center my-6">
        <div className="flex-1 h-px bg-outline-variant/20" />
        <span className="px-4 text-xs text-on-surface-variant">또는</span>
        <div className="flex-1 h-px bg-outline-variant/20" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-900/30 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">이메일</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className={inputClass} />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">비밀번호</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-solar-primary text-on-primary font-bold py-3 rounded-xl hover:scale-[0.98] transition-transform disabled:opacity-50">
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p className="text-center text-sm text-on-surface-variant mt-6">
        계정이 없으신가요?{' '}
        <Link href="/register" className="text-solar-primary hover:underline font-medium">회원가입</Link>
      </p>
    </div>
  )
}
