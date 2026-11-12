# K-ONE SeoulEdu

> 역할: 저장소 첫 안내 문서. 현재 폴더 구조와 로컬 실행 방법을 안내하며, 기획·DB·FAQ 세부 기준은 `docs/`의 담당 문서를 따른다.

## 프로젝트 개요

K-ONE SeoulEdu는 로그인 기반 FAQ 검색 사이트다. 정적 프런트엔드(`frontend/`), Java·Spring Boot API(`backend/`), MySQL 데이터베이스를 한 Git 저장소에서 관리한다. 로컬 MySQL은 Docker Compose로 실행하고 DB 구조와 초기 FAQ 변경은 Flyway 마이그레이션으로 관리한다.

## 현재 구현

- 로그인·로그아웃·현재 사용자·CSRF 토큰을 포함한 세션 인증
- FAQ 카테고리·주제·검색·페이징·상세 조회와 FAQ 열람 기록
- 관리자 전용 상담원 계정 조회·개설·비밀번호 변경·삭제 API 및 화면
- 검색 홈 대시보드와 최근 7일 조회 FAQ·최근 열람 항목·당일 조회 주제
- 대분류·기간별 FAQ 통계 페이지
- OpenAPI 명세와 Swagger UI
- Flyway V1~V8 마이그레이션 파일

프런트엔드는 `frontend/data/faq.json`을 API 대신 사용하지 않는다. 해당 파일은 이전 정적 시연 자료로 남아 있으며 실제 화면 데이터는 인증된 백엔드 API에서 가져온다. V7·V8의 DB 적용 여부는 각 개발 DB의 `flyway_schema_history`에서 확인한다.

## 주요 폴더

```text
KONE-SeoulEdu/
  frontend/       # HTML·CSS·JavaScript 화면
  backend/        # Spring Boot API 및 Flyway 마이그레이션
  docs/           # 기획·DB 설계·FAQ 자료·실습·진행 현황
  compose.yaml    # 로컬 MySQL 서비스
  .env            # 로컬 DB 비밀값, Git 추적 제외
  AGENTS.md       # 프로젝트 공통 개발 규칙
```

## 로컬 실행

### 준비

- Docker Desktop 및 WSL 2
- Java 21
- 저장소 루트의 `.env`에 로컬 `MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD`
- `backend/src/main/resources/application-local.properties`에 로컬 DB 접속 설정
- 최초 실행 시 필요한 경우 관리자 초기 생성 환경변수 `KONE_ADMIN_USERNAME`, `KONE_ADMIN_PASSWORD`

`.env`와 `application-local.properties`는 Git에 포함하지 않는다. 새 PC에서는 두 파일을 저장소 밖의 안전한 설정값으로 다시 만든다. 실제 비밀번호를 채팅·스크린샷·Git에 기록하지 않는다.

빈 `users` 테이블에 첫 관리자를 만들 때만 로컬 프로필에서 `app.bootstrap-admin.enabled=true`와 `KONE_ADMIN_USERNAME`, `KONE_ADMIN_PASSWORD`를 설정한다. 초기 생성이 끝나면 이 기능을 끄거나 설정을 제거한다. 기존 사용자 테이블이 비어 있지 않으면 초기 생성 기능은 시작을 중단한다.

### MySQL 시작

저장소 루트에서 PowerShell을 열고 실행한다.

```powershell
docker compose up -d mysql
docker compose ps
```

MySQL 컨테이너가 `Up` 상태인지 확인한다.

### 백엔드 시작

```powershell
cd backend
.\gradlew.bat bootRun
```

Spring Boot가 로컬 MySQL에 접속하면 Flyway가 아직 적용되지 않은 마이그레이션을 순서대로 실행한다. Swagger UI는 `http://localhost:8080/swagger-ui/index.html`에서 확인한다. 서버 종료는 실행 중인 터미널에서 `Ctrl+C`다.

### 프런트엔드 시작

VS Code Live Server로 `frontend/index.html`을 열거나 저장소 루트에서 정적 HTTP 서버를 실행한다.

```powershell
python -m http.server 5500
```

그 경우 브라우저에서 `http://localhost:5500/frontend/`로 접속한다. 백엔드 CORS는 로컬 개발 주소를 기준으로 설정돼 있다.

### 통계 화면

로그인 후 사이드바 아래쪽의 `통계` 메뉴에서 2027년 양품화 사업 및 유지보수의 기간별 통계를 확인한다. 화면의 지표는 DB 열람 이력 기준이다.

## 진행 현황과 기준 문서

- 단계별 구현·검증 및 남은 작업: [Flyway·OpenAPI 실습 매뉴얼](docs/Flyway-OpenAPI-DB연동-실습-매뉴얼.md)
- 제품 요구사항과 사용자 흐름: [FAQ 검색 사이트 기획안](docs/faq-search-site-plan.md)
- DB 구조 및 마이그레이션 기준: [DB 스키마 설계안](docs/DB-스키마-설계-초안.md)
- FAQ 작성·정리 원칙: [FAQ 자료 정리와 DB 구축 기준](docs/FAQ-자료-정리와-DB-구축-기준.md)
- 상세 로드맵: [DB 연결 전 준비와 작업 로드맵](docs/DB-연결-전-준비와-집에서-진행할-작업-로드맵.md)
