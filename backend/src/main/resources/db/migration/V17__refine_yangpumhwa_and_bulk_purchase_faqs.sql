-- Refines existing FAQs with newly confirmed school quantity, consent, and bulk-purchase guidance.
-- No FAQ rows are added or deleted; existing IDs and usage history remain intact.

UPDATE faqs
SET title = '양품화 계획수량과 현기기수량이 다를 때 처리',
    content = '**계획수량보다 현기기수량이 많은 경우**
- 수량 변경을 신청하기 전에 교육청에 먼저 보고.
- 교육청 보고 후 안내에 따라 수량변경 신청.

**계획수량보다 현기기수량이 적은 경우**
- 실제 변경 수량을 반영한 명렬표 작성.
- 변경 수량이 적힌 명렬표를 K-ONE 공식 업무 메일로 송부.

계획수량·현기기수량·변경 명렬표의 수량을 대조하고, 차이에 맞는 절차로 처리.'
WHERE title = '학교 수량과 양품화 대상 명렬표가 다를 때'
  AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

UPDATE faqs
SET title = '양품화 현장 추가 수리 동의서 제출 방법',
    content = '수거 전에 이미 확인된 파손·고장은 학교에서 먼저 A/S 처리한 뒤 반납. 현장 점검 중 사전에 확인되지 않은 추가 수리가 필요한 경우 수리 진행 전 동의 여부 확인.

**온라인 제출**
- 디벗관리시스템(DBS)에 표시된 QR로 수리동의서 제출.

**수기 제출**
- 온라인 제출이 어려운 학교는 수기 동의서 제출 가능.
- 학교의 동의서 수신 이메일 주소를 확인한 뒤 `2027_디벗_양품화_수기동의서.pdf`와 `수리동의서 안내문.pdf` 송부.
- 작성된 동의서 접수 여부와 수리 진행에 필요한 연락처 확인.

수리비가 발생할 수 있음을 사전에 안내하고, 최종 비용은 기기 점검 및 적용 기준에 따라 확인.'
WHERE title = '수거 전 고장과 현장 추가 수리 구분'
  AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

UPDATE faqs
SET category_id = (SELECT id FROM faq_categories WHERE name = '유지보수'),
    topic = 'A/S 및 구매',
    title = '학교 예산 일괄 구매 견적 요청 방법',
    content = '학교 예산으로 부품이나 기기를 일괄 구매하는 경우 K-ONE에서 견적서를 발송하며, 학교는 견적서를 바탕으로 내부 행정 절차를 진행.

**견적 요청에 필요한 정보**
- 학교명, 사업 차수와 기종
- 구매 품목과 수량
- 구매 구분: 분실·도난 재구매(구매가격의 90%) 또는 여유분 구매(구매가격의 100%)
- 결제 방식: 계좌이체 또는 현장 카드 결제(법인카드, 학교만 가능)
- 담당 교직원 성함과 개인 연락처(휴대전화 권장)
- 견적서 수신 이메일 주소

**요청 예시**
- 학교명: OO중학교
- 사업 차수·기종: 4차 Chromebook
- 구매 품목: 고무 루버 프론트 33개, 리어 41개
- 구매 구분: 여유분 구매(구매가격의 100%)
- 결제 방식: 계좌이체
- 담당자: [교직원 성함] / [휴대전화]
- 견적서 수신 이메일: [이메일 주소]

학생·보호자 등 개인별 비용으로 구매하는 문의는 학교 예산 일괄 구매와 구분해 별도 안내 경로 확인.'
WHERE title = '견적서 문의'
  AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

UPDATE faqs
SET content = '일반 유지보수 수리 시 사용자 부담금은 수리비의 20%, 최대 4만 원. 유·무상 여부와 최종 수리 범위는 서비스센터 진단 후 확정.

**A/S 수리·교체 견적**
- 서비스센터 입고 후 진단과 수리내역이 확인되어야 견적 발급 가능.
- 진단 전에는 정확한 수리 범위와 최종 금액 확정 불가.

**구매 견적**
- 구매 품목·수량과 분실 재구매 또는 여유분 구매 구분을 확인한 뒤 별도 견적.
- 보급 연도별 지원이나 별도 적용 조건이 있으면 해당 기준 확인.'
WHERE title = '유지보수 수리 본인부담금과 견적 확인'
  AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

INSERT IGNORE INTO faq_keywords (faq_id, keyword)
SELECT f.id, k.keyword
FROM faqs f
JOIN faq_categories c ON c.id = f.category_id
JOIN (
    SELECT '양품화 계획수량과 현기기수량이 다를 때 처리' AS title, '계획수량 변경' AS keyword
    UNION ALL SELECT '양품화 계획수량과 현기기수량이 다를 때 처리', '현기기수량'
    UNION ALL SELECT '양품화 계획수량과 현기기수량이 다를 때 처리', '교육청 보고'
    UNION ALL SELECT '양품화 계획수량과 현기기수량이 다를 때 처리', '변경 명렬표'
    UNION ALL SELECT '양품화 현장 추가 수리 동의서 제출 방법', '수리동의서 QR'
    UNION ALL SELECT '양품화 현장 추가 수리 동의서 제출 방법', 'DBS QR'
    UNION ALL SELECT '양품화 현장 추가 수리 동의서 제출 방법', '수기 동의서'
    UNION ALL SELECT '양품화 현장 추가 수리 동의서 제출 방법', '2027_디벗_양품화_수기동의서.pdf'
    UNION ALL SELECT '양품화 현장 추가 수리 동의서 제출 방법', '수리동의서 안내문.pdf'
    UNION ALL SELECT '학교 예산 일괄 구매 견적 요청 방법', '일괄 구매 견적서'
    UNION ALL SELECT '학교 예산 일괄 구매 견적 요청 방법', '학교 예산 구매'
    UNION ALL SELECT '학교 예산 일괄 구매 견적 요청 방법', '고무 루버 구매'
    UNION ALL SELECT '학교 예산 일괄 구매 견적 요청 방법', '프론트 루버'
    UNION ALL SELECT '학교 예산 일괄 구매 견적 요청 방법', '리어 루버'
    UNION ALL SELECT '학교 예산 일괄 구매 견적 요청 방법', '계좌이체'
    UNION ALL SELECT '학교 예산 일괄 구매 견적 요청 방법', '현장 카드 결제'
    UNION ALL SELECT '학교 예산 일괄 구매 견적 요청 방법', '법인카드'
) k ON k.title = f.title
WHERE c.name IN ('2027년 양품화 사업', '유지보수');
