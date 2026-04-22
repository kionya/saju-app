# saju_corpus_package

## 구성
- `docs/saju_corpus_blueprint.md`
- `docs/saju_corpus_schema.sql`
- `collectors/source_configs.json`
- `collectors/wikisource_client.ts`
- `collectors/ctext_client.ts`
- `integration/nextjs_reference_api.ts`
- `saju_source_manifest.csv`
- `saju_source_manifest.xlsx`

## 바로 시작하는 순서
1. PostgreSQL에 `docs/saju_corpus_schema.sql` 적용
2. `saju_source_manifest.xlsx` 기준으로 1차 공개 소스 선정
3. `wikisource_client.ts` 로 위키문헌 page title별 raw 수집
4. `ctext_client.ts` 는 메타데이터/단건 비교용으로만 사용
5. 공공데이터(XML/XLS) 파서를 별도 작성하여 `works`, `work_versions`, `sections`, `passages` 적재
6. `integration/nextjs_reference_api.ts` 형태로 사이트 API 연결
7. AI 해석 화면 하단에 passage-level provenance 노출

## 권장 출시 범위
- `三命通會 (四庫全書本)`
- `穷通宝鉴`
- `滴天髓`
- 조선왕조실록/한국고전번역원 공공 데이터

## 출시 보류 범위
- `淵海子平`
- `子平真詮`
- ctext OCR/커뮤니티 텍스트를 단독 1차 소스로 쓰는 공개판

## 운영 메모
- 원전/평주본/주석본/사庫본을 섞지 말 것
- 모든 사용자 응답에 source badge를 붙일 것
- 학술 플랫폼 원문을 상업용 본문 소스로 직접 복제하지 말 것