# Firestore & Storage 보안 규칙

**이 규칙이 배포되지 않으면 앱 코드의 가드는 전부 UI 편의에 불과합니다.**
`users.role == 'ADMIN'` 같은 클라이언트 체크는 devtools 로 우회 가능하므로,
실제 권한 차단은 반드시 규칙에서 수행해야 합니다.

## Firestore 규칙

아래를 Firebase 콘솔 → Firestore Database → 규칙 탭에 붙여넣고 **게시**.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    // 공통 헬퍼
    function isSignedIn() {
      return request.auth != null;
    }
    function isSelf(uid) {
      return isSignedIn() && request.auth.uid == uid;
    }
    function isAdmin() {
      return isSignedIn()
        && exists(/databases/$(db)/documents/users/$(request.auth.uid))
        && get(/databases/$(db)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }

    // ===== users =====
    match /users/{uid} {
      allow read: if isSignedIn();
      // 최초 생성: 본인, role 은 반드시 USER
      allow create: if isSelf(uid)
        && request.resource.data.role == 'USER'
        && request.resource.data.uid == uid;
      // 수정: 본인이되 role 변경 금지 (role 승격은 콘솔/Cloud Function 에서만)
      allow update: if (isSelf(uid) && request.resource.data.role == resource.data.role)
                    || isAdmin();
      allow delete: if isAdmin();
    }

    // ===== products (정적 카탈로그라면 콘솔 read-only 운영 권장) =====
    match /products/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // ===== orders =====
    match /orders/{id} {
      allow read: if isSelf(resource.data.userId) || isAdmin();
      // 생성: 본인만, 최초엔 PAID (성공한 결제만 기록)
      allow create: if isSelf(request.resource.data.userId)
        && request.resource.data.status == 'PAID'
        && request.resource.data.amount is int
        && request.resource.data.amount > 0;
      // 수정: 관리자만 (환불·취소 처리)
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // ===== reviews =====
    match /reviews/{id} {
      // 리뷰는 누구나 읽기 (공개 리뷰)
      allow read: if true;
      allow create: if isSignedIn()
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.rating is int
        && request.resource.data.rating >= 1
        && request.resource.data.rating <= 5
        && request.resource.data.text is string
        && request.resource.data.text.size() > 0
        && request.resource.data.text.size() <= 1000
        && request.resource.data.images is list
        && request.resource.data.images.size() <= 4
        // 구매 검증: 동일 orderId 의 orders 문서가 내 소유 & PAID
        && exists(/databases/$(db)/documents/orders/$(request.resource.data.orderId))
        && get(/databases/$(db)/documents/orders/$(request.resource.data.orderId)).data.userId == request.auth.uid
        && get(/databases/$(db)/documents/orders/$(request.resource.data.orderId)).data.status == 'PAID';
      allow update: if false;  // 불변: 수정은 삭제 후 재작성
      allow delete: if isSelf(resource.data.userId) || isAdmin();
    }

    // ===== consultations (공개 폼) =====
    match /consultations/{id} {
      // 공개 폼이므로 누구나 생성 가능(서버 Rate Limit + 입력 검증이 1차 방어)
      allow create: if request.resource.data.name is string
        && request.resource.data.phone is string
        && request.resource.data.region is string
        && request.resource.data.buildingType is string
        && request.resource.data.status == '신규';
      // 열람·수정은 관리자만
      allow read, update, delete: if isAdmin();
    }
  }
}
```

## Storage 규칙

Firebase 콘솔 → Storage → 규칙 탭.

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // 프로필 이미지 (확장 시)
    match /avatars/{uid}/{file} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.uid == uid
        && request.resource.size < 2 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }

    // 리뷰 이미지 — WebP 강제, 2MB 상한
    match /reviews/{uid}/{orderId}/{file} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.uid == uid
        && request.resource.size < 2 * 1024 * 1024
        && request.resource.contentType == 'image/webp';
    }

    // 나머지 경로 전부 차단
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## 주요 보호 효과

| 공격 시나리오 | 규칙 방어 지점 |
|---|---|
| 공격자가 자기 user 문서의 `role` 을 `ADMIN` 으로 수정 | `users` update 에서 `role == resource.data.role` 체크로 차단 |
| 결제 없이 Firestore 에 `orders/{id}` 직접 작성 | `orders` create 에서 `status == 'PAID'` + userId 일치로는 차단 불가 → 본질적으로는 서버 Admin SDK 로만 쓰게 해야 완전 차단. 현재는 클라이언트 쓰기 허용하되 악용 시 주문 추적 가능(경제적 손실은 Toss 승인이 필수이므로 0) |
| 남의 주문에 리뷰 작성 | `reviews` create 에서 orderId 의 userId 가 `request.auth.uid` 와 일치 강제 |
| 이미지 대신 5MB 임의 파일 업로드 | Storage 규칙의 `contentType == 'image/webp'` + size 제한 |
| 관리자가 아닌 사용자가 상담 목록 열람 | `consultations` read 에서 `isAdmin()` 체크 |

## 규칙 테스트

Firebase 콘솔 → 규칙 → **규칙 플레이그라운드** 에서:

1. **시뮬레이션 요청**: `update /users/OTHER_UID` with role `ADMIN` → 차단 확인
2. **읽기**: 비로그인으로 `/orders/SOMEID` 읽기 → 차단 확인
3. **작성**: 로그인 사용자가 남의 orderId 로 `/reviews` 생성 → 차단 확인

## 운영 전 필수

- [ ] 위 규칙을 그대로 배포
- [ ] 플레이그라운드에서 핵심 시나리오 5건 이상 테스트
- [ ] 실제 앱 동작(결제·리뷰·관리자) 이 차단 없이 정상 수행되는지 확인
- [ ] 규칙 변경 시 반드시 PR 리뷰 (잘못된 규칙은 데이터 유출 직결)
