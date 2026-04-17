# server

서버 전용 인프라와 서비스 계층이다.

- Supabase 연결
- 저장소(repository)
- 읽기/결제/계정 서비스
- RAG 검색

`app/api`와 서버 컴포넌트는 이 계층을 통해 데이터에 접근한다.
