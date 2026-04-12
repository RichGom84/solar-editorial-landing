export default function Problem() {
  const problems = [
    {
      icon: 'trending_up',
      iconBg: 'bg-error-container/20',
      iconColor: 'text-red-400',
      title: '매달 오르는 전기요금',
      description: '누진세 걱정에 마음 놓고 에어컨도 켜지 못하는 현실, 태양광이 유일한 해답입니다.',
    },
    {
      icon: 'description',
      iconBg: 'bg-solar-primary-container/20',
      iconColor: 'text-solar-primary',
      title: '복잡한 정부 보조금',
      description: '지자체별로 다른 정책과 복잡한 서류 절차, 전문가가 아니면 챙기기 어렵습니다.',
    },
    {
      icon: 'gpp_maybe',
      iconBg: 'bg-secondary-container/20',
      iconColor: 'text-solar-secondary',
      title: '믿기 힘든 시공 업체',
      description: '부실 시공과 사라지는 업체들 사이에서 사후 관리까지 책임질 파트너가 필요합니다.',
    },
  ]

  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <span className="uppercase tracking-wider text-[10px] text-solar-primary font-bold mb-4 block">
            Problem
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-white">
            왜 태양광 설치를 망설이시나요?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((item, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-surface-container-highest border border-outline-variant/10 hover:border-solar-primary/30 transition-all"
            >
              <div className={`w-12 h-12 rounded-lg ${item.iconBg} flex items-center justify-center mb-6 ${item.iconColor}`}>
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">{item.title}</h3>
              <p className="text-on-surface-variant leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
