# 사주 앱 재구축 10일 계획

기준 문서: `D:/download/saju_master_plan.html`

## Day 1 결론

현재 리포지토리는 "망가진 프로젝트"라기보다, 서로 다른 방향의 MVP가 한 저장소 안에 동시에 쌓인 상태다.

- 현재 코드 기준 정체성: SEO형 운세 플랫폼 + 코인형 결제 MVP
- 마스터플랜 기준 정체성: 시니어 친화 명리 상담형 AI 서비스
- 문제의 핵심: 제품 방향, 정보구조, 배포 체계가 서로 다른 기준으로 누적됨

따라서 이번 10일은 "기능 추가"보다 아래 3개를 우선한다.

1. 기준 문서를 단일 소스 오브 트루스로 고정한다.
2. 도메인 경계를 다시 나눈다.
3. 운영 배포 체계를 GitHub + Vercel preview/prod 한 줄기로 통일한다.

## 현재 코드 분류

### 유지

- 사주 계산 엔진의 기반
  - `src/lib/saju/pillars.ts`
  - `src/lib/saju/types.ts`
  - `src/lib/saju/readings.ts`
- Supabase 연결 기반
  - `src/lib/supabase/client.ts`
  - `src/lib/supabase/server.ts`
  - `supabase/migrations/001_initial.sql`
  - `supabase/migrations/002_credit_functions.sql`
  - `supabase/migrations/003_profiles.sql`
- App Router/Route Handler 기본 골격
  - `src/app/api/readings/route.ts`
  - `src/app/api/auth/callback/route.ts`

### 폐기 또는 보관

- 현재 무료 SEO 더미/가벼운 바이럴 페이지 세트
  - `src/app/today-fortune`
  - `src/app/tarot/daily`
  - `src/app/zodiac`
  - `src/app/star-sign`
  - `src/app/dream-interpretation`
- 현재 홈용 카피/목업 데이터
  - `src/lib/home-content.ts`
  - `src/lib/free-content-pages.ts`
  - `src/lib/site-navigation.ts`

이 영역은 완전 삭제보다 `archive` 후보로 본다. 추후 SEO 유입용 보조 채널로 다시 살릴 수 있다.

### 재설계

- 제품의 첫 인상과 진입 구조
  - `src/app/page.tsx`
  - `src/components/home/*`
  - `src/components/site-header.tsx`
- 결과 페이지 경험
  - `src/app/saju/[slug]/page.tsx`
  - `src/lib/saju/report.ts`
  - `src/components/detail-unlock.tsx`
- 계정/보관함/구독 UX
  - `src/app/my/*`
  - `src/components/my/*`
  - `src/lib/account.ts`
  - `src/lib/profile.ts`
  - `src/lib/subscription.ts`
- 결제/멤버십 구조
  - `src/app/credits/*`
  - `src/app/membership/*`
  - `src/lib/payments/toss.ts`
  - `src/app/api/payments/confirm/route.ts`
  - `src/app/api/subscription/manage/route.ts`
- 법적 고지와 운영 메시지
  - `src/app/terms/page.tsx`
  - `src/app/privacy/page.tsx`

## 새 구조 원칙

### 원칙 1. 페이지와 도메인을 분리한다

- `app/`는 라우팅과 화면 진입만 담당
- `domain/`은 사주, 결제, 계정, 안전정책 같은 핵심 규칙 담당
- `server/`는 Supabase, 외부 API, 저장소 접근 담당
- `features/`는 실제 화면 단위 조합 담당

### 원칙 2. "운세 콘텐츠 사이트"와 "명리 상담형 서비스"를 분리한다

- 공개 SEO 페이지는 유입 채널
- 사주 입력/리포트/구독/보관함은 본 서비스
- 둘을 같은 홈에 섞되, 코드 구조에서는 분리한다

### 원칙 3. 지금은 Next.js 모놀리스를 유지한다

- 당장 FastAPI를 분리하기보다 먼저 경계를 코드 안에서 명확히 만든다
- 이후 RAG/AI 파이프라인이 커지면 `server/ai` 또는 별도 서비스로 뺀다

## 권장 폴더 구조

```text
src/
├─ app/
│  ├─ (public)/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ today/page.tsx
│  │  ├─ about/page.tsx
│  │  └─ legal/
│  │     ├─ terms/page.tsx
│  │     └─ privacy/page.tsx
│  ├─ (account)/
│  │  ├─ login/page.tsx
│  │  └─ my/
│  │     ├─ page.tsx
│  │     ├─ profile/page.tsx
│  │     ├─ results/page.tsx
│  │     └─ billing/page.tsx
│  ├─ (service)/
│  │  ├─ saju/
│  │  │  ├─ new/page.tsx
│  │  │  └─ [readingId]/page.tsx
│  │  ├─ compatibility/
│  │  │  ├─ new/page.tsx
│  │  │  └─ [resultId]/page.tsx
│  │  ├─ membership/page.tsx
│  │  └─ checkout/
│  │     ├─ coins/page.tsx
│  │     └─ success/page.tsx
│  └─ api/
│     ├─ auth/callback/route.ts
│     ├─ readings/route.ts
│     ├─ profile/route.ts
│     ├─ family-profiles/route.ts
│     ├─ billing/
│     │  ├─ checkout/route.ts
│     │  ├─ confirm/route.ts
│     │  └─ subscription/route.ts
│     └─ ai/
│        ├─ interpret/route.ts
│        └─ chat/route.ts
├─ features/
│  ├─ home/
│  ├─ saju-intake/
│  ├─ saju-report/
│  ├─ compatibility/
│  ├─ account/
│  ├─ billing/
│  ├─ legal/
│  └─ shared-navigation/
├─ domain/
│  ├─ saju/
│  │  ├─ engine/
│  │  ├─ report/
│  │  ├─ prompts/
│  │  ├─ validators/
│  │  └─ types.ts
│  ├─ billing/
│  ├─ account/
│  ├─ safety/
│  └─ content/
├─ server/
│  ├─ supabase/
│  ├─ repositories/
│  ├─ services/
│  │  ├─ reading-service.ts
│  │  ├─ billing-service.ts
│  │  ├─ account-service.ts
│  │  ├─ ai-service.ts
│  │  └─ safety-service.ts
│  └─ rag/
├─ shared/
│  ├─ ui/
│  ├─ layout/
│  ├─ config/
│  └─ utils/
└─ content/
   ├─ corpus/
   ├─ seo/
   └─ prompts/
```

## 10일 실행 계획

### Day 1

- 기준 문서 분석
- 현재 리포지토리 감사
- 유지 / 폐기 / 재설계 분류
- 새 구조 원칙 확정

산출물:

- 이 문서

### Day 2

- App Router route group 재설계
- 실제 폴더 뼈대 생성
- 기존 파일 이동 계획 작성

산출물:

- 새 `app/`, `features/`, `domain/`, `server/` 골격

### Day 3

- 홈과 내비게이션 재설계
- 시니어 친화 첫 화면으로 재구성
- 공개 SEO와 본 서비스 진입선 분리

산출물:

- 새 홈 IA
- 새 헤더/하단 내비

### Day 4

- 사주 입력 플로우 재설계
- 무입력/저입력/정밀입력 3단계 구조 반영
- 결과 생성 API와 저장 흐름 정리

산출물:

- `saju/new`
- 입력 검증 규칙

### Day 5

- 결과 페이지를 리포트형 구조로 재설계
- 점수, 요약, 행동 제안, 근거, 인용 UI 분리
- 현재 `report.ts`를 도메인 레이어로 분리

산출물:

- 새 결과 페이지
- 결과 템플릿 컴포넌트

### Day 6

- MY/프로필/가족 프로필/보관함 구조 정리
- 저장 가치 중심 UX로 재배치

산출물:

- 새 MY 대시보드
- 프로필 관리 흐름

### Day 7

- 코인/구독/Plus 구조 재설계
- 결제 전 고지, 해지 예약, 재개, 환불 기준 UI 정리

산출물:

- 새 checkout/billing 구조
- 상태 전이 규칙

### Day 8

- 법적/안전 가드레일 반영
- safe redirect 정책 초안
- AI 응답 구조와 금지 주제 처리 설계

산출물:

- safety 도메인 초안
- 응답 정책 문서

### Day 9

- RAG/프롬프트/해석 파이프라인 구조 설계
- 당장 구현 범위와 후속 분리 범위 나누기

산출물:

- `domain/saju/prompts`
- `server/rag`
- AI 호출 계약

### Day 10

- GitHub/Vercel 운영 체계 정상화
- preview/prod 브랜치 전략 정리
- QA 체크리스트, 출시 전 점검표 작성

산출물:

- 배포 규칙 문서
- 출시 체크리스트

## 운영 규칙

1. `main`에는 직접 실험하지 않는다.
2. 모든 작업은 기능 브랜치 + preview 배포로 검증한다.
3. claimable preview는 테스트용으로만 쓰고, 운영 검증은 Git 연동 Vercel 프로젝트에서만 한다.
4. 하루 끝날 때마다 다음 3개를 남긴다.
   - 오늘 결정한 것 1개
   - 끝낸 것 1개
   - 내일 할 일 3개

## Day 1 이후 바로 시작할 일

1. 새 폴더 구조 스캐폴딩
2. 기존 홈/결과/결제/MY를 새 구조로 이동
3. 현재 SEO 더미 페이지는 `archive` 후보로 분리
