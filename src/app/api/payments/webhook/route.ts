import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { paymentKey, status, orderId } = body

    if (!paymentKey || !orderId) {
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 })
    }

    const statusMap: Record<string, string> = {
      DONE: 'PAID',
      CANCELED: 'CANCELLED',
      EXPIRED: 'FAILED',
      PARTIAL_CANCELED: 'REFUNDED',
    }

    const newStatus = statusMap[status]
    if (newStatus) {
      await prisma.order.updateMany({
        where: { paymentKey },
        data: { status: newStatus as 'PAID' | 'CANCELLED' | 'FAILED' | 'REFUNDED' },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
