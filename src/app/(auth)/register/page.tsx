'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SocialButtons from '@/components/auth/SocialButtons'
import { registerWithEmail } from '@/lib/firebase'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (form.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    setLoading(true)
    try {
      await registerWithEmail(form.email, form.password, form.name)
      router.push('/')
      router.refresh()
    } catch (err) {
      const code = (err as { code?: string })?.code
      if (code === 'auth/email-already-in-use') {
        setError('이미 가입된 이메일입니다.')
      } else if (code === 'auth/invalid-email') {
        setError('이메일 형식이 올바르지 않습니다.')
      } else if (code === 'auth/weak-password') {
        setError('비밀번호는 6자 이상이어야 합니다.')
      } else {
        setError('회원가입 중 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-white placeholder:text-on-surface-variant/50 focus:border-solar-primary focus:ring-0 focus:outline-none transition-colors"

  return (
    <div className="bg-surface-container-highest rounded-2xl p-8 border border-outline-variant/10">
      <h1 className="text-2xl font-bold text-white text-center mb-6 font-headline">회원가입</h1>

      <SocialButtons />

      <div className="flex items-center my-6">
        <div className="flex-1 h-px bg-outline-variant/20" />
        <span className="px-4 text-xs text-on-surface-variant">또는</span>
        <div className="flex-1 h-px bg-outline-variant/20" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-900/30 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
        )}
        <div>
          <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">이름</label>
          <input name="name" type="text" required value={form.name} onChange={handleChange} placeholder="홍길동" className={inputClass} />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">이메일</label>
          <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="email@example.com" className={inputClass} />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">비밀번호</label>
          <input name="password" type="password" required minLength={6} value={form.password} onChange={handleChange} placeholder="6자 이상" className={inputClass} />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">비밀번호 확인</label>
          <input name="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange} placeholder="비밀번호 재입력" className={inputClass} />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-solar-primary text-on-primary font-bold py-3 rounded-xl hover:scale-[0.98] transition-transform disabled:opacity-50">
          {loading ? '가입 중...' : '회원가입'}
        </button>
      </form>

      <p className="text-center text-sm text-on-surface-variant mt-6">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-solar-primary hover:underline font-medium">로그인</Link>
      </p>
    </div>
  )
}
