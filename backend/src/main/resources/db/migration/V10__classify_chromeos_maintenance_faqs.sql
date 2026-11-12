-- Classifies the ChromeOS FAQ set already seeded from the reference material in V4.
-- Keeps FAQ IDs, keywords, and usage history; no FAQ rows are added or deleted.

UPDATE faqs
SET topic = 'Chrome',
    title = CASE
        WHEN id BETWEEN 215 AND 236 AND title NOT LIKE '[소프트웨어] %'
            THEN CONCAT('[소프트웨어] ', title)
        WHEN id BETWEEN 237 AND 246 AND title NOT LIKE '[하드웨어] %'
            THEN CONCAT('[하드웨어] ', title)
        WHEN id BETWEEN 247 AND 293 AND title NOT LIKE '[관리콘솔] %'
            THEN CONCAT('[관리콘솔] ', title)
        WHEN id BETWEEN 294 AND 304 AND title NOT LIKE '[기타] %'
            THEN CONCAT('[기타] ', title)
        ELSE title
    END,
    content = CASE id
        WHEN 215 THEN '강제 재부팅은 가능하지만, 먼저 저장 중인 작업이 없는지 확인합니다.\n\n방법: 키보드의 새로고침 키를 누른 상태에서 전원 버튼을 누른 뒤 약 3초 후 두 버튼에서 손을 뗍니다.'
        WHEN 216 THEN 'Powerwash는 Chromebook을 초기 상태로 되돌리는 기능입니다.\n\n진행 절차:\n1. 로그인 화면에서 우측 하단 시계를 선택하고 로그아웃합니다.\n2. Ctrl + Alt + Shift + R을 누릅니다.\n3. [다시 시작]을 선택합니다.\n4. 재부팅 후 [Powerwash] > [계속]을 선택합니다.\n5. 초기화 후 네트워크에 연결하고 조직 계정으로 로그인합니다.\n\n주의: 로컬 다운로드 폴더 등 기기에 저장된 사용자 데이터는 삭제되므로 필요한 파일을 미리 백업합니다. 관리형 기기는 초기화 후 조직에 자동 재등록될 수 있습니다. 조직 정책에 따라 Powerwash가 제한될 수 있습니다.'
        WHEN 221 THEN '먼저 로그인 화면에서 Ctrl + Alt + Shift + R을 눌러 Powerwash를 시도합니다. 해결되지 않으면 다른 PC에서 Chromebook Recovery Utility를 실행해 8GB 이상 USB 또는 SD 카드에 복구 미디어를 만듭니다. 복구할 Chromebook 모델을 선택해 미디어를 생성한 뒤 기기에 연결하고 화면 안내에 따라 복구합니다.\n\n복구 미디어로도 해결되지 않으면 OS 손상 가능성이 있어 A/S 접수를 안내합니다. ChromeOS 업데이트 중 전원을 끄거나 화면을 닫아 절전 상태로 전환하면 복구가 필요할 수 있습니다.'
        WHEN 222 THEN '사용 후에는 화면만 닫아 보관하지 말고 기기를 완전히 종료합니다. ChromeOS 업데이트가 진행 중이면 업데이트 완료를 확인한 뒤 종료합니다.\n\n화면을 닫으면 전원이 꺼지는 대신 절전 상태가 됩니다. 절전 중 업데이트가 진행되거나 배터리가 방전되어 전원이 꺼지면 OS 업데이트 과정에 문제가 생겨 복구 화면이 나타날 수 있습니다.'
        WHEN 235 THEN '학교 내부망에서 특정 사이트가 열리지 않으면 같은 Chromebook을 개인 핫스팟에 연결해 해당 사이트 접속 여부를 확인합니다.\n\n- 핫스팟에서는 접속 가능: 학교 네트워크 또는 Google 관리콘솔의 사이트 허용·차단 정책을 확인합니다. 관리콘솔에서 허용 사이트와 차단 목록을 점검합니다.\n- 핫스팟에서도 접속 불가: 사이트 자체 또는 기기·계정 정책 문제일 수 있습니다. 학교 정보화 담당자와 접속 환경을 확인합니다.'
        WHEN 274 THEN '학교 담당자 변경 등으로 Google 관리콘솔 최고관리자 계정을 확인할 수 없는 경우, 관련 부서에 확인을 요청한 뒤 학교에 안내합니다.'
        ELSE content
    END
WHERE id BETWEEN 215 AND 304
  AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');
