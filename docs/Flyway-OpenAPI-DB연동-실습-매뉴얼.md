# Flyway·OpenAPI로 FAQ DB 연동하기: 실습 매뉴얼

> 역할: 사용자가 직접 수행하는 DB·Flyway·OpenAPI·Spring Boot 실습 절차 안내. 기능 요구는 `faq-search-site-plan.md`, DB 설계는 `DB-스키마-설계-초안.md`를 기준으로 하며, 이 문서는 아직 실행하지 않은 단계를 완료로 간주하지 않는다.

## 1. 목적

이 매뉴얼은 FAQ 데이터를 DB에 넣고, 백엔드 API로 제공해 기존 FAQ 검색 사이트에 연결하는 과정을 단계별로 진행하기 위한 작업 안내서다. 사용자가 SQL과 API를 직접 이해하고 기록할 수 있도록 각 단계에서 목적·파일·실행 결과를 확인한다.

Flyway는 DB 구조와 초기 데이터 변경을 순서대로 기록·적용한다. OpenAPI는 백엔드 API의 요청과 응답 계약을 문서화하고 Swagger UI에서 확인할 수 있게 한다. 두 도구는 서로 다른 대상을 관리하며 함께 사용한다.

현재 로컬 실습 환경은 MySQL 8.4, Docker Desktop, Java 21, Spring Boot, Gradle - Groovy로 구성했다. 운영 배포 환경은 별도 단계에서 결정한다.

## 2. 프로젝트에서 만들 데이터

FAQ 운영 데이터의 현재 기준은 다음 6개 필드다.

| 필드 | 의미 |
|---|---|
| `id` | 승인 FAQ의 고유 식별자 |
| `category` | 대분류 |
| `topic` | 세부 업무 주제 |
| `title` | 질문형으로 한정하지 않는 항목 제목 |
| `content` | 근거를 바탕으로 정리한 안내 본문 |
| `keywords` | 검색을 보완하는 별칭·표현 |

핵심 대분류는 `2027년 양품화 사업`, `유지보수`, `2027년 디벗 재배치·여분기기 수거 사업`이다. 양품화 사업 전에 학교가 하는 준비 절차는 양품화 사업 카테고리에 둔다. 재배치·여분기기 수거는 별도 카테고리로 유지하되 규모가 작다는 점을 반영해 FAQ를 억지로 늘리지 않는다.

회원·권한 데이터와 FAQ 열기 횟수 집계는 FAQ 콘텐츠와 분리한다. 집계 구조는 기존 기획의 `faq_usage_stats`를 출발점으로 검토한다.

## 3. 진행 원칙

- 현재 완료 기준을 충족하기 전 다음 Phase 작업을 시작하지 않는다.
- DB 제품이나 프레임워크를 사용자가 결정하기 전 임의로 코드에 고정하지 않는다.
- 개발 DB와 운영 DB의 접속 정보를 분리하고 비밀값을 저장소에 기록하지 않는다.
- 각 DB 변경을 순서가 있는 새 마이그레이션으로 추가한다. 이미 공유·적용한 마이그레이션 파일을 고쳐 이력을 다시 쓰지 않는다.
- 스키마 변경과 FAQ 초기 데이터 적재를 구분해 검토한다.
- OpenAPI 계약과 실제 API 구현이 일치하는지 확인한다.
- DB 초기화, 데이터 삭제, 운영 DB 변경은 별도 명시 승인 없이 실행하지 않는다.
- Phase별 진행 상황과 확인된 결과를 이 매뉴얼의 현재 상태에 반영한다. 비밀값은 기록하지 않는다.

## 4. Phase별 실습

### Phase 0. 기술 선택과 로컬 환경 준비

**목표**

DB·백엔드·개발 환경을 확정하고, 로컬에서 빈 애플리케이션과 DB에 연결할 준비를 한다.

**결정할 항목**

- 확정: MySQL을 Docker Desktop 컨테이너로 실행
- 확정: Java + Spring Boot를 Spring Initializr로 생성
- 확정: OpenAPI 명세를 먼저 작성하고 Swagger UI로 확인
- 확정: 개발·테스트 DB는 로컬에서 운영 DB와 분리하고 운영 환경은 배포 단계에서 결정
- 확정: Spring Initializr에서 Gradle - Groovy 선택
- Flyway는 Spring Boot 프로젝트 의존성으로 포함하고 DB별 지원 모듈을 함께 구성

**완료 기준**

- 선택한 구성과 이유가 기록되어 있다.
- 로컬 애플리케이션에서 개발 DB 접속을 확인한다.
- 접속 비밀번호·키가 Git 추적 파일에 들어가지 않는다.

#### Phase 0 설정 순서

현재 확인된 준비 상태:

- Java 21 설치됨
- WSL 및 Ubuntu 설치·초기 설정 완료
- Docker Desktop 앱 실행 가능
- Docker Dashboard에서 빈 컨테이너 목록과 `Resource Saver mode`가 보임. 이는 컨테이너가 없는 유휴 화면이다.
- 사용자의 Windows PowerShell에서 Docker Client 29.6.2와 Docker Desktop Server 4.85.0 / Engine 29.6.2 연결 확인 완료

##### 0-1. Docker 엔진 연결 확인

1. Docker Desktop을 열고 대시보드가 표시될 때까지 기다린다. 컨테이너가 하나도 없을 때 `Resource Saver mode`가 표시되는 것은 오류가 아니다.
2. 시작 메뉴에서 일반 Windows PowerShell을 열고 아래 명령을 실행한다.

```powershell
docker version
docker info
```

3. `docker version` 결과에 `Client`와 `Server` 정보가 모두 표시되고, `docker info`가 서버 정보를 출력하면 연결된 것이다.
4. `permission denied` 또는 서버 연결 오류가 나오면 Docker Desktop을 먼저 열었는지 확인하고, 일반 PowerShell을 새로 열어 다시 확인한다. `docker system prune`, `wsl --unregister`, Docker의 초기화(Factory reset)는 실행하지 않는다.

##### 0-2. 작업 폴더 구성

아래 구조를 권장한다. 실제 생성은 사용자가 이 단계에 도달해 진행할 때 한다.

```text
KONE-SeoulEdu/
  frontend/                    # FAQ 정적 프런트엔드
  backend/                     # Spring Boot 프로젝트
  docs/                        # 기획·DB 설계·FAQ·실습 문서
  compose.yaml                 # 로컬 MySQL 컨테이너 정의
  .env                         # 로컬 비밀값, Git에 추가하지 않음
  .gitignore
  AGENTS.md                    # 프로젝트 개발 규칙
  README.md
```

프런트엔드와 백엔드는 한 저장소의 `frontend/`, `backend/` 형제 프로젝트로 관리한다. Docker Compose 파일과 `.env`는 저장소 루트에 둬 실행 위치와 환경변수 탐색을 단순하게 유지한다. 프로젝트 문서는 `docs/`에 모은다.

##### 0-3. Compose로 로컬 MySQL 준비

`compose.yaml`은 컨테이너·포트·환경값·영구 저장 볼륨을 선언하는 파일이다. 아래는 학습용 개발 DB 예시다. 운영 DB 접속 정보는 넣지 않는다.

```yaml
services:
  mysql:
    image: mysql:8.4
    container_name: kone-faq-mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:?Set MYSQL_ROOT_PASSWORD in .env}
      MYSQL_DATABASE: kone_faq_dev
      MYSQL_USER: kone_app
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:?Set MYSQL_PASSWORD in .env}
    ports:
      - "3307:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

- `mysql:8.4`는 MySQL 8.4 LTS 계열을 사용한다. 같은 포트의 로컬 MySQL과 충돌할 가능성을 줄이려고 Windows 측 포트는 `3307`로 두고, 컨테이너 내부 포트는 기본 `3306`으로 둔다.
- `.env`에는 `MYSQL_ROOT_PASSWORD`와 `MYSQL_PASSWORD`를 직접 정해 기록한다. 로컬 개발 전용의 서로 다른 비밀번호를 사용하고 채팅·스크린샷·Git에는 올리지 않는다.
- `.gitignore`에 `.env`를 추가하고, 공유용 `.env.example`에는 실제 비밀번호 대신 자리표시자만 둔다.
- `MYSQL_USER`는 앱 전용 계정이다. 애플리케이션 접속에 root 계정을 사용하지 않는다.
- 이름 있는 `mysql_data` 볼륨은 컨테이너를 다시 만들어도 DB 파일을 보존한다.

Compose 파일과 `.env`를 준비한 뒤 PowerShell에서 Compose 파일이 있는 폴더로 이동해 실행한다.

```powershell
docker compose config -q
docker compose up -d
docker compose ps
docker compose logs -f mysql
```

`docker compose config -q`가 오류 없이 끝나는지 확인한 뒤 컨테이너를 시작한다. `-q`는 실제 비밀번호가 포함된 설정 전체를 출력하지 않고 유효성만 확인한다. 로그에서 MySQL이 `ready for connections` 상태가 될 때까지 기다린다. 로그 보기를 끝낼 때 `Ctrl+C`를 누르면 로그 보기만 종료된다.

DB 접속을 확인하려면 새 PowerShell에서 아래를 실행한다. 비밀번호는 프롬프트에 입력하며 화면에 보이지 않는다.

```powershell
docker exec -it kone-faq-mysql mysql -u kone_app -p kone_faq_dev
```

MySQL 프롬프트에서 다음 SQL을 실행한다.

```sql
SELECT DATABASE(), VERSION();
SHOW TABLES;
EXIT;
```

초기 DB 연결 확인 시점에는 테이블이 없었다. 이후 Phase 2에서 Flyway를 적용해 테이블을 생성했다.

##### 0-4. Spring Boot 기본 프로젝트 생성

Spring Initializr에서 아래 설정을 권장한다.

| 항목 | 설정 |
|---|---|
| Project | Gradle - Groovy |
| Language | Java |
| Spring Boot | 생성 화면의 안정 버전 기본 선택 |
| Group | `kr.co.kone` |
| Artifact / Name | `faq-api` |
| Packaging | Jar |
| Java | 21 |
| Dependencies | Spring Web, JDBC API, MySQL Driver, Flyway Migration |

프로젝트 ZIP을 내려받아 압축을 `KONE-SeoulEdu/backend/`에 푼다. Gradle - Groovy 프로젝트는 `build.gradle` 파일을 사용한다. Spring Boot 생성 버전과 의존성 호환성을 유지하고 버전을 따로 임의 고정하지 않는다.

`backend/build.gradle`에는 Flyway와 MySQL 지원 의존성이 들어 있다. API 계약은 `backend/src/main/resources/static/openapi.yaml`에서 관리하고 Swagger UI에서 읽도록 설정했다.

##### 0-5. 개발 DB 연결 설정

비밀번호를 저장소에 넣지 않도록 로컬 전용 프로필 파일을 사용한다.

- 추적 가능한 `application.properties`에는 `spring.profiles.active=local`만 둔다.
- `src/main/resources/application-local.properties`는 로컬에서만 만들고 `.gitignore`에 추가한다.
- 로컬 파일 예시는 다음과 같다. `YOUR_LOCAL_PASSWORD`는 `.env`의 `MYSQL_PASSWORD`와 동일한 값으로 직접 바꾸며 실제 값을 대화에 보내지 않는다.

```properties
spring.datasource.url=jdbc:mysql://localhost:3307/kone_faq_dev
spring.datasource.username=kone_app
spring.datasource.password=YOUR_LOCAL_PASSWORD
spring.flyway.enabled=true
```

로컬 DB 연결 설정은 `backend/src/main/resources/application-local.properties`에 둔다. Phase 2에서는 Flyway를 켜고 마이그레이션 파일을 추가했다. Spring Boot는 `spring.datasource.*` 설정으로 JDBC 연결 정보를 읽는다.

프로젝트를 IntelliJ에서 열고 `FaqApiApplication`의 실행 버튼을 누른다. 콘솔에서 애플리케이션 시작 로그와 Hikari 연결 풀 시작을 확인한다. 연결 오류가 있으면 URL 포트 `3307`, 사용자 `kone_app`, 로컬 비밀번호, MySQL 컨테이너 상태를 순서대로 대조한다. 비밀번호를 로그나 대화에 붙여넣지 않는다.

##### 0-6. 종료·재시작 및 데이터 보존

```powershell
docker compose stop mysql
docker compose start mysql
docker compose ps
```

`stop`은 컨테이너를 멈추고 `start`는 다시 실행한다. 컨테이너를 지워도 named volume은 별도로 남는다. `docker compose down -v`는 DB 볼륨까지 삭제하므로 데이터가 필요할 때 실행하지 않는다.

##### Phase 0 완료 체크

- [x] 일반 PowerShell에서 Docker Client·Server 정보를 확인했다. Client 29.6.2, Docker Desktop Server 4.85.0, Engine 29.6.2.
- [x] Docker Compose로 MySQL 컨테이너가 실행된다.
- [x] 앱 전용 계정으로 접속해 `SELECT DATABASE(), VERSION();` 결과를 확인했다. `kone_faq_dev`, MySQL `8.4.13` 응답을 확인했고, `SHOW TABLES`가 비어 있는 것은 아직 마이그레이션 전이므로 정상이다.
- [x] Spring Boot 4.1.2가 Java 21·Gradle 9.8.2 환경에서 시작하고 DB 연결을 확인했다.
- [x] `.gitignore`에 `.env`와 `backend/src/main/resources/application-local.properties`가 포함됐음을 사용자 확인으로 반영했다.

**Phase 0 완료 기록 — 2026-11-11**

- MySQL 8.4.13 로컬 컨테이너와 앱 전용 계정 접속을 확인했다.
- Spring Boot에서 SQL `SELECT 1` 실행을 확인했다.
- 로컬 비밀 설정 파일을 Git 추적에서 제외하도록 구성했다.
- Phase 2에서 Flyway V1을 적용해 다섯 업무 테이블을 생성했다. `flyway_schema_history`에서 버전 1, 설명 `create faq schema`, 성공 여부 `1`을 확인했다.
- `SHOW TABLES`에서 `faq_categories`, `faq_keywords`, `faq_usage_stats`, `faqs`, `users`, `flyway_schema_history`를 확인했다.
- 당시 FAQ 테이블이 없던 상태에서 Phase 0 DB 접속을 확인했다. 이후 Phase 2에서 생성된 다섯 업무 테이블의 구조 확인 결과는 아래 Phase 2 기록을 따른다.
- 임시 `DatabaseConnectionCheck.java` 파일 제거 여부는 확인되지 않았다. 다음 기능 작업 전에 진단용 파일을 제거한다.

Phase 0 공식 참고 문서:

- [Docker Compose 설정 검증 명령](https://docs.docker.com/reference/cli/docker/compose/config/)
- [MySQL LTS와 Innovation 릴리스 안내](https://dev.mysql.com/doc/refman/8.4/en/mysql-releases.html)
- [Spring Boot SQL 데이터소스와 Flyway 안내](https://docs.spring.io/spring-boot/how-to/data-initialization.html)

### Phase 1. API 계약 초안 작성

**목표**

프런트엔드가 필요로 하는 요청과 응답을 먼저 정리한다.

**초기 API 후보**

| 기능 | 예시 경로 | 설명 |
|---|---|---|
| 로그인 | `POST /api/auth/login` | 사용자 인증 후 세션 생성 |
| 로그아웃 | `POST /api/auth/logout` | 세션 종료 |
| 현재 사용자 | `GET /api/auth/me` | 로그인 사용자·역할 확인 |
| FAQ 대분류 | `GET /api/faq-categories` | 화면 필터용 대분류 목록 |
| FAQ 검색·목록 | `GET /api/faqs` | 검색어·카테고리·주제·페이지 조회 |
| FAQ 상세 | `GET /api/faqs/{id}` | ID로 항목 조회 |
| 항목 열기 기록 | `POST /api/faqs/{id}/open` | 공개할 집계 규칙에 따라 조회 횟수 반영 |
| 회원 목록 | `GET /api/admin/members` | 관리자 전용 목록 |
| 회원 생성·수정·삭제 | `/api/admin/members` | 관리자 전용 CRUD |

경로와 응답은 현재 구현 및 `openapi.yaml`에 반영된 계약이다. 변경 시 명세와 컨트롤러를 함께 대조한다. API 명세에는 필드 형식, 필수 여부, 검색·페이지 규칙, 오류 응답, 인증 요구를 기록한다. 비밀번호 등 민감값이 응답에 포함되지 않도록 한다.

OpenAPI 계약은 `backend/src/main/resources/static/openapi.yaml`에서 관리하고, Swagger UI에서 이 YAML을 읽는다. FAQ 본문 키는 `content`다. 레거시 정적 시연 JSON의 `answer`와 혼용하지 않는다. 확정된 논리 DB 구조는 `docs/DB-스키마-설계-초안.md`를 따른다. 이 문서는 마이그레이션 SQL이 아니다.

Swagger UI 의존성은 Spring Boot 4.1.x 호환 범위의 springdoc 3.2.x를 사용한다. API 계약은 `backend/src/main/resources/static/openapi.yaml`에서 명세 우선으로 관리하며, 구현된 컨트롤러를 Swagger UI에서 호출해 확인한다.

참고: [springdoc-openapi Gradle 설정 및 Swagger UI 경로](https://springdoc.org/getting-started.html)

**완료 기준**

- FAQ 검색·목록·상세와 인증·관리자 흐름의 요청·응답·오류 계약이 검토됐다.
- Swagger UI 또는 동등한 OpenAPI 뷰어에서 명세를 읽을 수 있다.

### Phase 2. Flyway로 DB 구조 만들기

**목표**

DB 변경을 SQL 파일로 기록하고 로컬 DB에 순서대로 적용한다.

**적용 결과**

- `backend/src/main/resources/db/migration/V1__create_faq_schema.sql`에 초기 업무 테이블 생성 SQL을 작성했다. V5에서 사용자별·기간별 통계를 위한 `faq_view_history`가 추가됐다.
- 로컬 프로필에서 Flyway를 활성화하고 `bootRun`으로 애플리케이션을 실행했다.
- Flyway가 V1을 검증·적용했고 `flyway_schema_history`에 성공 기록을 남겼다.
- MySQL `SHOW TABLES`에서 다섯 업무 테이블과 Flyway 이력 테이블을 확인했다.
- 초기 업무 테이블의 `DESCRIBE` 결과를 설계와 대조했다. 컬럼, 자료형, 기본키와 고유성 설정이 일치했다.
- `SHOW CREATE TABLE`로 관계와 삭제 동작을 확인했다. `faqs.category_id`는 카테고리 참조 시 삭제를 제한하고, FAQ 삭제 시 키워드·열람 집계 행은 함께 삭제된다.
- 확인한 인덱스: FAQ의 카테고리·주제 및 생성 시각, 키워드 검색용 `keyword` 인덱스.

마이그레이션 파일명은 `V1__create_faq_schema.sql` 형식이다. 이미 적용된 V1은 수정하지 않고, 이후 스키마 변경은 새 버전의 파일로 추가한다.

**학습·확인 항목**

- `CREATE TABLE`, 자료형, 기본키·외래키, `NOT NULL`, `UNIQUE`
- 검색·조회에 필요한 인덱스의 목적
- Flyway가 마이그레이션 적용 이력을 추적하는 방식
- 신규 DB와 기존 DB에 같은 버전의 변경을 적용하는 절차

**완료 기준**

- [x] 로컬 DB에 첫 마이그레이션을 적용했다.
- [x] Flyway 이력에서 버전과 성공 여부를 확인했다.
- [x] 업무 테이블의 컬럼·제약조건이 설계와 일치하는지 확인했다.

### Phase 3. 승인 FAQ 초기 데이터 적재

**목표**

승인된 FAQ 후보를 운영 테이블 구조에 맞게 준비하고 개발 DB에 적재한다.

**진행 결과**

- 통합 원본 39건 중 38건을 승인하고 1건(2024학년도 한시적 애플펜슬 지원)을 제외했다.
- V4에서 참고 FAQ 331건을 추가해 UI에서 총 369건이 표시되는 상태까지 확장했다. 이 참고 FAQ 집합은 초기 승인 38건과 별도로 검토한다.
- V7은 기존 양품화 FAQ를 보강하고 양품화 FAQ 12건을 추가한다. V8은 기존 유지보수 FAQ와 키워드를 보강하며, V9는 Android FAQ를 보강하고 V10은 ChromeOS FAQ를 분류·보완한다. V11은 iOS FAQ ID 188~214를 분류·보완하고 ID 188을 iOS로 바로잡는다. V12는 Windows FAQ ID 305~314와 ChromeOS Flex FAQ ID 315~326을, V13은 Whale FAQ ID 327~331을 분류·보완한다. V14는 DBS FAQ ID 123~133과 MDM FAQ ID 134~156을 `시스템·관리` topic으로 분류·보완한다. V15는 이미 적재된 일반·운영 FAQ ID 36~122의 topic·제목 및 일부 본문을 정리한다. V16은 기존 FAQ 6건의 본문을 목록 구조로 정리하고, V17은 기존 FAQ 4건의 양품화 수량·수리동의서·학교 예산 일괄 구매·유지보수 수리 견적 안내와 검색 키워드를 보완한다. V8~V17은 FAQ 행을 추가하거나 삭제하지 않는다. 각 개발 DB의 적용은 `flyway_schema_history`에서 확인한다.
- 2027년 신규 펜슬 지급 안내에 신입생 기기 수와 양품화 대상 기기 수의 조건, iPad 호환펜 20%·그 외 OS 디벗 15% 기준안, 교육청 정책 미확정 상태를 반영했다.
- 유지보수 안내는 문의 기기의 보급 연도 기준으로 적용하도록 정리했다.
- Flyway V2 카테고리 입력을 애플리케이션 시작 로그에서 성공 확인했다.
- `backend/src/main/resources/db/migration/V3__insert_initial_faqs.sql`의 FAQ 38건, 키워드, 열람 집계 초기값을 Flyway로 적용했다.
- 집계 확인 결과: 카테고리 3개, FAQ 38건, 키워드 180개, 열람 집계 38행, 0이 아닌 열람 횟수 0건, V3 성공 기록 1건.

**작업**

- FAQ 카테고리·주제·제목·내용·키워드 값을 검증하고, ID와 `created_at`은 DB 자동 생성을 확인한다.
- 필수값 누락, 분류 오류, 외래 키 연결, 내용의 근거 누락을 확인한다.
- 초기 데이터 적재 방법을 정하고 SQL 또는 재실행 안전한 데이터 적재 절차를 기록한다.
- 콘텐츠 변경과 스키마 변경을 구분한다.

**완료 기준**

- [x] 승인된 38건만 개발 DB에 적재된다. 제외한 한시 지원 항목은 포함되지 않는다.
- [x] 적재 건수와 연관 데이터 수가 확인됐다: FAQ 38건, 키워드 180개, 열람 집계 38행.
- [x] Flyway V3의 성공 적용 이력을 확인했다.
- [ ] 제목·내용 표본을 통합 원본과 대조한다.

### Phase 4. FAQ 조회 API와 OpenAPI 검증

**목표**

서버 세션 인증을 적용하고, 인증된 상담원·관리자가 명세대로 FAQ를 조회할 수 있게 한다.

**작업**

- DB 사용자 비밀번호를 BCrypt로 확인하고 로그인 세션·로그아웃·현재 사용자·CSRF 토큰 API를 구현한다.
- FAQ 전체·카테고리·주제 조회, 검색, 페이지 처리, ID 상세 조회를 구현한다.
- FAQ API는 인증 필요, 관리자 경로는 ADMIN 역할 필요로 제한한다.
- 검색 시 ID·제목·내용·키워드의 대상과 제목 우선순위를 명세에 반영한다.
- 한국어 띄어쓰기·별칭 검색은 실제 대표 검색어로 검증한다.
- Swagger UI에서 정상 요청과 잘못된 요청을 실행해 응답을 확인한다.

**현재 구현 상태**

- 로그인·로그아웃·현재 사용자·CSRF API와 FAQ 카테고리·목록/검색·상세·열기 집계 API를 추가했다.
- FAQ 검색·열람 API는 세션 인증을 요구한다. 비밀번호는 BCrypt로 검증하고 변경 요청은 CSRF 토큰을 요구한다.
- 첫 관리자 계정이 필요한 경우 `app.bootstrap-admin.enabled=true`를 명시하고 `KONE_ADMIN_USERNAME`, `KONE_ADMIN_PASSWORD` 환경변수를 지정한다. 생성은 `users` 테이블이 비어 있을 때만 허용한다.
- `compileJava` 성공. 첫 서버 실행에서 Jackson 2 `ObjectMapper` 주입 오류가 발생해 Spring Boot 4의 Jackson 3 `JsonMapper`로 수정했다.
- 사용자가 Swagger UI에서 CSRF 토큰 발급과 관리자 로그인(200), 현재 사용자 조회, FAQ 목록 조회 성공을 확인했다.
- OpenAPI를 현재 구현과 대조해 검색 정렬 설명·검색 조건 제한을 갱신하고, 아직 구현하지 않은 관리자 회원 API는 Phase 5 범위로 옮겼다.
- Phase 4의 남은 상세·열람 집계·접근 제어 검증은 사용자가 완료로 간주하기로 결정했다. 문제가 발견되면 수정한다.

**완료 기준**

- OpenAPI 문서와 실제 API의 경로·필드·상태 코드가 일치한다.
- 승인 FAQ가 DB 조회 결과와 API 응답에서 일치한다.
- 인증 전후의 접근 제어가 정해진 계약대로 동작한다.

### Phase 5. 관리자 회원 API

**목표**

운영에 필요한 관리자 회원 기능을 서버에 구현한다. 로그인·세션 인증은 Phase 4에서 공통 기반으로 구현한다.

**작업**

- 상담원은 FAQ 조회만 하고 회원 관리는 하지 못하도록 역할을 검사한다.
- 관리자는 회원 목록·개설·수정·삭제를 수행할 수 있게 한다.
- 비밀번호는 안전한 해시 방식으로 저장하고 응답·로그에 노출하지 않는다.

**현재 구현 상태**

- 관리자 전용 `GET /api/admin/members`, `POST /api/admin/members`, `PUT /api/admin/members/{memberId}`, `DELETE /api/admin/members/{memberId}`를 구현했다.
- 회원 목록은 username 일부 문자열로 검색한다. 신규 계정은 COUNSELOR 역할로 생성하며 비밀번호는 BCrypt로 저장한다.
- 회원 응답에서 비밀번호를 제외한다. 비밀번호 변경은 PUT 요청으로 처리한다.
- 자기 자신의 관리자 계정과 마지막 관리자 계정은 삭제할 수 없도록 제한한다.
- 모든 쓰기 요청은 로그인 세션과 CSRF 토큰을 요구하도록 OpenAPI 계약을 갱신했다.
- `compileJava` 성공. 사용자가 Swagger에서 상담원 계정 생성·비밀번호 변경·삭제를 완료했다. 생성은 `201`, 삭제는 `204` 응답을 확인했다.

**완료 기준**

- [ ] 미인증·상담원 계정의 회원 관리 차단 응답을 별도로 확인한다.
- [x] 관리자 요청으로 회원 생성·비밀번호 변경·삭제 흐름을 Swagger에서 실행했다.
- [x] 생성 응답에 비밀번호가 포함되지 않음을 확인했다.

### Phase 6. 기존 FAQ 사이트 연결

**목표**

현재 정적 JSON 및 브라우저 임시 인증 흐름을 실제 API와 연결한다.

**작업**

- `app.js`·`browse.js`에서 서버 검색 API, 대분류·주제 필터, 서버 페이징을 연결한다.
- `auth.js`의 시연 로그인·브라우저 임시 회원을 세션 인증·회원 관리 API로 교체한다.
- 상세 API의 `content`를 기존 안전 Markdown 렌더러에 연결하고, 열람 기록 API를 호출한다.
- 검색·필터·페이징·URL 상태·직접 항목 링크와 오류 화면을 확인한다.
- 프런트엔드 개발 서버와 백엔드 간 세션 쿠키·CSRF·CORS 동작을 확인한다.

**현재 구현 상태**

- 공통 API 모듈 `frontend/assets/js/api.js`를 추가해 세션 쿠키, CSRF 토큰, 로그인·로그아웃, FAQ·회원 API 호출을 처리한다.
- `app.js`·`browse.js`를 API 기반 검색으로 바꾸고, 카테고리·주제 필터와 서버 페이징을 연결했다. FAQ 펼치기 시 상세 내용을 가져오고 열람 수를 기록한다.
- `render.js`는 API의 `content`·`contentSnippet`을 표시한다. 기존 `frontend/data/faq.json`은 전환 검증 전까지 보존한다.
- `auth.js`·`components.js`·`admin.html`을 실제 세션과 관리자 회원 API에 연결했다. 화면 표시는 확정된 username 기준이다.
- `SecurityConfig`에 로컬 프런트엔드 개발 주소(`localhost`/`127.0.0.1`, 포트 5173/5500)용 자격 증명 포함 CORS 설정을 추가했다.
- 프런트엔드 JavaScript 구문 검사와 백엔드 `compileJava` 성공.
- 사용자가 `http://127.0.0.1:5500/frontend/index.html`에서 `koneadmin` 로그인을 확인했고, 헤더 세션 사용자와 DB FAQ 38건·실제 대분류가 화면에 표시됐다. 프런트엔드와 백엔드 간 CORS·세션 쿠키·카테고리·목록 연결이 확인됐다.
- 최근 검색 기록은 Enter로 확정한 검색어만 사용자별 `sessionStorage`에 저장한다. 입력 중 결과는 디바운스로 계속 갱신하고, 한글 조합 중 Enter 및 최근 검색 칩 선택은 기록하지 않도록 구현했다. 실제 브라우저 확인은 남아 있다.
- 검색 결과·주제 필터·FAQ 상세·열람 이력·대시보드·통계·로그아웃·관리자 화면의 전체 회귀 확인은 완료 기록이 없다.

**완료 기준**

- [x] 프런트엔드 로그인과 MySQL FAQ 목록 표시가 브라우저에서 확인됐다.
- [ ] 검색, 대분류·topic 필터, 페이징, 직접 FAQ 링크를 회귀 확인한다.
- [ ] FAQ 상세 열기·닫기와 열람 횟수·사용자 이력 집계를 대조한다.
- [ ] 로그아웃·세션 만료 및 미인증 API 접근 차단을 확인한다.
- [ ] 상담원 계정의 관리자 API 차단과 관리자의 회원 관리 화면을 확인한다.
- [ ] 통계 페이지의 대분류·기간 필터와 DB 집계값을 대조한다.
- [ ] 모바일·키보드 접근성·오류 상태를 확인한다.
- [ ] 레거시 `frontend/data/faq.json` 제거 여부를 검토한다. API 화면에서 사용하지 않지만, 파일 삭제는 현재 범위에서 수행하지 않는다.

### Phase 7. 통합·배포 준비

**목표**

개발 DB에서 확인한 변경 절차와 애플리케이션을 배포 환경에서 안전하게 운영할 준비를 한다.

**작업**

- 새 환경에 마이그레이션을 적용하는 순서를 문서화한다.
- 환경별 접속 설정과 비밀값 관리 방법을 정리한다.
- 백업·복구와 장애 시 이전 애플리케이션 버전 호환성을 검토한다.
- 배포 DB의 스키마 변경은 별도 승인과 백업 계획을 확인한 뒤 진행한다.
- 회사 PC에서 Docker Desktop 설치 정책, JDK 21, Git 체크아웃, 무시된 `.env`·`application-local.properties` 재생성 절차를 확인한다.
- 실제 배포 호스팅·도메인·운영 DB·HTTPS 쿠키·CORS 허용 주소를 결정한다.

**완료 기준**

- 운영 환경에 적용할 변경 목록과 실행 절차가 검토됐다.
- 배포 주소에서 인증·권한·FAQ 기능을 점검했다.
- 복구 방법과 운영 담당 절차가 기록되어 있다.

## 5. 단계별 작업 기록 양식

각 Phase 작업은 다음 항목으로 기록한다.

```text
Phase:
목표:
변경 파일:
실행 명령:
예상 결과:
실제 결과:
배운 SQL/API 개념:
남은 질문·결정:
```

비밀번호, 토큰, 접속 문자열의 비밀 부분은 작업 기록·스크린샷·명세 예시에 넣지 않는다.

## 6. 현재 시작점과 미결정 항목

### Phase 0에서 선택한 구성

- DB: MySQL
- 로컬 DB 실행: Docker Desktop 컨테이너
- 백엔드: Java + Spring Boot
- Spring Boot 프로젝트 생성: Spring Initializr, Gradle - Groovy
- API 문서: OpenAPI 명세 우선 작성 후 Swagger UI에서 확인
- 환경 분리: 개발·테스트 DB는 로컬에서 운영 DB와 분리한다. 운영 DB는 배포 단계에서 결정한다.

### 현재 확인 상태

- Phase 0 완료: Docker·MySQL·Spring Boot 로컬 DB 연결
- Phase 2 완료 기록: Flyway V1 적용 및 초기 업무 테이블의 컬럼·인덱스·외래 키·삭제 규칙 확인 완료. V5에서 `faq_view_history`가 추가돼 현재 스키마는 FAQ·키워드·누적 통계·사용자별 열람 이력·회원 구조를 포함한다.
- Java 21 설치 확인
- Docker CLI 29.6.2 및 Docker Compose 5.3.1 설치 확인
- 하드웨어 가상화 사용, WSL 기능 활성화, WSL·Ubuntu 설치 및 Ubuntu 초기 설정 완료
- Docker Desktop Dashboard 실행 확인. 화면은 빈 컨테이너 목록과 `Resource Saver mode`를 표시함.
- Docker Desktop 엔진의 CLI 연결 확인 완료. 일반 Windows PowerShell에서 Client 29.6.2 및 Server Docker Desktop 4.85.0 / Engine 29.6.2가 반환됨.
- MySQL 컨테이너와 앱 전용 계정 접속 확인 완료: `kone_faq_dev`, MySQL `8.4.13`.
- Spring Boot 4.1.2·Gradle 9.8.2에서 DB 연결 및 Flyway 실행 확인 완료.
- Flyway V1 적용 확인: `flyway_schema_history`에 `1 / create faq schema / success=1` 기록.
- `SHOW TABLES`에서 V1의 초기 업무 테이블 생성과 구조 확인.
- Phase 4 완료(사용자 결정): 세션 인증·FAQ API 구현과 OpenAPI 대조 완료. Swagger에서 로그인, 현재 사용자, FAQ 목록 조회를 확인했다. 추가 검증 중 문제가 발견되면 수정한다.
- Phase 5 완료(사용자 확인): Swagger에서 회원 생성·비밀번호 변경·삭제를 실행했다. 미인증·상담원 권한 차단은 별도 확인 항목으로 남긴다.
- Phase 6 구현 상태: 프런트엔드 로그인과 FAQ 목록 표시를 브라우저에서 확인했다. 이후 UI에서 369건 검색 결과가 표시된 기록도 있다. 이는 화면 당시 상태이며 현재 DB의 최신 건수를 보증하지 않는다.
- 프런트엔드와 서버 API 연결 및 홈 대시보드·통계 페이지가 구현됐다. 전체 화면 흐름·권한·집계 검증은 완료 기록이 없다.
- FAQ 열람 누적 집계는 `faq_usage_stats`, 사용자·기간별 열람 기록은 V5 `faq_view_history`에서 관리한다.
- V7~V17 SQL 파일은 저장소에 추가됐으며 실제 개발 DB 적용 여부는 확인 전이다. V9는 Android FAQ를 보강했고 V10은 ChromeOS FAQ ID 215~304를 갱신했다. V11은 iOS FAQ ID 188~214를 분류·보완하며 ID 188을 바로잡는다. V12는 Windows FAQ ID 305~314 및 ChromeOS Flex FAQ ID 315~326을, V13은 Whale FAQ ID 327~331을, V14는 DBS·MDM FAQ ID 123~156을, V15는 일반·운영 FAQ ID 36~122를 분류·보완하며, V16은 FAQ 6건의 본문 가독성을 높이고 V17은 기존 FAQ 4건과 검색 키워드를 보완한다.

### 미결정 항목

- 실제 배포 환경·운영 DB·도메인
- V7~V17 개발 DB 적용 여부와 FAQ 최종 건수
- 대표 한국어 검색어·최근 검색 기록 동작 확인
- Phase 6 전체 브라우저 회귀 검증과 상담원 권한 차단
- 회사 PC에서 Docker Desktop 설치 가능 여부 및 로컬 비밀 설정 재구성

### 현재 단계와 다음 결정

- FAQ DB 통합 원본 `FAQ-DB-통합-원본.md`: 39건 중 38건 승인, 1건 제외. V3 적용 완료; 건수 확인 완료, 제목·내용 표본 대조는 남아 있다.
- OpenAPI 명세에 인증·FAQ 조회·관리자 회원 API 계약을 반영했다.
- Phase 6은 로그인·목록 표시까지 확인됐으며 전체 브라우저 회귀 검증이 남아 있다.
- 미인증·상담원 권한 차단 확인과 FAQ 제목·내용 표본 대조는 별도 잔여 확인 항목이다.
- DB 논리 설계와 V1 적용 구조의 대조를 마쳤다.
- Phase 3 잔여 작업은 FAQ 제목·내용 표본 대조와 참고자료의 중복·최신성 검토다.


