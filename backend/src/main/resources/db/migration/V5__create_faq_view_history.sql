-- FAQ별 사용자 열람 이력을 저장해 주간 조회수와 사용자별 최근 열람을 계산한다.
CREATE TABLE faq_view_history (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    faq_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_faq_view_history_viewed_at_faq (viewed_at, faq_id),
    INDEX idx_faq_view_history_user_viewed_at (user_id, viewed_at),

    CONSTRAINT fk_faq_view_history_faq
        FOREIGN KEY (faq_id)
        REFERENCES faqs (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_faq_view_history_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4;
