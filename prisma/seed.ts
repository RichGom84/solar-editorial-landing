import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 테스트 상품 3개 시드
  const products = [
    {
      name: '테스트 상품',
      description: '결제 테스트를 위한 100원짜리 테스트 상품입니다.\n실제 상품이 아닙니다.',
      price: 100,
      sortOrder: 0,
    },
    {
      name: '스탠다드 태양광 패키지',
      description: '3kW 주택용 태양광 패키지\n\n포함 사항:\n• 고효율 태양광 패널 (3kW)\n• 인버터 및 접속함\n• 구조물 및 배선\n• 전문 시공 (1-2일)\n• 정부보조금 신청 대행\n• 3년 무상 A/S\n\n예상 절감 효과:\n• 월 전기요금 약 60% 절감\n• 투자 회수 기간 약 5-7년',
      price: 490000,
      sortOrder: 1,
    },
    {
      name: '프리미엄 태양광 패키지',
      description: '5kW 프리미엄 태양광 패키지\n\n포함 사항:\n• 최고급 태양광 패널 (5kW)\n• 고효율 인버터 및 접속함\n• 프리미엄 구조물 및 배선\n• 전문 시공 (2-3일)\n• 정부보조금 신청 대행\n• 5년 무상 A/S\n• 연 2회 정기 점검\n• 실시간 모니터링 시스템\n\n예상 절감 효과:\n• 월 전기요금 약 80% 절감\n• 투자 회수 기간 약 4-5년',
      price: 990000,
      sortOrder: 2,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name },
      update: product,
      create: product,
    })
  }

  // 어드민 계정 생성
  const adminPassword = await bcrypt.hash('admin1234', 12)
  await prisma.user.upsert({
    where: { email: 'admin@solar-editorial.com' },
    update: {},
    create: {
      name: '관리자',
      email: 'admin@solar-editorial.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  console.log('✅ 시드 완료: 상품 3개, 어드민 계정 1개')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
