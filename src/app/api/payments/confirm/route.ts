import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    if (!prisma) {
      return NextResponse.json({ error: '데이터베이스가 연결되지 않았습니다.' }, { status: 503 })
    }

    const { paymentKey, orderId, amount, productId } = await req.json()

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: '결제 정보가 올바르지 않습니다.' }, { status: 400 })
    }

    const secretKey = process.env.TOSS_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: '결제 시스템 설정 오류' }, { status: 500 })
    }

    const confirmRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })

    const confirmData = await confirmRes.json()

    if (!confirmRes.ok) {
      return NextResponse.json({ error: confirmData.message || '결제 확인에 실패했습니다.' }, { status: 400 })
    }

    await prisma.order.create({
      data: {
        userId: session.user.id,
        productId: productId || '',
        amount,
        status: 'PAID',
        paymentKey,
        orderId,
        method: confirmData.method || '카드',
        approvedAt: new Date(confirmData.approvedAt || Date.now()),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment confirm error:', error)
    return NextResponse.json({ error: '결제 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
