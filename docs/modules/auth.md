# Auth 모듈 — Firebase Auth + Context

Firebase Authentication 을 Next.js App Router 에서 쓰기 위한 최소 단위 패턴.
세션 쿠키 없이 클라이언트 전역 상태로 관리하고, Firestore `users/{uid}` 를
프로파일 저장소로 쓴다.

## 제공 기능

- 이메일/비밀번호 회원가입·로그인
- Google 소셜 로그인(팝업)
- 로그아웃
- 전역 `useAuth()` hook: `{ user, profile, role, loading, refreshProfile }`
- 최초 로그인 시 Firestore `users/{uid}` 자동 생성(role: `USER`)

## 필요한 환경변수

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

## 파일 리스트

복사해야 할 파일:

- `src/lib/firebase.ts` — 앱 초기화 + Auth 헬퍼(`signInWithGoogle`, `signInWithEmail`, `registerWithEmail`, `signOutFirebase`)
- `src/lib/firestore-db.ts` — `UserDoc` 타입 + `getUserDoc` / `upsertUserDoc` / `updateUserRole`
- `src/components/providers/AuthProvider.tsx` — `<AuthProvider>` + `useAuth()`
- `src/components/providers/FirebaseAnalytics.tsx` (선택) — GA4 자동 초기화

## 사용법

### 1) 루트 레이아웃에 Provider 마운트

```tsx
// src/app/layout.tsx
import { AuthProvider } from '@/components/providers/AuthProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
```

### 2) 어떤 클라이언트 컴포넌트에서든 hook 사용

```tsx
'use client'
import { useAuth } from '@/components/providers/AuthProvider'
import { signOutFirebase } from '@/lib/firebase'

export default function UserBadge() {
  const { user, role, loading } = useAuth()
  if (loading) return null
  if (!user) return <a href="/login">로그인</a>
  return (
    <>
      <span>{user.displayName}</span>
      {role === 'ADMIN' && <a href="/admin">관리자</a>}
      <button onClick={() => signOutFirebase()}>로그아웃</button>
    </>
  )
}
```

### 3) 보호 페이지 패턴

```tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

export default function ProtectedPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user, router])
  if (loading || !user) return <div>확인 중...</div>
  return <div>보호된 콘텐츠</div>
}
```

### 4) 관리자 가드 패턴

```tsx
if (!loading && (!user || role !== 'ADMIN')) router.replace('/')
```

> ⚠️ **클라이언트 가드는 UI 편의일 뿐**. 실제 권한 차단은 반드시
> [Firestore 규칙](../security/firestore-rules.md) 으로 해야 한다.

## 주의사항

- `onAuthStateChanged` 가 초기 `null`을 먼저 뿜고 로그인 상태를 다음 틱에 전달하므로
  `loading` 플래그로 초기 분기 처리 필수
- Google 팝업 차단 시 `auth/popup-closed-by-user` 에러 → 사용자 취소로 간주
- `users` 문서가 없을 때만 `upsertUserDoc` 로 생성 — 기존 role 덮어쓰기 방지
- `role` 승격은 앱에서 금지(규칙이 막음). Firebase 콘솔/Cloud Function 에서만
