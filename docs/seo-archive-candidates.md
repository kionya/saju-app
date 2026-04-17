# SEO 더미 페이지 archive 후보

## 왜 archive 후보로 보나

현재 공개 SEO 페이지들은 유입 실험용 MVP로는 의미가 있지만, `사주 AI 사업 실행 계획서`의 핵심 서비스 축인
"시니어 친화 명리 서비스"와는 톤과 제품 구조가 다르다.

즉, 이 페이지들은 지금 당장 삭제 대상은 아니지만 핵심 서비스 코드와 같은 우선순위로 계속 확장하면 안 된다.

## archive 후보 목록

- `src/app/today-fortune`
- `src/app/tarot/daily`
- `src/app/zodiac`
- `src/app/star-sign`
- `src/app/dream-interpretation`
- `src/lib/free-content-pages.ts`
- `src/lib/home-content.ts`
- `src/lib/site-navigation.ts`

## Day 2 결정

1. 위 페이지들은 즉시 삭제하지 않는다.
2. 운영 URL이 걸려 있으므로 라우트는 당분간 유지한다.
3. 대신 새 구조에서 "핵심 서비스"와 분리해 `archive/seo-mvp` 후보군으로 관리한다.
4. 이후 실제 트래픽/SEO 데이터 확인 전까지는 신규 기능을 붙이지 않는다.

## 다음 단계

- Day 3: 홈에서 핵심 서비스 진입선과 SEO 유입선을 분리
- Day 4 이후: archive 후보 페이지를 공통 네비게이션과 카피 기준에서 점진적으로 분리
- Day 10 전: 유지 / 마이크로사이트 분리 / 삭제 여부 결정
