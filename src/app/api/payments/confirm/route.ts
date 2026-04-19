import { NextRequest, NextResponse } from 'next/server'

const MAX_AMOUNT = 100_000_000

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const paymentKey = typeof body.paymentKey === 'string' ? body.paymentKey : null
    const orderId = typeof body.orderId === 'string' ? body.orderId : null
    const amount = typeof body.amount === 'number' ? body.amount : null

    if (!paymentKey || !orderId || amount == null) {
      return NextResponse.json({ error: '결제 정보가 올바르지 않습니다.' }, { status: 400 })
    }
    if (!/^[A-Za-z0-9_-]{1,200}$/.test(paymentKey)) {
      return NextResponse.json({ error: 'paymentKey 형식 오류' }, { status: 400 })
    }
    if (!/^[A-Za-z0-9_-]{1,100}$/.test(orderId)) {
      return NextResponse.json({ error: 'orderId 형식 오류' }, { status: 400 })
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT || !Number.isInteger(amount)) {
      return NextResponse.json({ error: 'amount 값 오류' }, { status: 400 })
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
      return NextResponse.json(
        { error: confirmData.message || '결제 확인에 실패했습니다.', code: confirmData.code },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      payment: {
        paymentKey: confirmData.paymentKey,
        orderId: confirmData.orderId,
        orderName: confirmData.orderName,
        method: confirmData.method,
        totalAmount: confirmData.totalAmount,
        approvedAt: confirmData.approvedAt,
        status: confirmData.status,
      },
    })
  } catch (error) {
    console.error('Payment confirm error:', error)
    return NextResponse.json({ error: '결제 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
