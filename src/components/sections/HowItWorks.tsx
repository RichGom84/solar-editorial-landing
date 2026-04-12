export default function HowItWorks() {
  const steps = [
    { num: '01', title: '상담 및 진단', desc: '현장 방문 및 전기 사용량 패턴 분석' },
    { num: '02', title: '맞춤 설계', desc: '최적의 효율을 위한 모듈 배치안 확정' },
    { num: '03', title: '행정 절차', desc: '지자체 보조금 신청 및 인허가 진행' },
    { num: '04', title: '책임 시공', desc: '안전하고 정밀한 전문가 설치 완료' },
    { num: '05', title: '사후 관리', desc: '모니터링 서비스 가동 및 정기 점검', isLast: true },
  ]

  return (
    <section className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="text-center text-3xl font-bold font-headline mb-20 text-white">
          설치 프로세스
        </h2>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-outline-variant/30 -translate-y-1/2 hidden lg:block" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-4 relative">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 relative z-10 transition-transform group-hover:scale-110 ${
                    step.isLast
                      ? 'bg-solar-primary shadow-[0_0_15px_rgba(78,222,163,0.4)]'
                      : 'bg-surface-container-high border-4 border-surface'
                  }`}
                >
                  <span className={`font-bold ${step.isLast ? 'text-on-primary' : 'text-white'}`}>
                    {step.num}
                  </span>
                </div>
                <h4 className="font-bold text-white mb-2">{step.title}</h4>
                <p className="text-xs text-on-surface-variant px-4">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
