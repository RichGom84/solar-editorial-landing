export const metadata = { title: 'AI 챗봇 가이드' }

export default function ChatbotGuidePage() {
  const steps = [
    {
      num: '01',
      title: 'Google AI Studio 접속',
      desc: 'Google AI Studio에 접속합니다.',
      link: 'https://aistudio.google.com/apikey',
      linkText: 'Google AI Studio 바로가기',
    },
    {
      num: '02',
      title: 'Google 계정 로그인',
      desc: 'Google 계정으로 로그인합니다. 별도의 결제 정보 없이 무료로 API 키를 발급받을 수 있습니다.',
    },
    {
      num: '03',
      title: 'API 키 생성',
      desc: '"Create API Key" 버튼을 클릭하고, 프로젝트를 선택한 후 키를 생성합니다. 생성된 키를 복사하세요.',
    },
    {
      num: '04',
      title: '챗봇에 키 입력',
      desc: '홈페이지 우측 하단의 챗봇을 열고, 상단 ⚙️ 설정 버튼을 클릭한 뒤 복사한 API 키를 붙여넣고 저장합니다.',
    },
    {
      num: '05',
      title: '대화 시작!',
      desc: '이제 AI 상담사에게 태양광 설치, 보조금, 요금 절감 등 무엇이든 물어보세요. Gemini가 실시간으로 답변합니다.',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-12">
        <span className="uppercase tracking-wider text-[10px] text-solar-primary font-bold mb-4 block">Guide</span>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-white">AI 챗봇 설정 가이드</h1>
        <p className="text-on-surface-variant mt-3">
          Google Gemini API 키를 발급받아 Solar Editorial AI 상담사를 활성화하세요.
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-solar-primary-container/10 border border-solar-primary/20 rounded-xl p-6 mb-10">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-solar-primary mt-0.5">info</span>
          <div>
            <h3 className="text-white font-bold text-sm mb-1">Gemini API 무료 사용</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Google Gemini API는 무료 티어를 제공합니다. 분당 15회, 일 1,500회 요청이 가능하며 개인 사용에 충분합니다.
              별도의 결제 정보 입력 없이 Google 계정만 있으면 즉시 사용 가능합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.num} className="bg-surface-container-highest rounded-xl p-6 border border-outline-variant/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-solar-primary/10 flex items-center justify-center shrink-0">
                <span className="text-solar-primary font-bold text-sm">{step.num}</span>
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">{step.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{step.desc}</p>
                {step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-solar-primary text-sm font-medium hover:underline"
                  >
                    {step.linkText}
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Security Notice */}
      <div className="mt-10 bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-solar-primary text-lg">lock</span>
          보안 안내
        </h3>
        <ul className="space-y-2 text-on-surface-variant text-sm">
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-solar-primary text-sm mt-0.5">check</span>
            API 키는 브라우저의 로컬 스토리지에만 저장되며, 서버에 저장되지 않습니다.
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-solar-primary text-sm mt-0.5">check</span>
            API 키는 오직 Gemini AI 응답 생성에만 사용됩니다.
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-solar-primary text-sm mt-0.5">check</span>
            브라우저 데이터를 삭제하면 저장된 키도 함께 삭제됩니다.
          </li>
        </ul>
      </div>
    </div>
  )
}
