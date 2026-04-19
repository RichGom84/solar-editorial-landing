# Security Checklist — 신규 프로젝트 배포 전 체크리스트

본 프로젝트를 다른 서비스로 포크/복제할 때 반드시 통과해야 하는 항목.
순서대로 따라가면 가장 흔한 취약점 6가지(SQL Injection / XSS / Auth 우회 /
민감 정보 노출 / CSRF / 취약 라이브러리) 를 커버한다.

## 🔐 배포 전 필수

### 1. Secret 분리
- [ ] `.env.local` 이 `.gitignore` 에 포함되어 있나?
- [ ] `git log --all --oneline -- .env.local` 결과가 비어있나?
- [ ] Toss Secret Key(`TOSS_SECRET_KEY`), 보안 키(`TOSS_SECURITY_KEY`) 에
      `NEXT_PUBLIC_` 접두사가 **없는지** 확인
- [ ] Firebase Web API Key 는 `NEXT_PUBLIC_` 으로 노출되어도 OK
      (규칙으로 제어하기 때문) — 단, Cloud Functions admin 키는 절대 노출 금지

### 2. Firestore/Storage 규칙 배포 — **가장 중요**
- [ ] [firestore-rules.md](./firestore-rules.md) 규칙을 Firebase 콘솔에 배포
- [ ] 테스트 모드(모든 read/write 허용) 로 출시하지 말 것
- [ ] 콘솔 → Firestore → 규칙 탭 → 실 규칙 문법 검증 통과 확인
- [ ] Storage 규칙도 동일하게 배포

### 3. 입력 검증 (API 라우트)
- [ ] 모든 외부 입력은 **타입 체크 + 길이 제한 + 형식 정규식**
- [ ] 숫자 필드는 `Number.isInteger` / 상·하한 검사
- [ ] 사용자 ID·orderId 등 식별자는 `[A-Za-z0-9_-]` 패턴만 허용

### 4. Rate Limit
- [ ] 공개 폼(`/api/submit` 등)에 IP 기반 레이트 리밋 적용
- [ ] 프로덕션 다중 인스턴스 환경은 외부 저장소 기반으로 교체
      (Vercel KV, Upstash Redis 등) — in-memory Map 은 인스턴스당 별개

### 5. 웹훅 서명 검증
- [ ] Toss/기타 외부 웹훅은 **body 를 신뢰하지 말 것**
- [ ] paymentKey 등 식별자만 뽑아 원 API 로 재조회해 진실 확인
      (본 프로젝트 `/api/payments/webhook` 참고)

### 6. XSS 방어
- [ ] `dangerouslySetInnerHTML`, `innerHTML=`, `eval`, `new Function` 사용 금지
- [ ] 사용자 입력 이미지/링크 URL 은 [`url-safety.ts`](./helpers.md) 로 화이트리스트 검증
- [ ] Next.js `<Image>` 또는 `<img src>` 에 검증 통과된 URL만 바인딩

### 7. 의존성 검사
- [ ] `npm audit` 실행 → `0 vulnerabilities`
- [ ] 미사용 의존성 제거 (공격 표면 축소)
- [ ] 월 1회 이상 `npm outdated` 및 `npm audit` 재실행
- [ ] (선택) `semgrep --config=auto .` 정적 분석

### 8. 테스트/프로덕션 분리
- [ ] Firebase 프로젝트를 **dev / prod** 분리 (서로 다른 projectId)
- [ ] Toss 키도 `test_*` / `live_*` 분리
- [ ] 프리뷰 배포(Vercel Preview) 는 반드시 dev 프로젝트로 연결

### 9. HTTPS / 쿠키 / 헤더
- [ ] Vercel/Cloudflare 기본 TLS 유지 (HTTP 리다이렉트 자동)
- [ ] 민감 페이지는 `noindex` meta (관리자, 결제 결과)
- [ ] (선택) `next.config.ts` 에 CSP / HSTS / X-Frame-Options 헤더 설정

### 10. 개인정보 로깅
- [ ] `console.log` 에 이메일/전화번호/카드 일부라도 남기지 말 것
- [ ] 에러 객체 그대로 노출 금지 (스택 트레이스에 경로 노출)

## ✅ 검증 명령어 모음

```bash
# 의존성 취약점
npm audit

# 미사용 의존성(추가 도구)
npx depcheck

# 타입 체크
npx tsc --noEmit

# Lint
npm run lint

# 정적 보안 분석 (선택)
pip install semgrep && semgrep --config=auto .

# git 이력에서 키 유출 확인
git log --all -p -S 'AIzaSy' | head
git log --all -p -S 'sk_live_' | head
git log --all -p -S 'sk_test_' | head
```

## 🚨 사고 시 즉시 조치

1. **키 유출 감지**
   - Firebase: 콘솔 → 프로젝트 설정 → Web API Key 회전
     (단 규칙이 잘 되어 있으면 Key 만으로는 침해 불가)
   - Toss: 대시보드 → 키 재발급 → `.env.local` + 배포 환경변수 교체
   - Git 이력에 남았다면 `git filter-repo` 로 제거 + force push (public 저장소 필수)

2. **악성 데이터 대량 유입**
   - Firestore 규칙 임시로 `allow create: if false` 로 막고 로그 분석
   - Storage 는 차단 대상 사용자 UID 기반으로 규칙에 블랙리스트 추가

3. **의존성 CVE 공지**
   - `npm audit fix` → 실패 시 해당 의존성 제거 또는 버전 핀
