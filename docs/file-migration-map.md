# 파일 이동 맵

기준 문서: `D:/download/saju_master_plan.html`

## 목적

Day 2에서는 현재 동작 중인 화면을 바로 옮기지 않는다.

- URL과 배포를 깨지 않기 위해 현재 라우트는 유지한다.
- 대신 "어느 파일이 어디로 가야 하는지"를 먼저 고정한다.
- Day 3~Day 7 작업은 이 문서를 기준으로 실제 이동한다.

## 현재 -> 목표 구조

| 현재 위치 | 목표 위치 | 비고 |
| --- | --- | --- |
| `src/app/page.tsx` | `src/app/(public)/page.tsx` | 공개 홈 라우트 |
| `src/components/home/*` | `src/features/home/*` | 홈 전용 섹션 컴포넌트 |
| `src/components/site-header.tsx` | `src/features/shared-navigation/site-header.tsx` | 전역 내비 |
| `src/app/saju/[slug]/page.tsx` | `src/app/(service)/saju/[readingId]/page.tsx` | 서비스 핵심 결과 페이지 |
| `src/lib/saju/report.ts` | `src/domain/saju/report/build-report.ts` | 결과 조립 로직 |
| `src/components/detail-unlock.tsx` | `src/features/saju-report/detail-unlock.tsx` | 결과 유료 확장 UI |
| `src/app/credits/page.tsx` | `src/app/(service)/checkout/coins/page.tsx` | 코인 센터 |
| `src/app/credits/success/page.tsx` | `src/app/(service)/checkout/success/page.tsx` | 결제 완료 |
| `src/app/membership/page.tsx` | `src/app/(service)/membership/page.tsx` | 멤버십 소개 |
| `src/app/my/page.tsx` | `src/app/(account)/my/page.tsx` | MY 대시보드 |
| `src/app/my/profile/page.tsx` | `src/app/(account)/my/profile/page.tsx` | 내/가족 프로필 |
| `src/app/my/results/page.tsx` | `src/app/(account)/my/results/page.tsx` | 결과보관함 |
| `src/app/my/billing/page.tsx` | `src/app/(account)/my/billing/page.tsx` | 결제/구독 관리 |
| `src/components/my/profile-manager.tsx` | `src/features/account/profile-manager.tsx` | 계정 기능 UI |
| `src/components/my/subscription-manager.tsx` | `src/features/billing/subscription-manager.tsx` | 구독 관리 UI |
| `src/lib/account.ts` | `src/server/services/account-service.ts` | 계정 조회 서비스 |
| `src/lib/profile.ts` | `src/domain/account/profile.ts` + `src/server/repositories/profile-repository.ts` | 도메인 + 저장소 분리 |
| `src/lib/subscription.ts` | `src/domain/billing/subscription.ts` + `src/server/services/billing-service.ts` | 상태 규칙 + 서비스 분리 |
| `src/lib/payments/toss.ts` | `src/domain/billing/packages.ts` + `src/server/services/payment-service.ts` | 상품 정의와 외부 API 분리 |
| `src/app/api/payments/confirm/route.ts` | `src/app/api/billing/confirm/route.ts` | billing API 그룹 |
| `src/app/api/subscription/manage/route.ts` | `src/app/api/billing/subscription/route.ts` | billing API 그룹 |
| `src/app/api/profile/route.ts` | `src/app/api/profile/route.ts` | 유지, 내부 구현만 분리 |
| `src/app/api/family-profiles/route.ts` | `src/app/api/family-profiles/route.ts` | 유지, 내부 구현만 분리 |
| `src/lib/saju/pillars.ts` | `src/domain/saju/engine/pillars.ts` | 계산 엔진 |
| `src/lib/saju/readings.ts` | `src/server/services/reading-service.ts` | 생성/조회 서비스 |
| `src/lib/supabase/*` | `src/server/supabase/*` | 서버 인프라 계층 |

## 우선 이동 순서

1. 홈
2. 결과
3. 결제/멤버십
4. MY
5. API 경로와 도메인/서비스 분리

## 이동 규칙

1. 먼저 새 위치에 파일을 복사/분리한다.
2. 기존 위치는 한 단계 동안 thin wrapper 또는 re-export로 유지한다.
3. 라우트 경로가 바뀌는 경우 redirect 또는 rewrite 전략을 먼저 준비한다.
4. Vercel preview에서 검증 후 기존 위치를 정리한다.
