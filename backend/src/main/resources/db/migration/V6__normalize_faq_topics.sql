-- Normalizes FAQ topics to the user-approved compact taxonomy.
-- Keeps FAQ IDs, titles, contents, keywords, and usage counts unchanged.

UPDATE faqs AS f
JOIN faq_categories AS c ON c.id = f.category_id
SET f.topic = CASE
    WHEN c.name = '2027년 디벗 재배치·여분기기 수거 사업' THEN '사업 일반'

    WHEN c.name = '2027년 양품화 사업' THEN CASE
        WHEN f.title REGEXP '일정|배송일|방문일|수거일' THEN '수거 일정'
        WHEN f.title REGEXP '사전 준비|사전준비|학교 준비|초기화|로그아웃|잠금 해제|계정 해제|OS별 준비' THEN '학교 사전준비(OS별)'
        WHEN f.title REGEXP '스마트단말관리시스템' THEN '스마트단말관리시스템'
        WHEN f.title REGEXP '명렬표|디벗관리시스템|DBS' THEN '디벗관리시스템'
        WHEN f.title REGEXP '관리전환|재배부|배부|설치' THEN '관리전환·재배부'
        WHEN f.title REGEXP '펜슬|펜|지급 품목|지급|예비기기|보호 케이스|보호케이스|충전기' THEN '지급 품목'
        WHEN f.title REGEXP '수거|반납|회수|미수거|수거확인서|점검|수량|대상|파손' THEN '수거 대상'
        WHEN f.topic IN ('수거 전 준비', 'OS별 준비', 'OS별 예외') THEN '학교 사전준비(OS별)'
        WHEN f.topic IN ('관리전환', '배부·설치') THEN '관리전환·재배부'
        WHEN f.topic IN ('예비기기', '펜슬 제공') THEN '지급 품목'
        WHEN f.topic IN ('일정', '일정 변경') THEN '수거 일정'
        WHEN f.topic IN ('수거 대상·품목', '수거 대상 예외', '수거 부품 예외', '수거확인서', '수량·대상 판정', '현장 점검', '수리·동의') THEN '수거 대상'
        WHEN f.topic = '명렬표' THEN '디벗관리시스템'
        WHEN f.topic IN ('사업 일반', '사업 절차') THEN '사업 일반'
        ELSE '기타 문의'
    END

    WHEN c.name = '유지보수' THEN CASE
        WHEN f.topic IN ('디벗관리시스템', 'Google 관리콘솔', 'MDM', '플랫폼·계정', '시스템 문의') THEN '시스템·관리'
        WHEN f.topic REGEXP 'A/S|수리|구매|비용|견적|구성품|환불|무인보관함|충전함|단체 접수' THEN 'A/S 및 구매'
        WHEN f.topic IN ('ChromeOS Flex', 'Chrome', 'ChromeOS') THEN 'Chrome'
        WHEN f.topic IN ('AOS', 'Android') THEN 'Android'
        WHEN f.topic IN ('IOS', 'iOS') THEN 'IOS'
        WHEN f.topic IN ('Windows', 'Windows OS') THEN 'Windows'
        WHEN f.topic IN ('Whale', 'WhaleOS') THEN 'Whale'
        WHEN f.title REGEXP '크롬북|크롬OS|크롬 OS|ChromeOS|Chrome OS|ChromeOS Flex' THEN 'Chrome'
        WHEN f.title REGEXP 'Android|안드로이드|갤럭시 ?탭' THEN 'Android'
        WHEN f.title REGEXP 'iPad|아이패드|IOS|iOS|애플 ?펜슬' THEN 'IOS'
        WHEN f.title REGEXP 'Windows|윈도우|서피스|Surface' THEN 'Windows'
        WHEN f.title REGEXP '웨일북|웨일 ?브라우저|Whale|WBC' THEN 'Whale'
        WHEN f.topic = '계정·서비스' THEN '시스템·관리'
        WHEN f.topic IN ('하드웨어', '구매·구성품', 'A/S 접수·진행') THEN 'A/S 및 구매'
        WHEN f.topic IN ('기기 사용', '기기·반납', '소프트웨어', '기타 운영', '연도별 보급 사업', '지원·특수 상황', '충전함') THEN '일반·운영'
        ELSE '일반·운영'
    END
    ELSE f.topic
END
WHERE c.name IN (
    '2027년 양품화 사업',
    '유지보수',
    '2027년 디벗 재배치·여분기기 수거 사업'
);
