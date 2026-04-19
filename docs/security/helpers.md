# Security Helpers — 재사용 보안 유틸

앱 전반에서 반복되는 보안 패턴을 한 파일씩으로 모은 스니펫 모음.
다른 프로젝트에 그대로 복사해 사용 가능.

---

## 1. URL 화이트리스트 — `src/lib/url-safety.ts`

**목적**: 사용자 데이터(Firestore/DB)에서 읽은 URL 을 `<img src>` / `<a href>` 로
렌더링하기 전에 화이트리스트 도메인 + `https:` 만 통과시켜 `javascript:`,
`data:`, 외부 악성 URL 삽입을 차단.

```ts
const FIREBASE_STORAGE_HOSTS = ['firebasestorage.googleapis.com', 'firebasestorage.app']
const GOOGLE_USER_CONTENT_HOSTS = ['lh3.googleusercontent.com', 'lh4.googleusercontent.com', 'lh5.googleusercontent.com', 'lh6.googleusercontent.com']
const ALLOWED_HOSTS = new Set<string>([...FIREBASE_STORAGE_HOSTS, ...GOOGLE_USER_CONTENT_HOSTS])

export function isSafeImageUrl(raw: unknown): raw is string {
  if (typeof raw !== 'string' || raw.length === 0) return false
  let url: URL
  try { url = new URL(raw) } catch { return false }
  if (url.protocol !== 'https:') return false
  return [...ALLOWED_HOSTS].some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))
}

export function safeImageUrl(raw: unknown): string | null {
  return isSafeImageUrl(raw) ? raw : null
}
```

### 사용 예

```tsx
import { safeImageUrl } from '@/lib/url-safety'

const avatarUrl = safeImageUrl(review.userImage)
return avatarUrl
  ? <img src={avatarUrl} alt="avatar" />
  : <DefaultAvatar />
```

### 확장

- CDN 도메인 추가 필요 시 `ALLOWED_HOSTS` 에 추가
- 이미지 외 링크에도 쓰고 싶다면 프로토콜 체크(`https:`/`mailto:`/`tel:`) 분기

---

## 2. 입력 검증 — API 라우트 패턴

**목적**: 클라이언트 POST 바디를 타입·길이·형식까지 엄격 검증.

```ts
function cleanString(v: unknown, maxLen: number): string | null {
  if (typeof v !== 'string') return null
  const trimmed = v.trim()
  if (!trimmed) return null
  return trimmed.slice(0, maxLen)
}

// 숫자
if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT || !Number.isInteger(amount)) {
  return NextResponse.json({ error: 'amount 값 오류' }, { status: 400 })
}

// ID 토큰류 정규식
if (!/^[A-Za-z0-9_-]{1,200}$/.test(paymentKey)) {
  return NextResponse.json({ error: 'paymentKey 형식 오류' }, { status: 400 })
}

// 전화번호
if (!/^[0-9+\-\s().]{8,30}$/.test(phone)) {
  return NextResponse.json({ error: '연락처 형식이 올바르지 않습니다.' }, { status: 400 })
}
```

실 구현: `src/app/api/payments/confirm/route.ts`, `src/app/api/submit/route.ts`

### 원칙

- `typeof === 'string'` → `trim()` → 길이 상한 → 정규식
- 숫자는 `Number.isInteger` + 상한 체크 (overflow 방지)
- 배열/객체 필드도 `Array.isArray` + 길이 제한

---

## 3. IP 기반 Rate Limit — in-memory

**목적**: 공개 폼에 기본 스팸·DoS 억제. 단일 인스턴스용.

```ts
const ipHits = new Map<string, { count: number; reset: number }>()
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 5

function rateLimitOk(ip: string): boolean {
  const now = Date.now()
  const hit = ipHits.get(ip)
  if (!hit || now > hit.reset) {
    ipHits.set(ip, { count: 1, reset: now + RATE_WINDOW_MS })
    return true
  }
  if (hit.count >= RATE_MAX) return false
  hit.count++
  return true
}

// 라우트 상단에서
const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
         || req.headers.get('x-real-ip')
         || 'unknown'
if (!rateLimitOk(ip)) {
  return NextResponse.json({ error: '요청이 너무 많습니다.' }, { status: 429 })
}
```

### 한계와 교체

- 서버리스 여러 인스턴스로 배포되면 인스턴스마다 카운터가 따로 움직여
  실제 상한 = `RATE_MAX × 인스턴스 수` 가 된다.
- 프로덕션은 **Vercel KV** / **Upstash Redis** 로 교체 권장:

```ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
})
const { success } = await ratelimit.limit(ip)
if (!success) return NextResponse.json({ error: '...' }, { status: 429 })
```

---

## 4. 웹훅 위조 방어 — "재조회 검증" 패턴

**목적**: 외부 서비스가 보내는 웹훅은 누구나 POST 할 수 있으므로 body 를
신뢰하지 않고 해당 서비스 API 로 다시 조회해 진실을 확인.

```ts
async function verifyPaymentWithToss(paymentKey: string) {
  const secretKey = process.env.TOSS_SECRET_KEY!
  const res = await fetch(`https://api.tosspayments.com/v1/payments/${encodeURIComponent(paymentKey)}`, {
    headers: { Authorization: `Basic ${Buffer.from(secretKey + ':').toString('base64')}` },
  })
  if (!res.ok) return null
  return res.json() as Promise<{ status: string; paymentKey: string }>
}

export async function POST(req: NextRequest) {
  const { paymentKey } = await req.json()
  const truth = await verifyPaymentWithToss(paymentKey)
  if (!truth) return NextResponse.json({ error: 'not found' }, { status: 404 })
  // truth.status 만 신뢰해서 DB 업데이트
}
```

실 구현: `src/app/api/payments/webhook/route.ts`

### 장점

- HMAC 서명 구현 불필요 (Toss 의 Authenticated API 가 이미 증명)
- 서비스 측 정책 변경(상태값, 시그니처 포맷) 영향 0

### 단점

- 추가 외부 API 호출 1회 (대부분 수십 ms, 트래픽 많으면 캐시 고려)

---

## 5. 환경변수 접두사 규칙 체커 (스크립트)

배포 전 CI 단계에서 실수로 서버 시크릿에 `NEXT_PUBLIC_` 이 붙지 않았는지 검증.

```js
// scripts/check-secrets.js
const FORBIDDEN_PUBLIC = ['SECRET', 'PRIVATE', 'PASSWORD', 'SERVICE_ACCOUNT']
const envs = Object.keys(process.env)
const bad = envs.filter((k) => k.startsWith('NEXT_PUBLIC_') && FORBIDDEN_PUBLIC.some((w) => k.includes(w)))
if (bad.length) {
  console.error('❌ 서버 시크릿이 NEXT_PUBLIC_ 로 노출됨:', bad)
  process.exit(1)
}
```

`package.json` 의 `prebuild` 훅에 `node scripts/check-secrets.js` 추가.
