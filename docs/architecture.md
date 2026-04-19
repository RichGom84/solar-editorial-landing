# Architecture

## 기술 스택

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Auth**: Firebase Authentication (Email/Password + Google)
- **DB**: Cloud Firestore (NoSQL)
- **Storage**: Firebase Storage (이미지 원본 업로드)
- **결제**: Toss Payments SDK + REST API
- **배포**: Vercel

## 레이어 구조

```
┌─────────────────────────────────────────────────────────┐
│ UI 컴포넌트 (src/components)                              │
│   - providers/AuthProvider          ← 전역 인증 상태       │
│   - reviews/* (ReviewSection,Form…) ← 리뷰 UI             │
│   - products/PaymentButton          ← 결제 진입점          │
│   - layout, sections                ← 네비·헤더           │
└──────────────┬──────────────────────────────────────────┘
               │ uses
┌──────────────▼──────────────────────────────────────────┐
│ 라이브러리 (src/lib)                                       │
│   - firebase.ts       ← Firebase 초기화·Auth 헬퍼          │
│   - firestore-db.ts   ← Firestore CRUD                   │
│   - storage.ts        ← Storage 업로드(WebP 압축 통과)      │
│   - image-processor.ts ← 클라이언트 WebP 변환/리사이즈      │
│   - url-safety.ts     ← 외부 URL 화이트리스트              │
│   - products.ts       ← 정적 상품 카탈로그                 │
│   - constants.ts      ← 공용 포맷터                       │
└──────────────┬──────────────────────────────────────────┘
               │ called from
┌──────────────▼──────────────────────────────────────────┐
│ API 라우트 (src/app/api)                                  │
│   - payments/confirm   ← Toss 승인(서버 전용 키 사용)       │
│   - payments/webhook   ← Toss 웹훅(재조회로 위조 방어)      │
│   - submit             ← 공개 상담 폼(레이트 리밋)          │
└─────────────────────────────────────────────────────────┘
```

## 데이터 모델 (Firestore)

| 컬렉션 | 문서 ID | 주요 필드 |
|---|---|---|
| `users` | `{uid}` | email, name, role, image, createdAt |
| `orders` | auto | userId, productId, amount, status, paymentKey, orderId, method |
| `reviews` | auto | productId, orderId, userId, rating, text, images[] |
| `consultations` | auto | name, phone, region, buildingType, message, status |

## 핵심 흐름

### 결제 → 주문 기록 → 리뷰 유도
1. 로그인 사용자가 `PaymentButton` 클릭
2. Toss SDK `payment.requestPayment()` 호출 → 리다이렉트
3. 성공 시 `/payment/success?paymentKey&orderId&amount&productId` 복귀
4. 클라이언트가 `/api/payments/confirm` 에 POST → 서버가 Toss Secret Key로 승인
5. 승인 성공 시 클라이언트가 Firestore `orders` 에 문서 생성(규칙이 userId 일치 강제)
6. 리뷰 모달 자동 오픈 → 텍스트 + 이미지(클라이언트에서 WebP 변환) → Storage + Firestore

### 리뷰 작성 자격 확인
- 로그인 사용자의 `orders` 조회 → `productId` 일치 + `status === 'PAID'`
- 해당 `orderId` 로 이미 작성된 `reviews` 있으면 제외
- 남은 주문이 있을 때만 "리뷰 쓰기" 노출

## 보안 계층

1. **클라이언트**: UI 수준 제어(버튼 숨김, 모달 가드)
2. **서버(API 라우트)**: 입력 검증, Rate Limit, Toss 재조회
3. **Firestore/Storage 규칙**: 최종 방어선 (앱 코드 우회 불가)
4. **Secret 분리**: 서버 전용 키는 `NEXT_PUBLIC_` 접두사 없음

## 확장 포인트

- 상품 CRUD: 현재 `src/lib/products.ts` 정적 배열. 대규모 시 `products` 컬렉션으로 이관
- 역할: `USER`/`ADMIN` 두 개. 세분화 필요 시 `users.permissions[]` 배열 추가
- 결제 수단: `CARD` 외 가상계좌/간편결제 등은 `PaymentButton` 의 `method` 파라미터만 교체
