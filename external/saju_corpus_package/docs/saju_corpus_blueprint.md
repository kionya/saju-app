# 사주/명리 고전 코퍼스 구축 청사진

작성일: 2026-04-21  
대상 사이트: 달빛선생 (`https://saju-app-lac.vercel.app`)

---

## 1. 문제 인식

현재 목표는 명리 핵심 고전과 관련 공공/학술 데이터를 수집해, 사이트 내 해석·검색·RAG 근거 레이어로 재사용 가능한 코퍼스로 만드는 것이다.  
문제는 단순 수집이 아니라 **판본 통제, 라이선스 통제, 출처 추적, 상업적 재사용 가능성, 장/절/문단 단위 구조화**가 동시에 맞아야 한다는 점이다.

### 지금 바로 확인된 핵심 사실
1. `Chinese Text Project (ctext)`는 실제 API를 제공하지만, **URN 기반 접근 / 요청 제한 / 인증 요구 / 자동 다운로드 금지**가 명시되어 있다.
2. `zh.wikisource`는 MediaWiki API로 구조화 수집이 가능하지만, 작품별로 **완전성 차이와 판본 차이**가 크다.
3. `淵海子平`, `子平真詮`, `滴天髓`, `三命通會`, `窮通寶鑑`은 **서명은 비슷해도 실제로는 원전/평주본/주석본/사庫본/위키본이 섞여 있어** “동일 작품”으로 뭉뚱그리면 안 된다.
4. `RISS`, `DBpia`는 논문 검증에는 유용하지만, **원문 대량 크롤링/상업적 재사용의 직접 소스**로 쓰면 안 된다.
5. 국내 공공 소스는 `data.go.kr` 경유 `한국고전번역원`, `조선왕조실록`, `기상청 조선왕조실록 기상기록`이 더 안정적이다.

---

## 2. 원인 분석

### 2.1 정확성 리스크
- 같은 제목이라도 **원전 / 평주본 / OCR판 / 커뮤니티 교정본**이 섞여 있음
- 장/절 구성이 소스마다 다를 수 있음
- 일부 위키 소스는 **미완성 / 출처 불명** 상태임

### 2.2 법적/운영 리스크
- ctext는 **자동 다운로드 금지**
- DBpia는 **크롤링, 대량 다운로드, 영리 목적 이용**을 제한
- RISS SAM API는 **기관 대상 발급**, 개인 사업에 바로 쓰기 어려움

### 2.3 제품화 리스크
- 단순 TXT 저장으로 끝내면:
  - 챕터 이동
  - 개념 검색
  - 주석/직역/독음 분리
  - 판본 간 diff
  - AI 답변의 근거 인용
  을 지원하기 어렵다.

---

## 3. 개선 방안

## 3.1 작품별 소스 오브 트루스(Source of Truth) 결정

| canonical work | 추천 1차 소스 | 추천 2차 소스 | 공개 가능 판단 | 비고 |
|---|---|---|---|---|
| 淵海子平 | 단일 1차 소스 지정 보류 | ctext + zh.wikisource 병행 대조 | 조건부 | 위키문헌은 미완성/출처 불명, ctext도 community text |
| 子平真詮 | 단일 1차 소스 지정 보류 | ctext `子平真詮評注` + 외부 스캔 대조 | 조건부 | 위키문헌 exact page 부재, 평주본과 원전 구분 필요 |
| 滴天髓 | zh.wikisource `滴天髓` | ctext `滴天髓闡微` | 가능 | `闡微`는 주석본 레이어로 분리 저장 |
| 窮通寶鑑 | zh.wikisource `穷通宝鉴` | ctext `穷通宝鉴` | 가능 | 공개용 1차 텍스트로 가장 안정적 |
| 三命通會 | zh.wikisource `三命通會 (四庫全書本)` | ctext OCR/대체 디지털판 | 가능 | 일반 `三命通會` 페이지는 권10~12 결락이므로 사용 금지 |

### 3.2 수집 우선순위

#### Phase 1 — 바로 서비스 가능한 공개 코퍼스
- `三命通會 (四庫全書本)`
- `穷通宝鉴`
- `滴天髓`
- `한국고전번역원_고전원문`
- `조선왕조실록 원문`
- `조선왕조실록 인물 데이터`
- `기상청 조선왕조실록 기상기록`

#### Phase 2 — 검증 후 공개 코퍼스
- `淵海子平`
- `子平真詮 / 子平真詮評注`
- ctext 비교본, OCR 대조본, 스캔본 교감 레이어

#### Phase 3 — AI/검색 고도화
- 용어 사전(용신, 격국, 십신, 조후, 통관, 억부)
- passage embedding
- 개념 ↔ 원문 매핑
- 답변 하단 근거 문단 자동 인용

---

## 4. 권장 DB 설계

사용자 요구 구조 `[고전명 - 편/장 - 한문 원문 - 한글 독음 - 직역 - 해설]`는 그대로 유지하되, 실제 저장은 정규화가 필요하다.

### 정규화 테이블
- `sources`: 원천 시스템 정보
- `works`: canonical work
- `work_versions`: 판본/소스별 개별 버전
- `sections`: 편/권/장/절 트리
- `passages`: 문단 단위 원문
- `readings_ko`: 한글 독음
- `translations_ko`: 직역/의역
- `commentaries`: 해설
- `crossrefs`: 관련 고전/관련 구절 연결
- `validation_runs`, `validation_diffs`: 판본 대조 이력

### 사용자 조회용 View
- `v_classic_export_flat`

이 View가 바로 아래 필드를 반환하도록 설계:
- canonical_work_zh
- canonical_work_ko
- edition_name
- section_path
- section_title
- passage_no
- original_text_zh
- reading_ko
- literal_translation_ko
- commentary_ko
- provenance_source
- provenance_ref
- license_label
- verification_status

---

## 5. 수집 파이프라인

### 5.1 Acquisition
1. Wikisource:
   - `action=parse` 로 섹션/링크/HTML 구조 확보
   - `action=query&prop=revisions` 로 wikitext 확보
2. Ctext:
   - `readlink`, `gettext` 사용
   - **apikey 또는 등록 IP가 없는 대량 수집 모드는 금지**
3. Korea public data:
   - data.go.kr XML/XLS 다운로드 후 batch parse
4. Academic metadata:
   - DBpia/RISS는 논문 메타데이터 및 대조표 위치 파악 용도만 사용

### 5.2 Normalize
- 전통/간체 분리 저장
- 특수문자, 이체자, 공백, 주석 기호 정규화
- 원문과 정규화문을 모두 저장

### 5.3 Verify
- `source A` vs `source B` 문자단위 diff
- 장/절 수 불일치 탐지
- OCR 오염 패턴 탐지
- 결손/중복 문단 flagging

### 5.4 Enrich
- 독음 생성
- 직역 생성
- 해설 생성
- 개념 태깅(오행/십신/격국/조후/신살/대운/세운 등)

### 5.5 Serve
- 검색 API
- 원문 뷰어 API
- 개념별 근거 API
- AI 답변 근거 API

---

## 6. 사이트 접목 방식

현재 사이트는 `사주`, `명리`, `타로`, `궁합`, `별자리`, `띠운세` 축으로 구성되어 있고, `사주 원국`, `오행 균형`, `격국`, `용신`, `대운`, `세운` 중심의 심화 리포트 UX가 이미 보인다.  
따라서 코퍼스는 **별도 콘텐츠 저장소**가 아니라, `명리 해석 페이지 하단의 근거 레이어`로 붙이는 것이 가장 효율적이다.

### 권장 UI 블록
1. **고전 근거**
   - 현재 해석에 매칭된 문단 1~3개
2. **원문 펼쳐보기**
   - 원문 / 독음 / 직역 / 해설 탭
3. **판본 비교**
   - 동일 문단의 위키문헌/ctext diff
4. **관련 개념**
   - 예: `상관견관`, `식신생재`, `조후`, `용신`
5. **출처 배지**
   - `Wikisource`, `CTP`, `ITKC`, `실록` 등

### 권장 API
- `GET /api/classics/works`
- `GET /api/classics/works/:slug/tree`
- `GET /api/classics/passages/:id`
- `GET /api/classics/search?q=...`
- `GET /api/classics/evidence?concept=용신`
- `GET /api/classics/diff?left=...&right=...`

---

## 7. 릴리스 기준

### Release A — public safe
- `三命通會 (四庫全書本)`
- `穷通宝鉴`
- `滴天髓`
- 공공 사료(XML/XLS) 계열

### Release B — review required
- `淵海子平`
- `子平真詮`
- ctext OCR 계열 비교본

### Blocklist
- 일반 `三命通會` (권10~12 결락)
- 위키문헌에 없는 `子平真诠` exact page를 있는 것처럼 취급
- DBpia/RISS 원문 대량 적재
- ctext 자동 대량 다운로드

---

## 8. KPI / 임팩트

### 데이터 KPI
- canonical work 커버리지: 5/5
- 공개 가능한 1차 코퍼스 커버리지: 3/5 이상
- passage-level provenance 부착률: 100%
- license label 부착률: 100%
- diff 검수 완료율: 95%+

### 제품 KPI
- 근거 문단 호출 latency: 200ms 이하
- 개념 검색 정확도(top-3 passage hit rate): 80%+
- AI 답변 근거 첨부율: 100%
- 사용자 심화 클릭률(해석 → 원문 펼쳐보기): 15%+

### 운영 KPI
- 수동 검수 backlog
- 결손 문단 수
- 중복 문단 수
- OCR suspect 문단 수
- 승인 대기 API 수

---

## 9. 반드시 지켜야 할 운영 원칙

1. `canonical work` 와 `source edition` 을 절대 혼동하지 말 것  
2. `원전` 과 `평주본/주석본` 을 다른 version 으로 저장할 것  
3. `공개 가능 라이선스` 와 `검증 전용 라이선스` 를 분리할 것  
4. AI가 생성한 독음/직역/해설은 원문과 같은 테이블에 합쳐서 덮어쓰지 말고 별도 layer로 둘 것  
5. 모든 사용자 응답에 `source_name`, `work_version`, `section_path`, `passage_id` 를 남길 것  

---

## 10. 첨부 파일 설명

- `saju_source_manifest.xlsx` : 검증된 소스 인벤토리
- `saju_source_manifest.csv` : 동일 내용 CSV
- `saju_corpus_schema.sql` : PostgreSQL 기준 스키마
- `collectors/wikisource_client.ts` : 위키문헌 수집 모듈
- `collectors/ctext_client.ts` : ctext 제한 준수형 조회 모듈
- `collectors/source_configs.json` : 작품/소스 레지스트리
- `integration/nextjs_reference_api.ts` : 사이트 연동용 예시 API

---