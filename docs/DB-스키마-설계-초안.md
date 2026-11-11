# FAQ DB 스키마 설계 초안

> 역할: 승인된 DB 논리 구조·테이블·컬럼·제약조건의 기준 문서. SQL/Flyway 파일은 이 설계를 구현하는 산출물이며, API 계약은 `backend/src/main/resources/static/openapi.yaml`에서 관리한다.

> 상태: 논리 스키마와 자료형·제약조건은 사용자 승인 완료. V1 Flyway 마이그레이션 적용 및 다섯 업무 테이블 구조 확인 완료.

## 1. 설계 목표

- MySQL 개발 DB에서 FAQ 콘텐츠, 검색 키워드, 열기 횟수, 회원·권한을 책임별로 관리한다.
- 운영 FAQ의 기본 콘텐츠 항목은 `id`, `category`, `topic`, `title`, `content`, `keywords` 여섯 가지로 유지한다.
- 초안 상태와 사용자 확인 메모는 FAQ 콘텐츠 데이터 및 공개 API에 넣지 않는다.
- FAQ 열기 집계는 사용자 행동 이력을 보관하지 않고 FAQ별 누적 횟수만 저장한다.

## 2. 권장 논리 구조

### 지금까지 정한 사항

- 카테고리는 별도 테이블로 관리한다.
- `faq_categories`는 우선 `id`, `name`만 둔다. `code`, `sort_order`는 넣지 않는다.
- `faq_categories.name`은 중복을 허용하지 않는다.
- 검색 키워드와 열기 집계는 각각 별도 테이블로 둔다.
- 계정 테이블 이름은 `members`가 아니라 `users`로 한다.
- FAQ 본문은 카테고리별 테이블로 나누지 않고 `faqs` 하나에 저장한다.
- `faqs` 컬럼은 `id`, `category_id`, `topic`, `title`, `content`, `created_at`으로 확정한다. `id`와 `created_at`은 DB에서 자동 생성한다.
- `faq_keywords`는 FAQ 한 건 안에서 같은 키워드를 중복 저장하지 않는다. 서로 다른 FAQ에서 같은 키워드를 사용하는 것은 허용한다.
- `faq_usage_stats`는 FAQ가 삭제되면 해당 FAQ의 집계 행도 함께 삭제한다.

### 확정 컬럼 및 자료형

| 테이블 | 컬럼 | 자료형 | 제약·용도 |
|---|---|---|---|
| `faq_categories` | `id` | `BIGINT UNSIGNED` | 기본키, 자동 증가 |
| `faq_categories` | `name` | `VARCHAR(100)` | 필수, 중복 금지. 화면에 보이는 대분류명 |
| `faqs` | `id` | `BIGINT UNSIGNED` | 기본키, 자동 증가. FAQ 등록 시 DB가 생성 |
| `faqs` | `category_id` | `BIGINT UNSIGNED` | 필수, `faq_categories.id` 참조. 카테고리 삭제 제한 |
| `faqs` | `topic` | `VARCHAR(100)` | 필수, 세부 주제 |
| `faqs` | `title` | `VARCHAR(255)` | 필수, 질문형에 한정하지 않는 제목 |
| `faqs` | `content` | `TEXT` | 필수, 안내 내용 |
| `faqs` | `created_at` | `DATETIME` | 필수, 기본값 `CURRENT_TIMESTAMP`로 등록 시각 자동 기록 |
| `faq_keywords` | `faq_id` | `BIGINT UNSIGNED` | `faqs.id` 참조. 키워드와 함께 복합 기본키 구성. FAQ 삭제 시 함께 삭제 |
| `faq_keywords` | `keyword` | `VARCHAR(100)` | 필수. 같은 FAQ 안에서 중복 금지 |
| `faq_usage_stats` | `faq_id` | `BIGINT UNSIGNED` | 기본키이자 `faqs.id` 참조. FAQ당 한 행, FAQ 삭제 시 함께 삭제 |
| `faq_usage_stats` | `open_count` | `BIGINT UNSIGNED` | 필수, 기본값 0 |
| `users` | `id` | `BIGINT UNSIGNED` | 기본키, 자동 증가 |
| `users` | `username` | `VARCHAR(100)` | 필수, 로그인 ID, 유일값 |
| `users` | `password` | `VARCHAR(255)` | 필수, 비밀번호 해시값 저장. 평문 저장 금지 |
| `users` | `role` | `VARCHAR(20)` | 필수, `COUNSELOR` 또는 `ADMIN`만 허용 |

사용자 승인에 따라 `faqs.content`는 `TEXT`, 제목은 `VARCHAR(255)`, 카테고리·주제는 `VARCHAR(100)`, 키워드는 `VARCHAR(100)`, 생성 시각은 `DATETIME DEFAULT CURRENT_TIMESTAMP`로 정한다. 모든 ID는 `BIGINT UNSIGNED AUTO_INCREMENT`를 사용한다. FAQ별 키워드 중복은 `(faq_id, keyword)` 복합 기본키로 막고, FAQ 삭제 시 키워드와 조회 집계를 함께 삭제한다. 카테고리 삭제는 해당 FAQ가 남아 있으면 제한한다. 수정 시각·별도 사용자 표시 이름 등 현재 기능 요구에 없는 컬럼은 추가하지 않는다.

| 논리 테이블 | 주요 데이터 | 관계·용도 |
|---|---|---|
| `faq_categories` | 카테고리 ID, 표시명 | 대분류명을 저장 |
| `faqs` | 자동 생성 FAQ ID, 카테고리 ID, 세부 주제, 제목, 내용, 등록 시각 | FAQ 한 항목당 한 행. 제목은 질문형으로 제한하지 않음 |
| `faq_keywords` | FAQ ID, 키워드 | FAQ 한 건에 여러 검색어를 연결. 키워드 중복을 FAQ 내부에서 방지 |
| `faq_usage_stats` | FAQ ID, 누적 열기 횟수 | FAQ당 집계 행 하나. 사용자별 열람 기록은 저장하지 않음 |
| `users` | 사용자 ID, 로그인 ID, 비밀번호 해시값, 역할 | 화면에 로그인 ID를 표시. 평문 비밀번호는 저장하지 않음 |

### 관계 요약

```text
faq_categories 1 ── N faqs 1 ── N faq_keywords
                         └── 1 faq_usage_stats
users: 로그인·권한 데이터로 FAQ 콘텐츠와 분리
```

## 3. 설계 선택 제안

### 카테고리

세 개 대분류는 `faq_categories`에서 관리하고, 각 FAQ는 `category_id`로 연결한다. API 응답에서는 화면 표시용 카테고리명을 반환하는 방식을 제안한다. 카테고리 표시 순서는 현재 컬럼으로 저장하지 않기로 했다.

### 키워드

키워드는 현재 기획에서 FAQ 한 건에 여러 표현을 연결하므로 `faq_keywords`로 분리하는 방식을 권장한다. 이는 키워드 하나를 한 열에 구분자로 넣거나 JSON 배열로 저장하는 방법보다 개별 검색·중복 방지·추가/삭제가 명확하다. 이 구조는 운영 데이터의 기본 여섯 항목을 바꾸지 않는다. API에서는 `keywords` 배열로 반환할 수 있다.

### ID와 자료형

- FAQ `id`는 MySQL이 자동 증가 숫자로 생성한다. 새 FAQ를 넣을 때 ID를 직접 정하지 않는다.
- 등록 시각은 `created_at`에 DB가 자동 기록한다. 최근 등록순은 `created_at` 내림차순으로 정렬하고, 시각이 같으면 `id` 내림차순을 보조 정렬로 사용한다.
- 외부에 노출하는 API와 상세 URL은 생성된 숫자 ID를 사용한다. 기존 시연 데이터의 날짜·순번 문자열은 운영 ID로 가져오지 않는다.
- 제목은 `VARCHAR(255)`, 내용은 여러 문단·목록을 담는 `TEXT`로 둔다.
- 카테고리·주제는 우선 UTF-8 계열 문자 컬럼으로 설계하고, 문자열은 `utf8mb4` 문자 집합을 사용한다. 검색용 인덱스는 실제 조회 방식에 맞춰 설정한다.
- `created_at`은 FAQ 콘텐츠 6개 필드가 아닌 DB 관리 메타데이터다. FAQ 수정 시각은 현재 필요가 확인되지 않아 추가하지 않는다.

### FAQ 열기 집계

`faq_usage_stats`에는 FAQ별 누적 횟수만 둔다. FAQ가 열릴 때 서버에서 원자적으로 1 증가시키고, FAQ 삭제 시 외래 키를 통해 집계 행도 함께 삭제한다. 개인정보·개별 사용자 이력은 기록하지 않는다.

### 회원·인증

`users`에는 로그인 ID의 유일성, 비밀번호 해시값을 저장하는 `password` 컬럼, 역할(`COUNSELOR` 또는 `ADMIN`)을 둔다. 화면에는 별도 이름 없이 로그인 ID를 표시한다. 비밀번호 원문·초기 비밀번호·접속 비밀값을 SQL 초기 데이터나 Git 추적 파일에 넣지 않는다. 서버 세션 방식은 기존 기획을 따르되 세션 만료·CSRF·비밀번호 정책 세부값은 API 구현 전에 확정한다.

## 4. 인덱스와 검색 방식

- `faqs`: 자동 증가 기본 키 `id`, 카테고리·주제 필터 및 `created_at` 정렬을 지원하는 인덱스
- `faq_keywords`: `(faq_id, keyword)` 복합 기본키와 키워드 단독 검색 인덱스
- `faq_usage_stats`: FAQ ID 기본 키 및 외래 키
- `users`: 로그인 ID 유일 인덱스

초기 FAQ 규모에서는 제목·내용·키워드에 대한 `LIKE` 검색을 사용한다. 키워드 테이블은 키워드 인덱스를 이용한다. 데이터가 늘거나 검색 정확도가 부족해지면 MySQL 전문 검색 또는 별도 검색 도입을 다시 검토한다.

## 5. 구현 전 확인 사항

- 계정 발급·비밀번호 변경 절차는 인증 API 구현 시 세션·보안 설정과 함께 적용한다.
- 초기 적재 FAQ는 사용자 검토·승인된 항목만 사용한다. 통합 원본은 38건 승인, 1건 제외 상태다.
- 초기 검색은 `LIKE` 방식으로 시작하고, 실제 검색 결과와 데이터 규모를 보고 확장 여부를 판단한다.

이 문서는 사용자 승인된 논리 설계 기준이다. Flyway V1은 적용 완료했으며 FAQ 초기 데이터 입력은 별도 작업 단계에서 진행한다.


