-- Classifies and refines the Whale FAQs already seeded from the reference material in V4.
-- Keeps FAQ IDs, keywords, and usage history; no FAQ rows are added or deleted.

UPDATE faqs
SET topic = 'Whale',
    title = CASE id
        WHEN 327 THEN '[소프트웨어] 웨일북 강제 재부팅 방법'
        WHEN 328 THEN '[소프트웨어] 웨일북 공장 초기화 시작 방법'
        WHEN 329 THEN '[소프트웨어] 웨일북 웹키퍼 차단 문의 경로'
        WHEN 330 THEN '[기타] 웨일스페이스 계정과 WBC 계정의 차이'
        WHEN 331 THEN '[기타] 기기 사용 시간 제한 안내'
        ELSE title
    END,
    content = CASE id
        WHEN 327 THEN '강제 재부팅 방법:\n1. 전원 어댑터와 USB 등 연결된 외부 장치를 분리합니다.\n2. 전원 버튼을 10초 이상 길게 눌러 화면과 표시등이 꺼질 때까지 기다립니다.\n3. 전원이 완전히 꺼진 뒤 5~10초 기다렸다가 전원 버튼을 짧게 눌러 다시 켭니다.'
        WHEN 328 THEN '웨일북의 사용자 로그인 화면에서 우측 하단 시계를 선택해 로그아웃한 뒤 Ctrl + Alt + Shift + R을 누릅니다. 이후 화면에 표시되는 안내에 따라 초기화를 진행합니다.'
        WHEN 329 THEN '웹키퍼 차단 메시지가 표시되면 웹키퍼 고객센터(070-5224-5527)에 문의합니다. 이 안내는 웨일북에 해당하며 iPad와 Chromebook에는 적용되지 않습니다.'
        WHEN 330 THEN '웨일스페이스 계정은 웨일북을 사용하는 이용자의 로그인·서비스 이용 계정입니다. WBC(Whalebook Control) 계정은 학교나 기관에서 기기를 최초 등록하고 설정·관리할 때 사용하는 관리자 계정입니다.\n\nSEN스쿨 전환에 따른 계정 운영은 학교에 전달된 최신 안내를 따릅니다. 명렬표 작성 시 웨일스페이스 계정 정보를 별도로 기재하지 않아도 된다는 전환 안내가 제공된 경우 그 기준을 적용합니다.'
        WHEN 331 THEN '화면에 남은 제한 시간은 MDM의 기기 사용 시간 제한 설정에 따른 표시입니다. 제한 시간이 지나면 기기 사용이 차단될 수 있습니다. 설정과 변경 방법은 학교 정보화 기기 담당자에게 문의합니다. MDM 기술지원센터: 1666-6493.'
        ELSE content
    END
WHERE id BETWEEN 327 AND 331
  AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');
