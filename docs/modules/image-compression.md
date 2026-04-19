# Image Compression 모듈 — 클라이언트 WebP 변환 파이프라인

사용자가 업로드한 원본 이미지를 브라우저에서 직접 WebP 로 변환·리사이즈해
Storage 로 보내는 재사용 컴포넌트. 서버 CPU 0 사용, 업로드 대역폭 5~15배 절감.

## 제공 기능

- 원본 이미지 → WebP Blob 변환
- 긴 변 기준 자동 리사이즈 (기본 1600px)
- 품질 조절 (기본 0.82)
- EXIF orientation 자동 보정 (`createImageBitmap({ imageOrientation: 'from-image' })`)
- OffscreenCanvas 우선, 없으면 HTMLCanvasElement 폴백
- HEIC/BMP/GIF 등 `image/*` 전 포맷 수용

## 필요한 환경변수

없음. 순수 브라우저 API 사용.

## 파일 리스트

- `src/lib/image-processor.ts` — 변환 핵심 (`compressToWebp`, `replaceExtension`)
- `src/lib/storage.ts` — Storage 업로드 래퍼 (변환 결과만 업로드)

## API

### `compressToWebp(file, opts?)`

```ts
import { compressToWebp } from '@/lib/image-processor'

const blob = await compressToWebp(file, {
  maxDimension: 1600,  // 긴 변 최대 픽셀 (기본 1600)
  quality: 0.82,       // 0~1 (기본 0.82)
})
// blob.type === 'image/webp'
```

### `uploadReviewImages(userId, orderId, files)`

```ts
import { uploadReviewImages } from '@/lib/storage'

const urls = await uploadReviewImages(user.uid, orderId, fileArray)
// 각 파일이 WebP 로 변환돼 Storage 에 업로드되고 다운로드 URL 반환
```

## 압축 결과 예시

| 원본 | 변환 후 |
|---|---|
| iPhone JPEG 4032×3024 (4.2MB) | 1600×1200 WebP (180KB) |
| DSLR RAW→JPEG 6000×4000 (8.1MB) | 1600×1067 WebP (240KB) |
| PNG 스크린샷 2880×1800 (3.8MB) | 1600×1000 WebP (120KB) |

## 튜닝

| 사용처 | maxDimension | quality | 비고 |
|---|---|---|---|
| 리뷰 이미지 (기본) | 1600 | 0.82 | 모바일·데스크톱 동시 |
| 썸네일 | 600 | 0.75 | 리스트 전용 |
| 상품 상세 | 2000 | 0.88 | 확대 보기 있음 |
| 프로필 아바타 | 400 | 0.80 | 정사각 크롭 후 |

## 브라우저 호환성

- **완전 지원**: Chrome 85+, Edge 85+, Firefox 97+, Safari 15+
- **폴백**: HTMLCanvasElement + `toBlob()` (Safari 14 이하 포함)
- EXIF orientation 자동 보정은 일부 구버전 Safari 에서 무시될 수 있음
  (이미지가 회전돼 보일 수 있으나 동작은 정상)

## 주의사항

- GIF 애니메이션은 캔버스 통과 시 **첫 프레임만 추출** (WebP 정지 이미지)
- 애니메이션 보존이 필요하면 별도 경로 구성 필요
- 10MB 이상 초고해상도(2억 픽셀+) 이미지는 브라우저 메모리 부족 가능 —
  `validateImage` 에서 원본 10MB 상한을 둔 이유
