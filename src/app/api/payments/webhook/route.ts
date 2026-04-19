import { NextRequest, NextResponse } from 'next/server'
import { collection, getDocs, query, where, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { COLLECTIONS, type OrderStatus } from '@/lib/firestore-db'

const statusMap: Record<string, OrderStatus> = {
  DONE: 'PAID',
  CANCELED: 'CANCELLED',
  EXPIRED: 'FAILED',
  PARTIAL_CANCELED: 'REFUNDED',
}

async function verifyPaymentWithToss(paymentKey: string) {
  const secretKey = process.env.TOSS_SECRET_KEY
  if (!secretKey) return null
  const res = await fetch(`https://api.tosspayments.com/v1/payments/${encodeURIComponent(paymentKey)}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
    },
  })
  if (!res.ok) return null
  return res.json() as Promise<{ status: string; paymentKey: string }>
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { paymentKey } = body
    if (!paymentKey || typeof paymentKey !== 'string') {
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 })
    }

    const authoritative = await verifyPaymentWithToss(paymentKey)
    if (!authoritative) {
      return NextResponse.json({ error: 'Payment not found on Toss' }, { status: 404 })
    }

    const mapped = statusMap[authoritative.status]
    if (!mapped) {
      return NextResponse.json({ success: true, skipped: true, status: authoritative.status })
    }

    try {
      const q = query(collection(firestore, COLLECTIONS.orders), where('paymentKey', '==', authoritative.paymentKey))
      const snap = await getDocs(q)
      await Promise.all(
        snap.docs.map((d) =>
          updateDoc(doc(firestore, COLLECTIONS.orders, d.id), {
            status: mapped,
            updatedAt: serverTimestamp(),
          })
        )
      )
    } catch (e) {
      console.error('Webhook Firestore update error:', e)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
