'use client'

export default function Solution() {
  const features = [
    { icon: 'assignment_turned_in', title: 'Subsidy Management', desc: '최대 보조금 수령을 위한 행정 절차 100% 대행' },
    { icon: 'engineering', title: 'Professional Install', desc: '자체 전문 시공팀의 정밀 시공 및 구조 검토' },
    { icon: 'verified', title: 'Long-term A/S', desc: '25년 효율 보증 및 연 1회 정기 방문 점검' },
  ]

  return (
    <section id="services" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="uppercase tracking-wider text-[10px] text-solar-primary font-bold mb-4 block">
              Our Excellence
            </span>
            <h2 className="text-3xl md:text-5xl font-bold font-headline text-white leading-tight">
              프리미엄 서비스의<br />기준을 세웁니다
            </h2>
          </div>
          <p className="text-on-surface-variant max-w-sm">
            단순 설치를 넘어 에너지 자립을 위한 토탈 솔루션을 제공합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Large Feature Card */}
          <div className="relative overflow-hidden rounded-3xl group h-[400px] bg-surface-container-highest">
            <div className="absolute inset-0 bg-gradient-to-br from-solar-primary-container/20 to-surface-container-lowest/80" />
            <div className="absolute inset-0 p-10 flex flex-col justify-end">
              <h3 className="text-2xl font-bold text-white mb-2">Custom Design</h3>
              <p className="text-on-surface-variant">
                건축물의 심미성을 해치지 않는 맞춤형 프레임과 배치 설계
              </p>
            </div>
          </div>

          {/* Grid of Small Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((item, i) => (
              <div key={i} className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10">
                <span
                  className="material-symbols-outlined text-solar-primary mb-4 text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {item.icon}
                </span>
                <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                <p className="text-sm text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
            <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 flex items-center justify-center">
              <button
                onClick={() => document.getElementById('consult-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-solar-primary font-bold hover:underline transition-all"
              >
                전체 서비스 보기 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
