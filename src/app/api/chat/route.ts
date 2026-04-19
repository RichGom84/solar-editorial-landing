import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `당신은 Solar Editorial의 AI 상담 어시스턴트입니다.
태양광 설치, 정부 보조금, 전기요금 절감, 시공 과정 등에 대해 친절하고 전문적으로 답변합니다.
한국어로 답변하며, 간결하고 실용적인 정보를 제공합니다.
고객이 상담 신청을 원하면 홈페이지의 상담 폼을 안내해주세요.
답변은 3-4문장으로 간결하게 합니다.`

export async function POST(req: NextRequest) {
  try {
    const { messages, apiKey } = await req.json()

    // 환경변수 또는 클라이언트 제공 키 사용
    const geminiKey = apiKey || process.env.GEMINI_API_KEY
    if (!geminiKey) {
      return NextResponse.json({
        reply: '⚠️ Gemini API 키가 설정되지 않았습니다.\n\n채팅창 상단의 ⚙️ 버튼을 눌러 API 키를 입력해주세요.\n\n키 발급: https://aistudio.google.com/apikey',
      })
    }

    // Gemini API 형식으로 변환
    const geminiMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    // 시스템 프롬프트를 첫 메시지로 추가
    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: '네, 이해했습니다. Solar Editorial의 AI 상담 어시스턴트로서 태양광 관련 문의에 친절하게 답변하겠습니다.' }] },
      ...geminiMessages,
    ]

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      const errMsg = data?.error?.message || '응답 생성에 실패했습니다.'
      return NextResponse.json({ reply: `⚠️ API 오류: ${errMsg}` })
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '죄송합니다, 응답을 생성하지 못했습니다.'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ reply: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' })
  }
}
