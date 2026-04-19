# Reviews 모듈 — 구매자 전용 리뷰 + 이미지 업로드

"돈을 낸 사람만 리뷰를 쓴다"를 클라이언트·Firestore 규칙 양쪽에서 강제하고,
업로드 이미지는 클라이언트에서 WebP 로 변환·리사이즈해 트래픽을 줄이는 구성.

## 제공 기능

- 별점(1~5) + 텍스트(최대 1000자) + 이미지(최대 4장)
- 이미지는 업로드 전 **WebP 변환 + 리사이즈** (서버 트래픽 절감)
- **구매 검증**: 해당 `productId` 에 대해 `status === 'PAID'` 주문 필요
- **중복 방지**: 주문 1개당 리뷰 1개
- 상품 페이지 리뷰 섹션 + 결제 성공 직후 자동 팝업 + 마이페이지 "리뷰 쓰기" 버튼
- 이미지 URL 화이트리스트로 XSS 차단 (`ReviewCard` 가 `safeImageUrl` 통과 URL만 렌더)

## 필요한 환경변수

Firebase 기본 설정 외 추가 없음. Storage 버킷이 활성화돼 있어야 함.

## 파일 리스트

- `src/components/reviews/StarRating.tsx`
- `src/components/reviews/ReviewForm.tsx`
- `src/components/reviews/ReviewCard.tsx`
- `src/components/reviews/ReviewModal.tsx`
- `src/components/reviews/ReviewSection.tsx`
- `src/lib/storage.ts` — `uploadReviewImages()` (WebP 강제)
- `src/lib/image-processor.ts` — WebP 변환 핵심
- `src/lib/url-safety.ts` — 이미지 URL 화이트리스트
- `src/lib/firestore-db.ts` — `ReviewDoc`, `createReview`, `listReviewsByProduct`, `listReviewsByUser`, `getReviewByOrder`, `deleteReview`

의존 모듈: [auth.md](./auth.md), [payments.md](./payments.md), [image-compression.md](./image-compression.md)

## 데이터 모델

```ts
interface ReviewDoc {
  id: string
  productId: string
  orderId: string      // ← 중복 방지 키
  userId: string
  userName?: string | null
  userImage?: string | null
  rating: number       // 1..5
  text: string         // 5..1000 chars
  images: string[]     // Storage download URL
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

Storage 경로 규약: `reviews/{userId}/{orderId}/{timestamp}-{index}.webp`

## 사용법

### 상품 페이지에 리뷰 섹션 추가

```tsx
import ReviewSection from '@/components/reviews/ReviewSection'

<ReviewSection productId={product.id} productName={product.name} />
```

평균 별점, 분포 바, 리뷰 리스트, 작성 가능 시 "리뷰 쓰기" 버튼을 자동 노출.

### 결제 성공 후 자동 모달

`src/app/(main)/payment/success/page.tsx` 에서 주문 저장 성공 시
`setReviewOpen(true)` 로 `ReviewModal` 오픈. 사용자가 "나중에" 누르면
마이페이지에서 재작성 가능.

### 마이페이지 "리뷰 쓰기" 버튼

각 PAID 주문에 조건부 버튼. 리뷰가 이미 있으면 "리뷰 작성 완료" 뱃지.
→ `src/app/(main)/mypage/page.tsx` 참고.

## 작성 권한 로직 (클라이언트 선확인)

```ts
const orders = await listOrdersByUser(uid)
const myReviews = await listReviewsByUser(uid)
const reviewedOrderIds = new Set(myReviews.map(r => r.orderId))

const writableOrder = orders.find(
  (o) => o.productId === productId
       && o.status === 'PAID'
       && !reviewedOrderIds.has(o.id)
)
```

## 보안 포인트

1. **이미지 URL 렌더 전 `safeImageUrl()` 필터** — firebasestorage/googleusercontent
   도메인 + `https:` 만 통과. `javascript:` / `data:` / 외부 CDN URL 삽입 차단
2. **Firestore 규칙**으로 최종 방어:
   - `userId == request.auth.uid` 강제
   - rating 1~5, text ≤ 1000, images ≤ 4 강제
   - 자세한 규칙은 [security/firestore-rules.md](../security/firestore-rules.md)
3. **Storage 규칙**: `request.resource.contentType == 'image/webp'` + 크기 제한
   → 서버 CPU·대역폭 보호

## 확장 아이디어

- 리뷰 좋아요/신고: `reviews/{id}/reactions` 서브컬렉션
- 관리자 리뷰 숨김: `hidden: boolean` 필드 + 규칙 수정
- 구매 후 N일 이내로 작성 제한: 규칙에서 `resource.data.createdAt` 비교
