# Setup — 초기 환경 구성

## 1. 환경변수 (`.env.local`)

프로젝트 루트에 `.env.example` 을 복사해 `.env.local` 로 이름을 바꾼 뒤 값을 채웁니다.
`.env.local` 은 `.gitignore` 에 포함되어 **절대 커밋되지 않습니다**.

| 변수 | 용도 | 공개 여부 |
|---|---|---|
| `GOOGLE_SCRIPT_URL` | 상담 폼을 Google Sheet로 보내는 Apps Script Web App URL | 서버 전용 |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key | 공개(규칙으로 제어) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth 도메인 | 공개 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID | 공개 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Cloud Storage 버킷 | 공개 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM Sender ID | 공개 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | 공개 |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | GA4 Measurement ID | 공개 |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | Toss Payments 클라이언트 키(`test_ck_` / `live_ck_`) | 공개 |
| `TOSS_SECRET_KEY` | Toss Payments 시크릿 키(`test_sk_` / `live_sk_`) | **서버 전용** |
| `TOSS_SECURITY_KEY` | Toss 웹훅 서명 검증용 보안 키 | **서버 전용** |

> ⚠️ `NEXT_PUBLIC_*` 접두사가 붙은 값은 **클라이언트 번들에 그대로 포함**됩니다.
> Toss 시크릿 키나 DB 접속 정보에는 절대 이 접두사를 붙이지 마세요.

## 2. Firebase 콘솔 설정

1. [Firebase 콘솔](https://console.firebase.google.com) 에서 프로젝트 생성
2. **Authentication** → Sign-in method 에서 활성화
   - Email/Password
   - Google
3. **Firestore Database** → 데이터베이스 만들기(테스트 모드)
4. **Storage** → 시작(테스트 모드)
5. **프로젝트 설정** → 내 앱 → Web 앱 추가 → SDK 설정 값 복사 → `.env.local`
6. 배포 전 반드시 [security/firestore-rules.md](./security/firestore-rules.md) 규칙 배포

## 3. Toss Payments 설정

1. [Toss Payments 개발자센터](https://developers.tosspayments.com) 에서 상점 생성
2. **API 개별 연동 키** 탭에서 테스트 키 3종 복사 → `.env.local`
3. 프로덕션은 사업자 인증 후 발급되는 `live_*` 키로 교체(코드 수정 불필요)
4. 웹훅 URL 등록(선택): `https://your-domain/api/payments/webhook`
   - 본 프로젝트는 웹훅 수신 시 **Toss API로 재조회**하여 위조를 방어하므로
     HMAC 서명 없이도 안전합니다.

## 4. 관리자 계정 승격

Firebase Auth로 회원가입 → Firestore 콘솔에서 `users/{uid}` 문서의
`role` 필드를 `USER` → `ADMIN` 으로 수정.
앱 코드에서 사용자가 스스로 `role` 을 바꿀 수 없도록 Firestore 규칙이 막고 있습니다.

## 5. 로컬 실행

```bash
npm install
npm run dev
# http://localhost:3000
```

## 6. 배포

- Vercel 추천. 환경변수는 Vercel 프로젝트 설정에서 동일한 이름으로 입력.
- 정적 최적화 영향 없음 (모든 결제·리뷰 동작은 클라이언트/API 라우트에서 수행).
