-- Refines existing maintenance repair and purchase FAQs from the reviewed reference material.
-- No FAQ rows are added or deleted; existing IDs, keywords, and usage statistics remain intact.
-- Excludes dated cohort subsidies, unresolved purchase answers, internal messaging steps,
-- default credentials, and unnecessary personal-data collection details.

UPDATE faqs SET content = '일반 유지보수에서 사용자 부담 수리는 파손·침수 등 사용자 과실이 확인된 경우. 증상만으로 유·무상 여부나 최종 비용을 확정하지 않으며, 담당 엔지니어의 기기 진단 후 안내.

일반 유지보수 수리 부담금은 수리비의 20%, 최대 4만 원. 소프트웨어·앱·OS 관련 문제나 초기화는 무상 처리될 수 있으나, 최종 판정은 접수 건의 증상과 진단 결과 기준.

보급 연도별 별도 무상지원·교육청 지원이 적용되는 경우에는 해당 연도와 지원 조건을 따로 확인. 분실·도난 재구매와 여유분 구매는 수리비 부담 기준과 구분.' WHERE id = 25 AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

UPDATE faqs SET content = '구성품을 여유분으로 추가 구매하는 경우 구매금액의 100% 부담. 분실·도난으로 대체품을 재구매하는 경우 구매가격의 90% 부담.

두 경우는 신청 목적과 부담률이 다르므로 접수 시 여유분 구매인지 분실·도난 재구매인지 구분. 보급 연도나 별도 지원 조건이 적용되면 해당 기준을 확인.' WHERE id = 26 AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

UPDATE faqs SET content = '유지보수 수리·구매 접수 경로는 보급 연도, 관리 사업자, 학교의 선도학교 여부와 기기 종류에 따라 다를 수 있음. 학교에 안내된 최신 접수 경로에서 무인보관함 QR 또는 지정 접수처 이용.

지정 접수처는 기기를 인계하는 장소일 수 있으며, 현장에서 직접 수리하는 곳이라고 단정하지 않음. 접수 후 담당자가 기기를 회수해 제조사 점검·수리를 진행하는 절차인지 확인.

무인보관함이 가득 찼거나 QR 접수가 되지 않으면 기기를 접수 기록 없이 보관함에 두지 말고, 학교 담당자와 공식 A/S 접수처를 통해 승인된 대체 접수 방법 확인.' WHERE id = 22 AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

UPDATE faqs SET content = '접수 전 학교·기기 보급 연도 또는 차수·OS·제품 라벨이나 시리얼 번호·고장 증상·기존 접수번호를 준비하면 접수 확인에 도움이 됨.

상담 시에는 접수 확인에 필요한 최소 정보만 공식 접수 경로에 제공. 학생·보호자 연락처나 학적 정보 등 개인정보는 해당 절차에서 실제로 요구되는 경우에만 안전한 공식 경로로 전달하고, FAQ나 상담 메모에 비밀번호·불필요한 개인정보를 기록하지 않음.' WHERE id = 23 AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

UPDATE faqs SET content = 'A/S 접수 후 담당자의 방문·기기 수거까지 영업일 기준 1~3일, 수리와 배송까지 약 1~2주가 안내된 예상 기간. 실제 일정은 기기 진단, 제조사·부품 수급, 접수량에 따라 달라질 수 있어 확정 납기로 안내하지 않음.

유상 여부와 수리비는 기기 진단 후 확정. 예상 기간을 넘기거나 기기 이동 내역이 확인되지 않으면 접수번호와 마지막 확인 상태를 기준으로 공식 접수처에 진행 상황 확인.' WHERE id = 24 AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

UPDATE faqs SET content = '분실 재구매 제품은 배송 완료일로부터 30일 이내 환불 요청 가능. 제품 사용 흔적, 손상 또는 스크래치가 있으면 환불이 제한될 수 있음.

환불 가능 여부는 담당 엔지니어가 제품 상태를 확인한 뒤 결정. 승인 여부와 처리 시점은 접수처 확인 후 안내하며, 특정 시간 내 환불 완료를 미리 확정하지 않음.' WHERE id = 27 AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

UPDATE faqs SET content = '애플펜슬 수리·교체는 박스 구성품 전체가 아니라 펜슬 본체만 교체하는 기준. 모델, 아이패드 기종, 보급 연도와 적용 지원 조건을 확인한 뒤 구매 가능 품목과 비용 안내.

2026년 자료의 참고 단가: 1세대 정품 149,000원 상당, USB-C 정품 119,000원 상당, 호환펜 30,000원 상당. 실제 가격·재고·교체 가능 모델은 변경될 수 있으므로 견적 전 최신 기준 확인.' WHERE id = 28 AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

UPDATE faqs SET content = '구성품은 품목별 판매 단위와 호환 기준 확인.

• 블루투스 키보드 북커버는 키보드와 커버 세트로 공급되며 키보드만 별도 구매할 수 없는 안내.
• 기능에 문제가 없는 펜촉은 호환 제품 사용 가능.
• USB-C 애플펜슬의 큰 젠더(C to Lightning)는 펜슬과 함께 반납 필수. 작은 젠더(Lightning to Lightning)는 판매·필수 반납 대상이 아니며 반납 권장 품목. 작은 젠더는 1세대 펜슬과 호환되지 않음.
• 가격·재고·별도 구매 가능 여부가 정해지지 않았거나 변동된 구성품은 접수 전에 최신 안내 확인.' WHERE id = 29 AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

UPDATE faqs SET content = '무인보관함 QR에 표시된 칸의 접수 기록과 실제 보관 기기 정보를 대조. 정상 접수 기록이 확인되지 않는 기기는 QR 접수가 완료되지 않았을 가능성이 있으므로, 분실 방지를 위해 기기를 안전하게 보관하고 학교의 정보화 기기 담당자와 공식 A/S 접수처에 즉시 확인.

다른 학생의 접수 건에 임의로 연결하거나 접수 완료로 안내하지 않음.'
WHERE title = '무인보관함 QR접수한 칸에 다른 학생 기기가 보관되어 있습니다.'
  AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

UPDATE faqs SET content = '접수번호와 학교·기기 보급 연도 등 확인 가능한 정보로 담당 유지보수 사업자와 마지막 접수 상태 확인. 기기가 접수처나 서비스센터에 있는지, 회수·제조사 입고·수리·배송 중 어느 단계인지 공식 경로를 통해 조회.

확인되지 않은 위치나 처리 결과를 추측해 안내하지 않으며, 확인이 지연되면 접수번호를 기준으로 담당 부서의 회신 요청.'
WHERE title = 'A/S접수한지 너무 오래되었으며, 기기 행방이 불명합니다.'
  AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

UPDATE faqs SET content = '수리 동의 여부를 확인하고, 수리 필요성이 명확한 기기는 학교가 접수 후 수리 진행. 키캡이 빠졌더라도 키보드가 정상 작동하고 사용에 지장이 없으면 즉시 교체를 단정하지 않고 적절한 시점에 점검·수리 접수.

학교 반납·양품화 일정이 있는 경우에는 해당 사업의 반납 전 수리 기준도 함께 확인.'
WHERE title = '키보드 파손(키캡 탈거 등) 상태이나 정상 작동으로 AS 추후 진행 가능 여부'
  AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

UPDATE faqs SET content = '빠진 키캡을 다시 결합해 정상 작동하는지 먼저 확인. 결합되지 않거나 키보드 기능에 문제가 있으면 전체 키보드 교체가 필요할 수 있음.

최종 수리 범위와 부담금은 기기 회수 후 엔지니어 점검으로 확정. 키캡 상태만으로 전체 교체나 비용을 확답하지 않음.'
WHERE title = '키보드 단일 키캡 탈거 자기부담금은 어떻게 되나요?'
  AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

UPDATE faqs SET content = '배터리 교체형 펜슬은 AAAA 건전지 1개를 사용하며 사용자가 직접 교체. 모든 펜슬이 같은 구조는 아니므로 펜슬 모델과 기기 보급 차수를 확인한 뒤 건전지 교체형 제품에만 안내.'
WHERE title = '배터리 사용 펜슬 건전지 방전 직접 교체해야 하나요?'
  AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

UPDATE faqs SET content = 'USB-C 애플펜슬의 큰 젠더(C to Lightning)는 펜슬과 함께 반납 필수. 작은 젠더(Lightning to Lightning)는 필수 반납 대상이 아니며 반납 권장. 작은 젠더는 애플펜슬 1세대와 호환되지 않으므로 펜슬 세대와 젠더 종류를 확인.'
WHERE title = '애플펜슬 젠더(USB-C 펜슬 어댑터)는 반납 대상인가요?'
  AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

UPDATE faqs SET content = '접수번호, 학교명과 요청자 확인 정보로 디벗관리시스템의 A/S 접수 내역 조회. 목록에 없으면 접수 완료 알림 수신 여부와 학교별 접수 경로를 확인한 뒤 공식 A/S 접수처에 조회 요청.

접수 기록과 접수 완료 알림을 확인하기 전에는 중복 접수부터 진행하지 않음.'
WHERE title = '접수내역 조회'
  AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

UPDATE faqs SET content = '학교명·접수번호와 요청자 확인 정보로 A/S 접수 내역을 조회한 뒤 변경할 항목과 수정 내용을 공식 A/S 접수처에 전달. 보관함 칸 번호, 요청자 정보, 증상 등 변경 사항이 실제 접수 기록에 반영됐는지 재확인.

학생·보호자 연락처 등 개인정보 변경은 본인 또는 권한 있는 학교 담당자가 공식 경로로 요청.'
WHERE title = '접수내역 수정'
  AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

UPDATE faqs SET content = '학교명·접수번호와 요청자 확인 정보로 접수 상태와 수리 진행 여부를 먼저 확인. 단순 취소는 공식 관리 경로에서 사유를 남겨 요청하고, 유상 비용이 발생했거나 수리·구매 절차가 진행된 건은 접수처 확인 후 취소 가능 여부와 처리 결과 안내.

취소 요청이 접수됐다는 사실만으로 취소 완료를 안내하지 않음.'
WHERE title = '접수내역 취소'
  AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

-- Add search terms to the existing reference rows only; no duplicate FAQ records are created.
INSERT IGNORE INTO faq_keywords (faq_id, keyword)
SELECT f.id, k.keyword
FROM faqs f
JOIN faq_categories c ON c.id = f.category_id
JOIN (
    SELECT '무인보관함 QR접수한 칸에 다른 학생 기기가 보관되어 있습니다.' AS title, '무인보관함 오접수' AS keyword
    UNION ALL SELECT '무인보관함 QR접수한 칸에 다른 학생 기기가 보관되어 있습니다.', '접수 기록'
    UNION ALL SELECT 'A/S접수한지 너무 오래되었으며, 기기 행방이 불명합니다.', 'A/S 진행 조회'
    UNION ALL SELECT 'A/S접수한지 너무 오래되었으며, 기기 행방이 불명합니다.', '기기 위치 확인'
    UNION ALL SELECT '키보드 파손(키캡 탈거 등) 상태이나 정상 작동으로 AS 추후 진행 가능 여부', '키캡 탈거'
    UNION ALL SELECT '키보드 단일 키캡 탈거 자기부담금은 어떻게 되나요?', '키보드 전체 교체'
    UNION ALL SELECT '배터리 사용 펜슬 건전지 방전 직접 교체해야 하나요?', 'AAAA 건전지'
    UNION ALL SELECT '애플펜슬 젠더(USB-C 펜슬 어댑터)는 반납 대상인가요?', 'C to Lightning 젠더'
    UNION ALL SELECT '애플펜슬 젠더(USB-C 펜슬 어댑터)는 반납 대상인가요?', 'Lightning to Lightning 젠더'
    UNION ALL SELECT '접수내역 조회', '접수번호 조회'
    UNION ALL SELECT '접수내역 수정', 'A/S 접수 수정'
    UNION ALL SELECT '접수내역 취소', 'A/S 접수 취소'
) k ON k.title = f.title
WHERE c.name = '유지보수';
