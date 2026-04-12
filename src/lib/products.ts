export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string | null
  isActive: boolean
  sortOrder: number
}

export const PRODUCTS: Product[] = [
  {
    id: 'test-100',
    name: '테스트 상품',
    description: '결제 테스트를 위한 100원짜리 테스트 상품입니다.\n실제 상품이 아닙니다.',
    price: 100,
    image: null,
    isActive: true,
    sortOrder: 0,
  },
  {
    id: 'standard-solar',
    name: '스탠다드 태양광 패키지',
    description: '3kW 주택용 태양광 패키지\n\n포함 사항:\n• 고효율 태양광 패널 (3kW)\n• 인버터 및 접속함\n• 구조물 및 배선\n• 전문 시공 (1-2일)\n• 정부보조금 신청 대행\n• 3년 무상 A/S\n\n예상 절감 효과:\n• 월 전기요금 약 60% 절감\n• 투자 회수 기간 약 5-7년',
    price: 490000,
    image: null,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'premium-solar',
    name: '프리미엄 태양광 패키지',
    description: '5kW 프리미엄 태양광 패키지\n\n포함 사항:\n• 최고급 태양광 패널 (5kW)\n• 고효율 인버터 및 접속함\n• 프리미엄 구조물 및 배선\n• 전문 시공 (2-3일)\n• 정부보조금 신청 대행\n• 5년 무상 A/S\n• 연 2회 정기 점검\n• 실시간 모니터링 시스템\n\n예상 절감 효과:\n• 월 전기요금 약 80% 절감\n• 투자 회수 기간 약 4-5년',
    price: 990000,
    image: null,
    isActive: true,
    sortOrder: 2,
  },
]

export function getProducts(): Product[] {
  return PRODUCTS.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id && p.isActive)
}
