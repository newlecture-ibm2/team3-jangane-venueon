# 영어 상태코드 → 한글 매핑 제거 리팩토링

## 배경

현재 백엔드는 상태 테이블에서 `{id, label}` 형태의 객체를 내려주도록 이미 전환되어 있지만, 프론트엔드 여러 곳에서 여전히 **영어 문자열(`PAID`, `DRAFT` 등)을 switch/case로 한글 변환**하는 레거시 패턴이 남아 있습니다.

또한 이미 공통 컴포넌트인 `StatusTag`(`components/ui/StatusTag.tsx`)가 `payment`, `course`, `recruitment`, `report` 4개 도메인을 지원하면서 영어/한글 모두 처리하고 있어, 중복 매핑 로직이 각 페이지에 산재해 있는 상황입니다.

---

## 문제 발견 현황

### 유형 A: 영어 코드를 switch/case로 한글 매핑 (가장 심각)

| # | 파일 | 매핑 대상 | 위치 |
|---|---|---|---|
| 1 | [host/page.tsx](file:///home/young/workspace/team3-jangane-venueon/frontend/src/app/host/page.tsx#L22-L54) | `PAID→결제완료`, `REGISTERED→신청완료` 등 | `getOrderStatusLabel()`, `getOrderStatusClass()` |
| 2 | [host/payments/page.tsx](file:///home/young/workspace/team3-jangane-venueon/frontend/src/app/host/payments/page.tsx#L32-L64) | 동일 (복붙) | `getOrderStatusLabel()`, `getOrderStatusClass()` |
| 3 | [host/payments/[id]/page.tsx](file:///home/young/workspace/team3-jangane-venueon/frontend/src/app/host/payments/%5Bid%5D/page.tsx#L31-L47) | 동일 | `getOrderStatusLabel()`, `getStatusClass()` |
| 4 | [orders/refund/page.tsx](file:///home/young/workspace/team3-jangane-venueon/frontend/src/app/orders/refund/page.tsx#L30-L38) | `PAID→결제 완료`, `REFUNDED→환불 완료` 등 | `getStatusBadge()` |
| 5 | [mypage/orders/[id]/page.tsx](file:///home/young/workspace/team3-jangane-venueon/frontend/src/app/mypage/orders/%5Bid%5D/page.tsx#L103-L112) | `PAID→결제 완료`, `REFUND_REQUESTED→환불 대기` 등 | `getStatusTag()` |

### 유형 B: 한글 label을 직접 문자열 비교 (깨지기 쉬움)

| # | 파일 | 비교 대상 | 위치 |
|---|---|---|---|
| 6 | [host/events/page.tsx](file:///home/young/workspace/team3-jangane-venueon/frontend/src/app/host/events/page.tsx#L70-L75) | `label === '진행중'`, `label === '종료됨'`, `label === '모집마감'` | 카드 뱃지 조건 분기 |
| 7 | [host/events/[id]/_components/DetailHeader.tsx](file:///home/young/workspace/team3-jangane-venueon/frontend/src/app/host/events/%5Bid%5D/_components/DetailHeader/DetailHeader.tsx#L10-L17) | `case '모집중'`, `case '모집예정'`, `case '모집마감'` | `getStatusClass()` |

---

## 수정 방향

### 방안: `id` 기반 분기 + `StatusTag` 공통 컴포넌트 활용

백엔드가 `{id: 2, label: '모집중'}` 형태로 내려주므로:

1. **조건 분기는 `id`로** — 한글 문자열 비교 대신 숫자 id로 비교 (안정적)
2. **표시는 `label` 그대로** — 한글 매핑 함수 불필요, 백엔드가 내려준 `label` 직접 사용
3. **스타일(variant/class) 결정은 `id` 기반** — `id`에 따라 CSS 클래스나 Tag variant를 선택
4. **가능한 곳은 `StatusTag` 공통 컴포넌트 사용** — 이미 만들어진 공통 컴포넌트를 활용하여 중복 제거

---

## Proposed Changes

### 1. `host/page.tsx` — 대시보드 주문 상태

> [!IMPORTANT]
> `host/page.tsx`와 `host/payments/page.tsx`에 동일 함수가 **복붙**되어 있습니다. 주문 상태 API가 현재 `status: string`(영어)으로 내려오면 `StatusTag domain="payment"`를 사용하면 됩니다. 만약 `{id, label}` 객체로 이미 전환됐다면 label을 직접 표시하고 id로 스타일 분기합니다.

- `getOrderStatusLabel()` / `getOrderStatusClass()` 제거
- `<StatusTag domain="payment" status={order.status} />` 로 교체

### 2. `host/payments/page.tsx` — 동일 수정

### 3. `host/payments/[id]/page.tsx` — 동일 수정

### 4. `orders/refund/page.tsx` — `getStatusBadge()` 제거 → `StatusTag` 사용

### 5. `mypage/orders/[id]/page.tsx` — `getStatusTag()` 제거 → `StatusTag` 사용

### 6. `host/events/page.tsx` — 한글 비교 → id 비교
```diff
- {event.status?.label === '진행중' || event.status?.label === '종료됨' ? (
+ {event.status?.id === 3 || event.status?.id === 4 ? (

- event.status.label === '종료됨' ? styles.badgeEnded : styles.badgeOngoing
+ event.status?.id === 4 ? styles.badgeEnded : styles.badgeOngoing

- event.recruitmentStatus?.label === '모집마감' ? styles.badgeClosed : ''
+ event.recruitmentStatus?.id === 3 ? styles.badgeClosed : ''
```

### 7. `host/events/[id]/_components/DetailHeader.tsx` — `Record` 맵 패턴으로 교체

> `events/[id]/page.tsx`에서 이미 사용 중인 `Record<number, ...>` 맵 패턴을 표준으로 통일합니다.

```diff
- const getStatusClass = (label: string | undefined) => {
-   switch (label) {
-     case '모집중': return styles.statusPUBLISHED;
-     case '모집예정': return styles.statusDRAFT;
-     case '모집마감': return styles.statusENDED;
-     default: return styles.statusDRAFT;
-   }
- };
+ const RECRUIT_STATUS_CLASSES: Record<number, string> = {
+   1: styles.statusDRAFT,      // 모집예정
+   2: styles.statusPUBLISHED,  // 모집중
+   3: styles.statusENDED,      // 모집마감
+ };

- <span className={`${styles.statusBadge} ${getStatusClass(recruitmentStatus?.label)}`}>
+ <span className={`${styles.statusBadge} ${RECRUIT_STATUS_CLASSES[recruitmentStatus?.id ?? 0] || styles.statusDRAFT}`}>
```

---

## Open Questions

> [!IMPORTANT]
> 현재 `host/page.tsx`와 `host/payments/page.tsx`의 주문 API(`/host/orders`)가 `status`를 **영어 문자열**(예: `"PAID"`)로 내려주는지, 아니면 이미 `{id, label}` 객체로 전환되었는지에 따라 수정 방향이 달라집니다. 백엔드의 현재 응답 형태를 확인해주세요.

## Verification Plan

### Automated Tests
- `npm run build` 통과 확인 (TypeScript 타입 에러 없음)

### Manual Verification
- 각 페이지에서 상태 뱃지가 올바르게 표시되는지 브라우저에서 확인
