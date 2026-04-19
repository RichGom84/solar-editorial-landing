import { NextRequest, NextResponse } from 'next/server'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/firestore-db'

const LIMITS = {
  name: 50,
  phone: 30,
  region: 200,
  buildingType: 30,
  monthlyBill: 30,
  message: 2000,
}

function cleanString(v: unknown, maxLen: number): string | null {
  if (typeof v !== 'string') return null
  const trimmed = v.trim()
  if (!trimmed) return null
  return trimmed.slice(0, maxLen)
}

const ipHits = new Map<string, { count: number; reset: number }>()
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 5

function rateLimitOk(ip: string): boolean {
  const now = Date.now()
  const hit = ipHits.get(ip)
  if (!hit || now > hit.reset) {
    ipHits.set(ip, { count: 1, reset: now + RATE_WINDOW_MS })
    return true
  }
  if (hit.count >= RATE_MAX) return false
  hit.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'
    if (!rateLimitOk(ip)) {
      return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 })
    }

    const body = await req.json()

    const name = cleanString(body.name, LIMITS.name)
    const phone = cleanString(body.phone, LIMITS.phone)
    const region = cleanString(body.region, LIMITS.region)
    const buildingType = cleanString(body.buildingType, LIMITS.buildingType)
    const monthlyBill = cleanString(body.monthlyBill, LIMITS.monthlyBill)
    const message = cleanString(body.message, LIMITS.message)
    const userId = typeof body.userId === 'string' && body.userId.length <= 128 ? body.userId : null

    if (!name || !phone || !region || !buildingType) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 })
    }
    if (!/^[0-9+\-\s().]{8,30}$/.test(phone)) {
      return NextResponse.json({ error: '연락처 형식이 올바르지 않습니다.' }, { status: 400 })
    }

    try {
      await addDoc(collection(firestore, COLLECTIONS.consultations), {
        userId,
        name,
        phone,
        region,
        buildingType,
        monthlyBill,
        message,
        status: '신규',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch (e) {
      console.error('[Firestore] consultation save error:', e)
    }

    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL
    if (GOOGLE_SCRIPT_URL) {
      try {
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
      } catch (e) {
        console.error('Google Script fetch failed:', e)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Submit error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
