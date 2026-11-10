# Flyway·OpenAPI로 FAQ DB 연동하기: 실습 매뉴얼

## 1. 목적

이 매뉴얼은 FAQ 데이터를 DB에 넣고, 백엔드 API로 제공해 기존 FAQ 검색 사이트에 연결하는 과정을 단계별로 진행하기 위한 작업 안내서다. 사용자가 SQL과 API를 직접 이해하고 기록할 수 있도록 각 단계에서 목적·파일·실행 결과를 확인한다.

Flyway는 DB 구조와 초기 데이터 변경을 순서대로 기록·적용한다. OpenAPI는 백엔드 API의 요청과 응답 계약을 문서화하고 Swagger UI에서 확인할 수 있게 한다. 두 도구는 서로 다른 대상을 관리하며 함께 사용한다.

이 매뉴얼 작성 시점에는 DB 제품, 백엔드 언어·프레임워크, 실행·배포 환경이 확정되지 않았다. 해당 선택을 먼저 확정한 뒤 도구 버전과 명령어를 해당 환경에 맞춰 정한다.

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
- 매 단계에서 실행한 명령, 결과, 배운 SQL/API 개념, 미해결 문제를 작업 기록에 남긴다. 비밀값은 기록하지 않는다.

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
  compose.yaml                 # 로컬 MySQL 컨테이너 정의
  .env                         # 로컬 비밀값, Git에 추가하지 않음
  .env.example                 # 비밀값 없는 설정 예시
  backend/                     # Spring Boot 프로젝트
```

기존 FAQ 프런트엔드 `faq-search-site/`는 유지한다. 백엔드는 별도 `backend/`에 둬 정적 사이트와 API 책임을 분리한다.

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

초기 DB에는 FAQ 테이블이 아직 없다. 이 확인은 컨테이너·계정·DB 연결만 점검한다. 실제 테이블은 승인된 스키마를 설계한 뒤 Flyway로 만든다.

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

현재 `backend/build.gradle`에는 Flyway와 MySQL 지원 의존성이 이미 들어 있다. 마이그레이션 SQL은 아직 만들지 않았고, Flyway 실행은 로컬 프로필에서 꺼 둔다. API 계약은 `backend/src/main/resources/static/openapi.yaml`에 두고 Swagger UI에서 읽도록 설정했다.

##### 0-5. 개발 DB 연결 설정

비밀번호를 저장소에 넣지 않도록 로컬 전용 프로필 파일을 사용한다.

- 추적 가능한 `application.properties`에는 `spring.profiles.active=local`만 둔다.
- `src/main/resources/application-local.properties`는 로컬에서만 만들고 `.gitignore`에 추가한다.
- 로컬 파일 예시는 다음과 같다. `YOUR_LOCAL_PASSWORD`는 `.env`의 `MYSQL_PASSWORD`와 동일한 값으로 직접 바꾸며 실제 값을 대화에 보내지 않는다.

```properties
spring.datasource.url=jdbc:mysql://localhost:3307/kone_faq_dev
spring.datasource.username=kone_app
spring.datasource.password=YOUR_LOCAL_PASSWORD
spring.flyway.enabled=false
```

Phase 0에서는 테이블이 아직 없으므로 Flyway 자동 실행을 잠시 끈다. 실제 마이그레이션을 시작하는 Phase 2에서 설정을 켜고 SQL 파일을 추가한다. Spring Boot는 `spring.datasource.*` 설정으로 JDBC 연결 정보를 읽는다.

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
- [x] Spring Boot 4.1.2가 Java 21·Gradle 9.8.2 환경에서 시작하고 `SELECT 1` 결과를 확인했다.
- [x] `.gitignore`에 `.env`와 `backend/src/main/resources/application-local.properties`가 포함됐음을 사용자 확인으로 반영했다.

**Phase 0 완료 기록 — 2026-11-11**

- MySQL 8.4.13 로컬 컨테이너와 앱 전용 계정 접속을 확인했다.
- Spring Boot에서 SQL `SELECT 1` 실행을 확인했다.
- 로컬 비밀 설정 파일을 Git 추적에서 제외하도록 구성했다.
- FAQ 테이블은 아직 만들지 않았다. 승인된 FAQ 구조를 설계한 뒤 Flyway로 생성한다.
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

경로와 응답은 제안 초안이며 구현 전 확정한다. API 명세에는 필드 형식, 필수 여부, 검색·페이지 규칙, 오류 응답, 인증 요구를 기록한다. 비밀번호 등 민감값이 응답에 포함되지 않도록 한다.

현재 계약 초안은 `backend/src/main/resources/static/openapi.yaml`에서 관리하고, Swagger UI에서 이 YAML을 읽도록 설정한다. FAQ 콘텐츠 키는 `content`로 명세하고, 기존 프런트엔드 시연 데이터의 `answer`와 API 연결 단계에서 변환할 범위를 확인한다. DB 구조 제안은 루트의 `DB-스키마-설계-초안.md`에서 검토한다. 두 문서는 사용자 승인 전 제안이며 마이그레이션 SQL이 아니다.

Swagger UI 의존성은 Spring Boot 4.1.x 호환 범위의 springdoc 3.2.x를 사용한다. API 경로는 아직 서버 컨트롤러로 구현되지 않았으므로, Swagger UI는 우선 계약 문서 검토용이다.

참고: [springdoc-openapi Gradle 설정 및 Swagger UI 경로](https://springdoc.org/getting-started.html)

**완료 기준**

- FAQ 검색·목록·상세와 인증·관리자 흐름의 요청·응답·오류 계약이 검토됐다.
- Swagger UI 또는 동등한 OpenAPI 뷰어에서 명세를 읽을 수 있다.

### Phase 2. Flyway로 DB 구조 만들기

**목표**

DB 변경을 SQL 파일로 기록하고 로컬 DB에 순서대로 적용한다.

**예상 변경 단위**

1. FAQ·카테고리·키워드 저장 구조를 만드는 첫 마이그레이션
2. 회원·역할 구조를 만드는 마이그레이션
3. FAQ 열기 집계 구조를 만드는 마이그레이션
4. 필요 시 인덱스와 제약조건을 추가하는 후속 마이그레이션

파일명 형식과 SQL 세부 문법은 DB와 Flyway 구성 확정 뒤 정한다. 카테고리별 테이블 분리 여부와 키워드 저장 방식도 이 단계 설계 전에 결정한다. 현재 문서만으로 테이블 구조를 확정하지 않는다.

**학습·확인 항목**

- `CREATE TABLE`, 자료형, 기본키·외래키, `NOT NULL`, `UNIQUE`
- 검색·조회에 필요한 인덱스의 목적
- Flyway가 마이그레이션 적용 이력을 추적하는 방식
- 신규 DB와 기존 DB에 같은 버전의 변경을 적용하는 절차

**완료 기준**

- 빈 로컬 DB에 마이그레이션을 순서대로 적용할 수 있다.
- Flyway 이력에서 적용된 버전과 성공 여부를 확인할 수 있다.
- DB 구조와 제약조건이 승인된 설계와 일치한다.

### Phase 3. 승인 FAQ 초기 데이터 적재

**목표**

카테고리별 FAQ 초안 중 검토·승인된 항목만 DB에 적재한다.

**작업**

- FAQ 카테고리·주제·제목·내용·키워드 값을 검증하고, ID와 `created_at`은 DB 자동 생성을 확인한다.
- 필수값 누락, 분류 오류, 외래 키 연결, 내용의 근거 누락을 확인한다.
- 초기 데이터 적재 방법을 정하고 SQL 또는 재실행 안전한 데이터 적재 절차를 기록한다.
- 콘텐츠 변경과 스키마 변경을 구분한다.

**완료 기준**

- 승인 데이터만 개발 DB에 적재된다.
- 적재 후 건수와 표본 조회 결과가 원본 승인 데이터와 일치한다.
- 적재 절차를 빈 개발 DB에서 다시 수행할 수 있다.

### Phase 4. FAQ 조회 API와 OpenAPI 검증

**목표**

DB의 FAQ를 조회하는 API를 구현하고 명세대로 동작하는지 확인한다.

**작업**

- FAQ 전체·카테고리·주제 조회, 검색, 페이지 처리, ID 상세 조회를 구현한다.
- 검색 시 ID·제목·내용·키워드의 대상과 제목 우선순위를 명세에 반영한다.
- 한국어 띄어쓰기·별칭 검색은 실제 대표 검색어로 검증한다.
- Swagger UI에서 정상 요청과 잘못된 요청을 실행해 응답을 확인한다.

**완료 기준**

- OpenAPI 문서와 실제 API의 경로·필드·상태 코드가 일치한다.
- 승인 FAQ가 DB 조회 결과와 API 응답에서 일치한다.
- 인증 전후의 접근 제어가 정해진 계약대로 동작한다.

### Phase 5. 회원·인증·관리자 API

**목표**

운영에 필요한 로그인·세션과 관리자 회원 기능을 서버에 구현한다.

**작업**

- 서버 측 세션 또는 승인된 인증 방식을 구현한다.
- 상담원은 FAQ 조회만 하고 회원 관리는 하지 못하도록 역할을 검사한다.
- 관리자는 회원 목록·개설·수정·삭제를 수행할 수 있게 한다.
- 비밀번호는 안전한 해시 방식으로 저장하고 응답·로그에 노출하지 않는다.

**완료 기준**

- 미인증·상담원·관리자별 API 권한을 확인했다.
- 회원 변경 결과가 DB에 저장되고 새 요청에서도 유지된다.
- 비밀번호·세션 비밀값이 API 응답과 로그에 노출되지 않는다.

### Phase 6. 기존 FAQ 사이트 연결

**목표**

현재 정적 JSON 및 브라우저 임시 인증 흐름을 실제 API와 연결한다.

**작업**

- `app.js`·`browse.js`의 JSON 직접 요청을 FAQ API로 교체한다.
- `auth.js`의 시연 계정·브라우저 메모리 회원 데이터를 인증·회원 API로 교체한다.
- `answer` 기반 시연 데이터와 신규 `content` 모델 사이의 응답 매핑·전환 방식을 결정하고 적용한다.
- 검색·필터·페이징·URL 상태·직접 항목 링크와 오류 화면을 확인한다.

**완료 기준**

- 로그인, FAQ 검색·탐색, 답변/내용 펼침, 로그아웃, 관리자 회원 관리가 실제 DB 데이터로 동작한다.
- FAQ 내용이 보호 경로/API에서 미인증 사용자에게 노출되지 않는다.
- 기존 시연 데이터 제거 시점과 백업 상태를 확인한다.

### Phase 7. 통합·배포 준비

**목표**

개발 DB에서 확인한 변경 절차와 애플리케이션을 배포 환경에서 안전하게 운영할 준비를 한다.

**작업**

- 새 환경에 마이그레이션을 적용하는 순서를 문서화한다.
- 환경별 접속 설정과 비밀값 관리 방법을 정리한다.
- 백업·복구와 장애 시 이전 애플리케이션 버전 호환성을 검토한다.
- 배포 DB의 스키마 변경은 별도 승인과 백업 계획을 확인한 뒤 진행한다.

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
- Java 21 설치 확인
- Docker CLI 29.6.2 및 Docker Compose 5.3.1 설치 확인
- 하드웨어 가상화 사용, WSL 기능 활성화, WSL·Ubuntu 설치 및 Ubuntu 초기 설정 완료
- Docker Desktop Dashboard 실행 확인. 화면은 빈 컨테이너 목록과 `Resource Saver mode`를 표시함.
- Docker Desktop 엔진의 CLI 연결 확인 완료. 일반 Windows PowerShell에서 Client 29.6.2 및 Server Docker Desktop 4.85.0 / Engine 29.6.2가 반환됨.
- MySQL 컨테이너와 앱 전용 계정 접속 확인 완료: `kone_faq_dev`, MySQL `8.4.13`; 현재 테이블 없음
- Spring Boot 4.1.2·Gradle 9.8.2 프로젝트 생성 및 앱에서 `SELECT 1` 실행 확인 완료

### 미결정 항목

- 실제 배포 환경
- 컬럼 길이·필수 여부·외래 키 삭제 정책 등 세부 제약조건
- 키워드 저장·한국어 검색 방식
- 기존 `answer` 모델에서 `content` 모델로의 호환·전환 방법
- 관리 원본과 승인 FAQ의 초기 적재 방식

### 현재 단계와 다음 결정

- FAQ DB 통합 원본 `FAQ-DB-통합-원본.md`에 제목·내용 형식 후보 41건을 정리했다. 모두 초안 또는 검토 필요 상태이며 승인 데이터는 아직 없다. `yangwiki/reference/`가 없어 일부 페이지 인용 PDF·PPTX 원문은 대조 전이다.
- OpenAPI 명세와 DB 스키마 설계안은 사용자 검토 전 초안이다.
- Swagger UI는 OpenAPI YAML을 열도록 설정했지만 API 컨트롤러는 아직 없어 실제 요청 기능은 동작하지 않는다.
- 사용자 검토 후 API 계약·스키마·키워드 저장 방식·대표 FAQ 데이터를 확정한다. `yangwiki/reference/` 부재로 첨부 원문 대조가 필요한 항목도 확인한다.
- 승인된 설계를 반영한 뒤에만 다음 단계에서 Flyway 마이그레이션을 만든다.
