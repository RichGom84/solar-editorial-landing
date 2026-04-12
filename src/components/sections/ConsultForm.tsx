'use client'

import { useState } from 'react'

export default function ConsultForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    region: '',
    buildingType: '',
    monthlyBill: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) setSubmitted(true)
    } catch {
      alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <section id="consult-form" className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-8">
          <div className="bg-surface-container-low rounded-[2rem] border border-solar-primary/20 p-16 text-center shadow-[0_0_50px_rgba(16,185,129,0.05)]">
            <span className="material-symbols-outlined text-solar-primary text-6xl mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <h2 className="text-3xl font-bold font-headline text-white mb-4">상담 신청이 완료되었습니다!</h2>
            <p className="text-on-surface-variant text-lg">
              전문 상담사가 24시간 이내에 연락드리겠습니다.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const inputClass = "w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-white placeholder:text-on-surface-variant/50 focus:border-solar-primary focus:ring-0 focus:outline-none transition-colors"

  return (
    <section id="consult-form" className="py-24 bg-surface relative">
      <div className="max-w-7xl mx-auto px-8">
        <div className="bg-surface-container-low rounded-[2rem] border border-solar-primary/20 overflow-hidden flex flex-col lg:flex-row shadow-[0_0_50px_rgba(16,185,129,0.05)]">
          {/* Left: Info */}
          <div className="lg:w-1/2 p-12 lg:p-16 flex flex-col justify-center bg-gradient-to-br from-solar-primary-container/10 to-transparent">
            <h2 className="text-4xl font-bold font-headline text-white mb-6">
              지금 바로 상담받고<br />
              <span className="text-solar-primary">전기세 공포</span>에서 벗어나세요
            </h2>
            <p className="text-on-surface-variant mb-8 leading-relaxed">
              전문 상담사가 24시간 이내에 연락드려 보조금 가능 여부와 예상 절감액을 무료로 진단해 드립니다.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-solar-primary">check_circle</span>
                <span className="text-sm font-medium text-on-surface">실시간 정부 보조금 잔여 현황 확인</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-solar-primary">check_circle</span>
                <span className="text-sm font-medium text-on-surface">우리 집 맞춤형 3D 배치 설계</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-solar-primary">check_circle</span>
                <span className="text-sm font-medium text-on-surface">예상 절감액 무료 시뮬레이션</span>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:w-1/2 p-12 lg:p-16 bg-surface-container-highest">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">
                    성함 *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="홍길동"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">
                    연락처 *
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    placeholder="010-0000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">
                  설치 희망 주소 *
                </label>
                <input
                  name="region"
                  type="text"
                  required
                  placeholder="예: 서울특별시 강남구..."
                  value={formData.region}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">
                    건물 유형 *
                  </label>
                  <select
                    name="buildingType"
                    required
                    value={formData.buildingType}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">선택해주세요</option>
                    <option value="단독주택">단독주택</option>
                    <option value="다가구주택">다가구주택</option>
                    <option value="상가건물">상가건물</option>
                    <option value="공장">공장</option>
                    <option value="농업용">농업용</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">
                    월평균 전기요금
                  </label>
                  <select
                    name="monthlyBill"
                    value={formData.monthlyBill}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">선택해주세요</option>
                    <option value="5만원 미만">5만원 미만</option>
                    <option value="5만원 ~ 10만원">5만원 ~ 10만원</option>
                    <option value="10만원 ~ 20만원">10만원 ~ 20만원</option>
                    <option value="20만원 이상">20만원 이상</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">
                  문의 내용
                </label>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="궁금한 점이 있으시면 자유롭게 적어주세요"
                  value={formData.message}
                  onChange={handleChange}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-solar-primary text-on-primary font-bold py-4 rounded-xl text-lg shadow-[0_0_20px_rgba(78,222,163,0.3)] hover:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {loading ? '신청 중...' : '상담 신청하기'}
              </button>

              <p className="text-[10px] text-center text-on-surface-variant/50">
                입력하신 정보는 상담 목적으로만 사용되며, 제3자에게 제공되지 않습니다.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
