-- 대분류 이름을 저장하는 테이블
CREATE TABLE faq_categories (
    -- 카테고리 식별자: DB가 자동으로 생성하는 기본키
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    -- 화면에 표시할 대분류 이름: 필수이며 중복 불가
    name VARCHAR(100) NOT NULL,

    -- 카테고리를 구분하는 기본키
    PRIMARY KEY (id),

    -- 같은 대분류 이름의 중복 저장 방지
    UNIQUE KEY uk_faq_categories_name (name)
)
-- 트랜잭션과 외래 키를 지원하는 저장 엔진
ENGINE=InnoDB
-- 한글 등 다국어 문자 저장
DEFAULT CHARSET=utf8mb4;


-- FAQ 제목과 내용을 저장하는 테이블
CREATE TABLE faqs (
    -- FAQ 식별자: DB가 자동으로 생성하는 기본키
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    -- 대분류 ID: faq_categories 테이블의 카테고리 참조
    category_id BIGINT UNSIGNED NOT NULL,

    -- 대분류 안의 세부 주제
    topic VARCHAR(100) NOT NULL,

    -- FAQ 제목
    title VARCHAR(255) NOT NULL,

    -- 여러 문단과 목록을 담는 FAQ 본문
    content TEXT NOT NULL,

    -- DB가 자동으로 기록하는 등록 일시
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- FAQ 식별 기본키
    PRIMARY KEY (id),

    -- 대분류별 FAQ 탐색과 주제 필터를 위한 인덱스
    INDEX idx_faqs_category_topic (category_id, topic),

    -- 최신 등록순 조회를 위한 인덱스
    INDEX idx_faqs_created_at (created_at),

    -- 존재하는 대분류만 FAQ에 연결하고, 사용 중인 대분류 삭제 제한
    CONSTRAINT fk_faqs_category
        FOREIGN KEY (category_id)
        REFERENCES faq_categories (id)
        ON DELETE RESTRICT
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4;


-- FAQ별 검색 키워드를 저장하는 테이블
CREATE TABLE faq_keywords (
    -- 연결할 FAQ ID
    faq_id BIGINT UNSIGNED NOT NULL,

    -- 검색에 사용할 키워드
    keyword VARCHAR(100) NOT NULL,

    -- 같은 FAQ 안에서 같은 키워드의 중복 저장 방지
    PRIMARY KEY (faq_id, keyword),

    -- 키워드로 FAQ를 찾기 위한 인덱스
    INDEX idx_faq_keywords_keyword (keyword),

    -- FAQ 삭제 시 해당 FAQ의 키워드도 함께 삭제
    CONSTRAINT fk_faq_keywords_faq
        FOREIGN KEY (faq_id)
        REFERENCES faqs (id)
        ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4;


-- FAQ별 누적 열기 횟수를 저장하는 테이블
CREATE TABLE faq_usage_stats (
    -- FAQ ID: FAQ 한 건당 집계 행 한 개
    faq_id BIGINT UNSIGNED NOT NULL,

    -- FAQ가 열린 누적 횟수
    open_count BIGINT UNSIGNED NOT NULL DEFAULT 0,

    -- FAQ ID를 기본키로 사용해 집계 행을 한 건으로 제한
    PRIMARY KEY (faq_id),

    -- FAQ 삭제 시 해당 조회 집계도 함께 삭제
    CONSTRAINT fk_faq_usage_stats_faq
        FOREIGN KEY (faq_id)
        REFERENCES faqs (id)
        ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4;


-- 상담원과 관리자 계정을 저장하는 테이블
CREATE TABLE users (
    -- 사용자 식별자: DB가 자동으로 생성하는 기본키
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    -- 로그인 ID: 필수이며 중복 불가
    username VARCHAR(100) NOT NULL,

    -- 비밀번호 해시값 저장용 컬럼: 평문 비밀번호 저장 금지
    password VARCHAR(255) NOT NULL,

    -- 계정 역할: 상담원 또는 관리자
    role VARCHAR(20) NOT NULL,

    -- 사용자 식별 기본키
    PRIMARY KEY (id),

    -- 로그인 ID 중복 저장 방지
    UNIQUE KEY uk_users_username (username),

    -- 허용된 역할만 저장
    CONSTRAINT chk_users_role
        CHECK (role IN ('COUNSELOR', 'ADMIN'))
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4;