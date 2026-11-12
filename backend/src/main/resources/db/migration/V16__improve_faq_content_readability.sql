-- Improves scanability of multi-part FAQ guidance without changing FAQ rows or history.
-- Use Markdown headings and hyphen lists supported by the frontend FAQ renderer.

UPDATE faqs
SET title = '양품화 일정 문의와 일반 유지보수 A/S 구분',
    content = '**양품화 사업**
- 사업 일정에 따라 기기를 일괄 회수·점검·재정비한 뒤 배부.

**일반 유지보수 A/S**
- 고장·파손 수리, 구매·분실 건을 건별 접수.

**문의 전 확인**
- 비용·대상·접수 경로는 문의 유형과 적용 사업 기준 확인.'
WHERE id = 21
  AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수')
  AND title = '양품화 수거와 일반 유지보수 A/S 구분';

UPDATE faqs
SET content = '접수 전에 다음 정보를 준비하면 접수 확인이 원활합니다.

- 기기 보급 연도 또는 차수, 운영체제
- 제품명과 제품 라벨 또는 시리얼 번호
- 고장 증상, 기존 접수 건이면 접수번호

접수 확인에 필요한 최소 정보만 공식 접수 경로로 전달합니다. 개인정보는 실제 접수에 필요한 경우에만 공식 경로로 제공합니다.'
WHERE id = 23
  AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수')
  AND title = 'A/S 접수 전 확인할 기기 정보';

UPDATE faqs
SET content = '구성품별 판매·교체 기준은 다르므로 품목을 확인한 뒤 최신 안내에 따라 신청합니다.

- 블루투스 키보드 북커버: 키보드와 커버 세트로 공급되며 키보드만 별도 구매 불가.
- 펜촉: 기능에 문제가 없으면 호환 제품 사용 가능.
- USB-C 애플펜슬 큰 젠더(C to Lightning): 펜슬과 함께 반납 필수.
- 작은 젠더(Lightning to Lightning): 판매·필수 반납 대상은 아니며 반납 권장. 1세대 펜슬과 호환되지 않음.
- 가격·재고·개별 구매 가능 여부: 신청 전 최신 안내 확인.'
WHERE id = 29
  AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수')
  AND title = '펜슬·키보드 구성품 개별 구매 기준';

UPDATE faqs
SET title = 'A/S 접수 전 확인 정보와 문의 경로',
    content = '**접수 전 확인할 정보**
- 보급 연도·상반기 또는 하반기·차수
- 기기 라벨·제품명·운영체제
- 증상, 기존 접수 건이면 접수번호

**접수 경로 선택**
- 보급 시기·관리 사업자·운영체제·선도학교 여부에 따라 학교에 안내된 A/S 경로 확인.

**문의 유형 구분**
- 양품화 일정·수거 문의는 양품화 사업 담당 경로 이용.
- 기기 고장·수리 문의는 유지보수 A/S 접수 경로 이용.'
WHERE id = 33
  AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수')
  AND title = '보급 연도·라벨에 따른 A/S 경로 확인';

UPDATE faqs
SET title = 'MDM과 양품화 업무 시스템의 용도 구분',
    content = '**MDM**
- 운영체제별 기기 정책과 관리 설정을 담당하는 화면.
- 접속·기능 문제는 해당 MDM 기술지원 경로로 문의.

**양품화 업무 시스템**
- 사업 일정·수거확인서·명렬표 관련 업무에 사용.
- 학교에 전달된 사업 안내에서 시스템과 담당 경로 확인.'
WHERE id = 34
  AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수')
  AND title = 'MDM 관리 화면과 양품화 업무 시스템 구분';

UPDATE faqs
SET title = '여분기기 회수와 양품화의 업무 구분',
    content = '**여분기기 회수**
- 양품화와 연계된 기간에 별도로 진행되는 업무.

**기기 관리**
- 여분기기와 양품화 대상 기기를 구분해 보관하고 수량 별도 관리.'
WHERE id = 35
  AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 디벗 재배치·여분기기 수거 사업')
  AND title = '여분기기 회수와 양품화 사업 구분';
