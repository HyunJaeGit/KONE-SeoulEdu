# FAQ DB 스키마 설계 초안

> 상태: 테이블 분리 방식, 카테고리 기본 컬럼, 숫자 자동 증가 FAQ ID, 등록 시각 컬럼은 사용자와 정했다. 상세 자료형·나머지 컬럼·제약조건은 검토 전 제안이다. 이 문서는 논리 설계이며 SQL·Flyway 마이그레이션이 아니다.

## 1. 설계 목표

- MySQL 개발 DB에서 FAQ 콘텐츠, 검색 키워드, 열기 횟수, 회원·권한을 책임별로 관리한다.
- 운영 FAQ의 기본 콘텐츠 항목은 `id`, `category`, `topic`, `title`, `content`, `keywords` 여섯 가지로 유지한다.
- 원문 출처와 승인 상태는 콘텐츠 검토용 문서에 두며 공개 FAQ API에 노출하지 않는다.
- FAQ 열기 집계는 사용자 행동 이력을 보관하지 않고 FAQ별 누적 횟수만 저장한다.

## 2. 권장 논리 구조

### 지금까지 정한 사항

- 카테고리는 별도 테이블로 관리한다.
- `faq_categories`는 우선 `id`, `name`만 둔다. `code`, `sort_order`는 넣지 않는다.
- 검색 키워드와 열기 집계는 각각 별도 테이블로 둔다.
- 계정 테이블 이름은 `members`가 아니라 `users`로 한다.
- FAQ 본문은 카테고리별 테이블로 나누지 않고 `faqs` 하나에 저장한다.

### 컬럼 후보

| 테이블 | 컬럼 | 자료형 후보 | 제약·용도 |
|---|---|---|---|
| `faq_categories` | `id` | `BIGINT UNSIGNED` | 기본키, 자동 증가 후보 |
| `faq_categories` | `name` | `VARCHAR(100)` | 필수, 중복 방지 후보. 화면에 보이는 대분류명 |
| `faqs` | `id` | `BIGINT UNSIGNED` | 기본키, 자동 증가. FAQ 등록 시 DB가 생성 |
| `faqs` | `category_id` | `BIGINT UNSIGNED` | 필수, `faq_categories.id` 참조 |
| `faqs` | `topic` | `VARCHAR(100)` | 필수, 세부 주제 |
| `faqs` | `title` | `VARCHAR(255)` | 필수, 질문형에 한정하지 않는 제목 |
| `faqs` | `content` | `TEXT` | 필수, 안내 내용 |
| `faqs` | `created_at` | `DATETIME` | 필수, 기본값 현재 시각 후보. DB가 등록 시각을 자동 기록 |
| `faq_keywords` | `faq_id` | `BIGINT UNSIGNED` | `faqs.id` 참조. 복합 기본키의 일부 |
| `faq_keywords` | `keyword` | `VARCHAR(100)` | FAQ 검색어. 복합 기본키의 일부 |
| `faq_usage_stats` | `faq_id` | `BIGINT UNSIGNED` | 기본키이자 `faqs.id` 참조. FAQ당 한 행 |
| `faq_usage_stats` | `open_count` | `BIGINT UNSIGNED` | 필수, 기본값 0 후보 |
| `users` | `id` | `BIGINT UNSIGNED` | 기본키, 자동 증가 후보 |
| `users` | `username` | `VARCHAR(100)` | 필수, 로그인 ID, 유일값 |
| `users` | `name` | `VARCHAR(100)` | 필수, 표시 이름 |
| `users` | `password_hash` | `VARCHAR(255)` | 필수, 해시된 비밀번호만 저장 |
| `users` | `role` | `VARCHAR(20)` | 필수, `COUNSELOR` 또는 `ADMIN` 후보 |

FAQ ID는 자동 증가 숫자, FAQ 등록 시각은 `created_at`으로 저장하는 방향을 사용자와 정했다. 나머지 자료형의 길이, 키워드 복합 기본키, 외래 키의 삭제 동작은 아직 확정하지 않았다. 수정 시각이나 계정 사용 여부처럼 현재 기능 요구에 없는 컬럼은 일단 추가하지 않았다.

| 논리 테이블 | 주요 데이터 | 관계·용도 |
|---|---|---|
| `faq_categories` | 카테고리 ID, 표시명 | 대분류명을 저장 |
| `faqs` | 자동 생성 FAQ ID, 카테고리 ID, 세부 주제, 제목, 내용, 등록 시각 | FAQ 한 항목당 한 행. 제목은 질문형으로 제한하지 않음 |
| `faq_keywords` | FAQ ID, 키워드 | FAQ 한 건에 여러 검색어를 연결. 키워드 중복을 FAQ 내부에서 방지 |
| `faq_usage_stats` | FAQ ID, 누적 열기 횟수 | FAQ당 집계 행 하나. 사용자별 열람 기록은 저장하지 않음 |
| `users` | 사용자 ID, 로그인 ID, 표시 이름, 비밀번호 해시, 역할 | 상담원·관리자 계정. 평문 비밀번호는 저장하지 않음 |

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
- 제목은 `VARCHAR(255)` 후보, 내용은 긴 Markdown 본문을 담을 수 있는 `TEXT` 계열 후보로 둔다.
- 카테고리·주제는 우선 UTF-8 계열 문자 컬럼으로 설계하고, 실제 인덱스와 collation은 한국어 검색 방식 결정 후 정한다.
- `created_at`은 FAQ 콘텐츠 6개 필드가 아닌 DB 관리 메타데이터다. FAQ 수정 시각은 현재 필요가 확인되지 않아 추가하지 않는다.

### FAQ 열기 집계

`faq_usage_stats`에는 FAQ별 누적 횟수만 둔다. FAQ가 열릴 때 서버에서 원자적으로 1 증가시키고, FAQ 삭제 시 집계 행의 처리 원칙을 정한다. 초기 설계 제안은 FAQ ID 외래 키와 함께 FAQ 삭제 시 집계도 제거하는 방식이다. 개인정보·개별 사용자 이력은 기록하지 않는다.

### 회원·인증

`users`에는 로그인 ID의 유일성, 표시 이름, 해시된 비밀번호, 역할(`COUNSELOR` 또는 `ADMIN` 후보)을 둔다. 비밀번호 원문·초기 비밀번호·접속 비밀값을 SQL 초기 데이터나 Git 추적 파일에 넣지 않는다. 서버 세션 방식은 기존 기획을 따르되 세션 만료·CSRF·비밀번호 정책 세부값은 API 구현 전에 확정한다.

## 4. 인덱스 후보

- `faqs`: 자동 증가 기본 키 `id`, 카테고리·주제 필터 및 `created_at` 정렬을 지원하는 인덱스
- `faq_keywords`: FAQ ID와 키워드 조합 유일성, 키워드 검색 인덱스
- `faq_usage_stats`: FAQ ID 기본 키 및 외래 키
- `users`: 로그인 ID 유일 인덱스

한국어 본문 검색은 DB 인덱스 방식이 아직 결정되지 않았다. 초기 데이터 규모와 검색 인수 사례를 확인한 다음 MySQL 전체 텍스트 검색, 정규화한 LIKE 검색 또는 별도 검색 도입 중 적합한 방식을 선택한다. OpenAPI의 `q`는 검색 계약만 정의하며 실제 검색 알고리즘을 확정하지 않는다.

## 5. Flyway 작성 전에 승인할 내용

- 카테고리명 길이·유일성 등 제약조건
- FAQ 자동 증가 ID의 삭제 후 재사용·표시 방식
- 각 컬럼 자료형·길이·필수 여부
- 키워드 중복 규칙과 복합 기본키 사용 여부
- 외래 키 삭제 동작
- FAQ 삭제·비활성화 정책과 집계 데이터 처리
- 회원 로그인 ID·역할·비밀번호 정책
- 한국어 검색 구현 방식과 인덱스
- 초기 데이터는 승인된 FAQ만 등록한다는 원칙과 초기 데이터 수량

사용자가 위 구조를 검토·확정하기 전에는 마이그레이션 SQL이나 운영 FAQ 초기 데이터를 만들지 않는다.
