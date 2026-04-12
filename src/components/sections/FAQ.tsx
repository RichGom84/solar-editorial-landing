'use client'

import { useState } from 'react'

const faqs = [
  {
    q: '설치 비용은 얼마 정도 하나요?',
    a: '설치 장소와 용량에 따라 차이가 있지만, 정부 보조금을 적용할 경우 실질적인 자기 부담금은 평균 200~300만원대입니다. 절감되는 전기요금을 고려하면 보통 3-5년 내에 설치 비용을 회수할 수 있습니다.',
  },
  {
    q: '비가 오거나 흐린 날에도 발전이 되나요?',
    a: '네, 구름이 있어도 발전됩니다. 다만 맑은 날보다 발전량이 줄어듭니다. 연간 평균 발전량으로 설계하므로 경제성에는 큰 영향이 ��습니다.',
  },
  {
    q: '이사할 때 이전 설치가 가능한가요?',
    a: '네, 이전 설치가 가능합니다. 다만 이전 비용이 발생하며, 새 주소지의 구조에 따라 재설계가 필요할 수 있습니다. 상담 시 자세히 안내���리겠습니다.',
  },
  {
    q: '정부 보조금은 어떻게 받나요?',
    a: '저희가 보조금 신청부터 승인까지 전 과정을 대행해 드립니다. 별도로 서류를 준비하실 필요 없이, 상담 시 안내해 드립니다.',
  },
  {
    q: '유지보수는 어떻게 하나��?',
    a: '태양광 패널은 거의 유지보수가 필요 없습니다. 연 1~2회 점검을 권장하며, 저희가 정기 점검 서비스를 무상으로 제공합니다.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 bg-surface">
      <div className="max-w-3xl mx-auto px-8">
        <h2 className="text-3xl font-bold font-headline text-center text-white mb-12">
          자주 묻는 질문
        </h2>

        <div className="space-y-4">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-8 py-5 flex items-center justify-between text-left hover:bg-surface-container-high transition-colors group"
              >
                <span className="font-bold text-white">{item.q}</span>
                <span
                  className={`material-symbols-outlined text-solar-primary transition-transform ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>
              {openIndex === i && (
                <div className="px-8 pb-5 text-on-surface-variant text-sm border-t border-outline-variant/5 pt-4">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
