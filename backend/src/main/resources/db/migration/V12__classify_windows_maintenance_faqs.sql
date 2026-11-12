-- Classifies and refines the Windows and ChromeOS Flex FAQ rows already seeded in V4.
-- Keeps FAQ IDs, keywords, and usage history; no FAQ rows are added or deleted.

UPDATE faqs
SET topic = CASE
        WHEN id BETWEEN 305 AND 314 THEN 'Windows'
        WHEN id BETWEEN 315 AND 326 THEN 'Chrome'
        ELSE topic
    END,
    title = CASE id
        WHEN 305 THEN '[소프트웨어] Windows 기기 강제 재부팅 방법'
        WHEN 306 THEN '[소프트웨어] Windows 기기 공장 초기화 접수 방법'
        WHEN 307 THEN '[소프트웨어] PC보안케어 차단 안내 팝업 확인'
        WHEN 308 THEN '[소프트웨어] 웹키퍼 차단 메시지 문의 경로'
        WHEN 309 THEN '[하드웨어] Windows 기기 블루스크린 발생 시 조치'
        WHEN 310 THEN '[하드웨어] Surface Go 3 펜 입력이 직선으로 표시되는 증상'
        WHEN 311 THEN '[기타] 기기 사용 시간 제한 안내'
        WHEN 312 THEN '[기타] 교원용 기기의 나이스·에듀파인 사용 조건'
        WHEN 313 THEN '[기타] Surface Go 3 암호 만료 메시지 표시'
        WHEN 314 THEN '[기타] Surface Go 3 속도 저하 안내'
        WHEN 315 THEN '[ChromeOS Flex] Surface Go 3 전환 기기 식별과 수리 기간'
        WHEN 316 THEN '[ChromeOS Flex] 부팅 시 Chrome 화면이 표시되는 이유'
        WHEN 317 THEN '[ChromeOS Flex] 수리 기간이 추가되는 이유'
        WHEN 318 THEN '[ChromeOS Flex] QR 코드 스캔 시 사용할 카메라'
        WHEN 319 THEN '[ChromeOS Flex] Google Play 앱 설치 지원 여부'
        WHEN 320 THEN '[ChromeOS Flex] 추가 전환 신청 가능 여부 확인'
        WHEN 321 THEN '[ChromeOS Flex] 전환 신청 문의 경로'
        WHEN 322 THEN '[ChromeOS Flex] 기기 관리 시스템'
        WHEN 323 THEN '[ChromeOS Flex] 주요 기능과 주변기기 지원'
        WHEN 324 THEN '[ChromeOS Flex] 앱 이용 방법'
        WHEN 325 THEN '[ChromeOS Flex] Whale 브라우저 이용 방법'
        WHEN 326 THEN '[ChromeOS Flex] 로그인 계정과 계정 관리'
        ELSE title
    END,
    content = CASE id
        WHEN 305 THEN '강제 재부팅 방법:\n1. 충전 케이블, USB 장치, 마우스 등 연결된 주변기기를 모두 분리합니다.\n2. 전원 버튼을 10~15초간 길게 눌러 화면과 표시등이 꺼질 때까지 기다립니다.\n3. 전원이 완전히 꺼진 뒤 5~10초 기다렸다가 전원 버튼을 짧게 눌러 다시 켭니다.'
        WHEN 306 THEN 'Windows 기기 공장 초기화는 BIOS에 접근해 초기화해야 하므로 A/S 접수가 필요합니다. 초기화 후에는 MDM을 다시 설치해야 합니다. 접수는 학교에 안내된 무인보관함 서비스 경로를 이용합니다.'
        WHEN 307 THEN 'PC보안케어의 유해 사이트 차단 메시지인지 확인합니다. 프로그램 이름이 PC보안케어로 표시되거나 “차단되었습니다” 문구 뒤가 붉은색으로 표시되면 웹키퍼 차단일 수 있습니다. 웹키퍼 고객센터(070-5224-5527)에 문의합니다.'
        WHEN 308 THEN '웹키퍼 차단 메시지가 표시되면 웹키퍼 고객센터(070-5224-5527)에 문의합니다. 이 안내는 Windows 기기에 해당하며 iPad와 Chromebook에는 적용되지 않습니다.'
        WHEN 309 THEN '기기를 재부팅해 증상이 해소되는지 확인합니다. 블루스크린이 반복되거나 다시 발생하면 A/S 점검을 접수합니다. 반복 증상은 운영체제 또는 기기 문제일 수 있습니다.'
        WHEN 310 THEN 'Surface Go 3에서 펜 입력이 곡선 대신 직선으로 표시되면 다음 항목을 차례로 확인합니다.\n\n1. 충전 케이블을 분리한 상태에서 펜 입력을 확인합니다.\n2. 제어판의 [펜 및 터치] 설정에서 [길게 누르기를 오른쪽 클릭으로 인식]을 해제합니다.\n3. 펜촉을 분리했다가 흔들리지 않도록 다시 장착합니다.\n4. 증상이 계속되면 전원 버튼을 20초 이상 눌러 기기를 재시작합니다. 화면이 꺼졌다가 제조사 로고가 표시되면 버튼에서 손을 뗍니다.\n\n조치 후에도 증상이 지속되면 A/S 점검을 접수합니다.'
        WHEN 311 THEN '화면에 남은 제한 시간은 MDM의 기기 사용 시간 제한 설정에 따른 표시입니다. 제한 시간이 지나면 기기 사용이 차단될 수 있습니다. 설정과 변경 방법은 학교 정보화 기기 담당자에게 문의합니다. MDM 기술지원센터: 1666-6493.'
        WHEN 312 THEN '디벗은 교육용 기기이므로 나이스·에듀파인 등 행정 업무 용도로 제공된 기기가 아닙니다. 교원용 기기에서 해당 업무 사용이 필요한 경우 초기화가 필요할 수 있으므로 A/S 접수 경로를 통해 확인합니다.'
        WHEN 313 THEN 'Surface Go 3 로그인 화면에 “사용자의 암호가 만료되었습니다”가 표시되면 암호 입력란을 한 번 누른 뒤 암호를 입력하지 않고 옆의 화살표(확인 버튼)를 선택합니다. 잠시 기다리면 바탕화면으로 이동할 수 있습니다.'
        WHEN 314 THEN 'Surface Go 3는 하드웨어 사양과 저장 공간이 제한적이어서 부팅과 프로그램 실행이 느릴 수 있습니다. 업데이트는 저장 공간과 성능에 영향을 줄 수 있지만, 보안 업데이트 등 Windows가 요구하는 업데이트는 적용합니다. 학업에 지장이 있을 정도로 느리거나 증상이 계속되면 A/S 점검을 접수합니다. 초기화 후에도 기기 사양에 따라 속도 저하가 다시 나타날 수 있습니다.'
        WHEN 315 THEN 'Windows에서 ChromeOS Flex로 전환된 Surface Go 3는 디벗관리시스템에서 학교명 옆의 “C” 표시로 구분할 수 있습니다. 전환 기기는 보안 설정과 운영체제 구성 과정으로 일반 수리보다 2~3일 더 걸릴 수 있습니다. 접수 전에 전환 기기임을 알려줍니다.'
        WHEN 316 THEN '부팅할 때 Chrome 화면이 표시되면 학교 신청에 따라 Windows에서 ChromeOS Flex로 전환된 기기일 수 있습니다. 전환된 기기는 ChromeOS Flex 환경으로 사용하는 기기입니다.'
        WHEN 317 THEN 'ChromeOS Flex 전환 Surface Go 3는 보안 설정과 운영체제 구성 절차가 추가되어 일반 수리보다 2~3일 더 걸릴 수 있습니다.'
        WHEN 318 THEN 'ChromeOS Flex로 전환된 Surface Go 3는 후면 카메라의 초점 문제로 QR 코드를 인식하지 못할 수 있습니다. QR 코드 스캔에는 전면 카메라를 사용합니다.'
        WHEN 319 THEN 'ChromeOS Flex는 Google Play 스토어와 Android 앱 설치·배포를 지원하지 않습니다.'
        WHEN 320 THEN 'ChromeOS Flex 추가 전환의 접수 여부와 조건은 운영 업체에서 확정해 안내하지 않습니다. 최신 신청 가능 여부는 서울시교육청 담당 부서에 확인합니다.'
        WHEN 321 THEN 'ChromeOS Flex 전환 신청은 서울시교육청 담당 부서에 문의합니다. 담당 부서 연락처를 모르는 경우 교육청 대표 문의 경로나 학교 업무 메신저를 통해 확인합니다.'
        WHEN 322 THEN 'ChromeOS Flex 전환 기기는 Argos MDM이 아닌 Google Workspace 관리콘솔에서 관리합니다.'
        WHEN 323 THEN 'ChromeOS Flex에서는 돋보기, Powerwash 등 ChromeOS 기능을 사용할 수 있으며 Bluetooth와 USB 연결도 지원합니다. 조직 정책이나 연결 기기에 따라 사용 가능 여부가 달라질 수 있습니다.'
        WHEN 324 THEN 'ChromeOS Flex는 Google Play 스토어 앱을 지원하지 않습니다. 필요한 프로그램은 웹사이트나 Chrome 확장 프로그램에서 제공되는지 확인해 이용합니다.'
        WHEN 325 THEN 'ChromeOS Flex에는 Whale 브라우저 앱을 설치할 수 없습니다. 이용하려는 서비스가 웹사이트를 제공하면 Chrome 브라우저에서 해당 사이트에 접속합니다.'
        WHEN 326 THEN 'ChromeOS Flex 전환 기기에는 센스쿨 계정으로 로그인합니다. 계정은 센스쿨 플랫폼에서 생성·관리하며, 등록 후 관리콘솔 계정에 연동됩니다. 계정 생성 방법은 센스쿨 담당 업체 또는 교육연구정보원에 문의합니다.'
        ELSE content
    END
WHERE id BETWEEN 305 AND 326
  AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');
