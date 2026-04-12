import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, region, buildingType, monthlyBill, message } = body

    // 필수값 검증
    if (!name || !phone || !region || !buildingType) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 })
    }

    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL

    if (GOOGLE_SCRIPT_URL) {
      // Google Apps Script로 전송 — 시트 헤더 순서와 정확히 일치
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
          name,
          phone,
          region,
          buildingType,
          monthlyBill: monthlyBill || '-',
          message: message || '-',
          status: '신규',
        }),
      })

      if (!response.ok) {
        console.error('Google Script error:', await response.text())
      }
    } else {
      console.log('[DEV] 폼 데이터:', { name, phone, region, buildingType, monthlyBill, message })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Submit error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
