# Payments 모듈 — Toss Payments API 개별 연동

Toss Payments SDK 로 결제창을 띄우고, 서버에서 Secret Key 로 승인한 뒤
Firestore `orders` 컬렉션에 기록하는 최소 구성.

## 제공 기능

- 카드 결제창 호출 (`@tosspayments/tosspayments-sdk`)
- 서버 승인 API (`/api/payments/confirm`) — 입력 엄격 검증
- 웹훅 API (`/api/payments/webhook`) — Toss API 재조회로 위조 방어
- 결제 성공 후 Firestore 주문 문서 자동 생성
- 주문 모델 타입: `OrderDoc`, `OrderStatus`

## 필요한 환경변수

```
NEXT_PUBLIC_TOSS_CLIENT_KEY   # 공개 가능
TOSS_SECRET_KEY               # 서버 전용
TOSS_SECURITY_KEY             # 서버 전용(웹훅 서명 검증이 필요할 때)
```

## 파일 리스트

- `src/components/products/PaymentButton.tsx` — 결제 버튼(클라이언트 SDK 호출)
- `src/app/api/payments/confirm/route.ts` — 승인 API(입력 검증 포함)
- `src/app/api/payments/webhook/route.ts` — 웹훅 API(Toss 재조회)
- `src/app/(main)/payment/success/page.tsx` — 성공 페이지(승인 → Firestore 저장)
- `src/app/(main)/payment/fail/page.tsx` — 실패 안내
- `src/lib/firestore-db.ts` — `OrderDoc`, `createOrder`, `listOrdersByUser`, `updateOrderStatus`

의존 모듈: [auth.md](./auth.md)

## 결제 흐름

```
[상품 상세] PaymentButton
     │
     ▼ (Toss SDK)
[Toss 결제창] 카드 번호 입력
     │
     ▼ (리다이렉트)
/payment/success?paymentKey&orderId&amount&productId
     │
     ▼ POST
/api/payments/confirm  ──► Toss API /payments/confirm (Secret Key)
     │
     ▼ 200 OK + 승인 데이터
클라이언트가 Firestore orders/{id} 생성 (status: PAID)
     │
     ▼
리뷰 모달 자동 오픈
```

## 사용법

### 1) 버튼 배치

```tsx
import PaymentButton from '@/components/products/PaymentButton'

<PaymentButton
  productId="premium-solar"
  productName="프리미엄 태양광 패키지"
  price={990000}
/>
```

로그인 상태가 아니면 자동으로 `/login` 이동.

### 2) 주문 조회 (마이페이지)

```tsx
import { listOrdersByUser } from '@/lib/firestore-db'

const orders = await listOrdersByUser(user.uid)
```

### 3) 관리자 상태 변경

```tsx
import { updateOrderStatus } from '@/lib/firestore-db'

await updateOrderStatus(orderId, 'REFUNDED')
```

## 보안 포인트

1. **`amount` 는 서버 응답을 신뢰** — 클라이언트가 보낸 `amount` 가 아니라
   `/api/payments/confirm` 이 반환하는 `payment.totalAmount` 를 Firestore 에 저장
2. **웹훅은 body 를 신뢰하지 않음** — `paymentKey` 만 뽑아 Toss API 로 재조회해
   진짜 상태로만 업데이트. 위조된 POST 로 주문을 취소·환불 상태로 바꿀 수 없음
3. **Secret Key 는 API 라우트에서만** — `NEXT_PUBLIC_` 접두사 금지
4. **Firestore 규칙**: `orders` 문서 생성 시 `userId == request.auth.uid` 강제
   (자세한 규칙은 [security/firestore-rules.md](../security/firestore-rules.md))

## 테스트 카드 (샌드박스)

- 카드번호: `4330123412341234`
- 유효기간: 미래 월/년 아무거나
- CVC: 123
- 비밀번호 앞 2자리: `00`

## 운영 전환

`.env.local` 의 3개 키만 `live_ck_*` / `live_sk_*` 로 교체. 코드 변경 불필요.
운영 키 발급 전에 Toss 대시보드에서 사업자 정보·약관 완료 필수.
