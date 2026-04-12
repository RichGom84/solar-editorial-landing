export default function CaseStudy() {
  const reviews = [
    {
      name: '김*수 고객님 (경기도 양평)',
      text: '"여름철마다 30만원 넘게 나오던 요금이 4만원대로 줄었습니다. 설치 디자인도 세련되어서 집 가치가 올라간 느낌이에요."',
      before: { label: 'Before (320,000원)', height: 'h-28' },
      after: { label: 'After (42,000원)', height: 'h-8' },
    },
    {
      name: '이*은 고객님 (제주도 서귀포)',
      text: '"보조금 신청 과정이 막막했는데 모든 서류를 다 처리해주셔서 너무 편했습니다. 시공도 하루 만에 깔끔하게 끝났네요."',
      before: { label: 'Before (180,000원)', height: 'h-20' },
      after: { label: 'After (15,000원)', height: 'h-4' },
    },
  ]

  return (
    <section id="cases" className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="text-3xl font-bold font-headline text-white mb-16">실제 고객의 변화</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {reviews.map((item, i) => (
            <div key={i} className="bg-surface-container-highest p-8 rounded-3xl border border-outline-variant/10">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-slate-800" />
                <div>
                  <p className="font-bold text-white">{item.name}</p>
                  <div className="flex text-solar-primary text-sm mt-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <span
                        key={j}
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: "'FILL' 1", fontSize: '18px' }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-white mb-10 italic">{item.text}</p>

              {/* Comparison Mini-Chart */}
              <div className="flex items-end gap-12 h-32 px-4">
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className={`w-full bg-red-900/30 ${item.before.height} rounded-t-lg relative`}>
                    <div className="absolute inset-0 bg-red-500/20 animate-pulse rounded-t-lg" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">
                    {item.before.label}
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className={`w-full bg-solar-primary-container ${item.after.height} rounded-t-lg`} />
                  <span className="text-[10px] uppercase font-bold text-solar-primary">
                    {item.after.label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
