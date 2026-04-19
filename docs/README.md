# Solar Landing — 모듈 문서

이 폴더는 본 프로젝트의 **재사용 가능한 기능 단위**를 문서화합니다. 각 문서는
"이 기능을 다른 Next.js 프로젝트로 옮길 때 무엇을 복사하고, 어떻게 설정하는가"
까지 자급자족(self-contained)으로 작성되었습니다.

## 구조

- [setup.md](./setup.md) — 환경변수·Firebase 콘솔·Toss 대시보드 초기 설정
- [architecture.md](./architecture.md) — 전체 구조와 레이어 경계
- **modules/**
  - [auth.md](./modules/auth.md) — Firebase Auth + `AuthProvider` + `useAuth`
  - [payments.md](./modules/payments.md) — Toss Payments API 개별 연동
  - [reviews.md](./modules/reviews.md) — 구매자 전용 리뷰(텍스트+이미지)
  - [image-compression.md](./modules/image-compression.md) — 클라이언트 WebP 변환 파이프라인
  - [admin.md](./modules/admin.md) — 관리자 5섹션 CRUD + role 가드
- **security/**
  - [checklist.md](./security/checklist.md) — 신규 프로젝트 보안 체크리스트
  - [firestore-rules.md](./security/firestore-rules.md) — Firestore·Storage 규칙 모음
  - [helpers.md](./security/helpers.md) — 재사용 보안 헬퍼(URL 화이트리스트, Rate Limit)

## 모듈 의존 관계

```
auth ──┬──► payments ──► reviews
       ├──► admin
       └──► (모든 인증 필요 기능)

image-compression ──► reviews (이미지 업로드 파이프라인)
```

## 빠른 시작

1. [setup.md](./setup.md) 따라 Firebase + Toss 키 세팅
2. 필요한 모듈 문서의 **"파일 리스트"** 섹션을 참고해 `src/` 하위 파일 복사
3. [security/checklist.md](./security/checklist.md) 점검 후 배포
