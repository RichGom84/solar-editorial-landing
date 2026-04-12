export default function Benefits() {
  const stats = [
    { value: '80', unit: '%', label: '평균 전기요금 절감', desc: '누진세 구간 완전 해소로\n부담 없는 전기 사용' },
    { value: '200', unit: '만+', label: '평균 정부 보조금', desc: '최대 수령 가능한 보조금을\n에디토리얼이 찾아드립니다' },
    { value: '25', unit: '년+', label: '제품 수명 보증', desc: '오랜 시간 변함없는 효율을\n약속하는 최고급 모듈 사용' },
  ]

  return (
    <section id="benefits" className="py-24 bg-surface relative overflow-hidden">
      <div className="absolute -right-24 top-1/4 w-96 h-96 bg-solar-primary/5 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {stats.map((item, i) => (
            <div
              key={i}
              className={
                i === 1
                  ? 'border-y md:border-y-0 md:border-x border-outline-variant/20 py-12 md:py-0'
                  : ''
              }
            >
              <div className="text-6xl font-bold font-headline text-solar-primary mb-4">
                {item.value}
                <span className="text-2xl">{item.unit}</span>
              </div>
              <p className="text-lg font-bold text-white mb-2">{item.label}</p>
              <p className="text-sm text-on-surface-variant whitespace-pre-line">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
