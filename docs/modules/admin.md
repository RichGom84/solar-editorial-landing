# Admin 모듈 — 5섹션 관리자 대시보드

Firebase Auth + Firestore 만으로 구성하는 경량 관리자 페이지.
서버 컴포넌트 없이 전부 클라이언트에서 역할(role) 기반 가드 + Firestore 규칙으로 최종 방어.

## 제공 기능

- **대시보드**: 총 회원수, 등록 상품, 주문수, 총 매출, 상담 건수
- **상품 관리**: 정적 카탈로그 표시 (`src/lib/products.ts`)
- **주문 관리**: Firestore orders 목록 + 상태 드롭다운 수정
- **회원 관리**: Firestore users 목록 + 역할 드롭다운 변경 + 본인 강등 확인
- **상담 목록**: Firestore consultations 목록 + 상태 변경 + 삭제
- 역할 가드: `/admin/*` 접근 시 `role !== 'ADMIN'` 이면 `/` 로 리다이렉트

## 필요한 환경변수

Firebase 기본 설정 외 추가 없음.

## 파일 리스트

- `src/app/admin/layout.tsx` — 가드 + 사이드바
- `src/app/admin/page.tsx` — 대시보드
- `src/app/admin/products/page.tsx`
- `src/app/admin/orders/page.tsx`
- `src/app/admin/users/page.tsx`
- `src/app/admin/consultations/page.tsx`
- `src/lib/firestore-db.ts` — `listOrders`, `listUsers`, `listConsultations`, `updateOrderStatus`, `updateUserRole`, `updateConsultationStatus`, `deleteConsultation`

의존 모듈: [auth.md](./auth.md)

## 가드 패턴

```tsx
// src/app/admin/layout.tsx
const { user, role, loading } = useAuth()
useEffect(() => {
  if (loading) return
  if (!user) router.replace('/login')
  else if (role !== 'ADMIN') router.replace('/')
}, [loading, user, role, router])

if (loading || !user || role !== 'ADMIN') {
  return <div>확인 중...</div>
}
```

> ⚠️ 이 가드는 UI 편의일 뿐. 데이터 보호는 반드시 Firestore 규칙으로.

## 첫 관리자 만들기

1. Firebase Auth 에서 회원가입 → Firestore `users/{uid}` 자동 생성 (role: `USER`)
2. Firestore 콘솔에서 해당 문서의 `role` 필드를 수동으로 `ADMIN` 변경
3. 이후 `/admin` 접근 가능
4. 이 관리자가 **회원 관리** 페이지에서 다른 사용자를 `ADMIN` 으로 승격 가능

## 상태 변경 정책

| 섹션 | 가능한 변경 | 기본값 |
|---|---|---|
| 주문 | PENDING / PAID / CANCELLED / REFUNDED / FAILED | 결제 시 PAID |
| 상담 | 신규 / 상담중 / 완료 / 보류 | 신규 |
| 회원 | USER / ADMIN | USER |

## 주의사항

- 본인 자신의 `role` 을 `USER` 로 내리면 즉시 접근 불가 → 확인 다이얼로그 필수
- Firestore 규칙이 `role` 변경을 **동일 문서 주인은 못 바꾸게** 막는 방식으로도 가능
  (승급·강등 전부 Firebase Console 로만 처리하도록)
- 주문 환불 플로우는 현재 **상태 라벨만 변경**. 실제 환불은 Toss 대시보드 또는
  별도 API 호출이 필요 (확장 시 `POST /v1/payments/{paymentKey}/cancel` 구현)
