-- Enriches the existing 2027 Yangpumhwa FAQs and adds distinct school workflow guidance.
-- Source: public Yangwiki manual pages for business and school preparation.
-- Existing FAQ IDs, created_at values, keywords, and usage counts are preserved.
-- Maintenance repair and replacement charges remain in the maintenance category.

UPDATE faqs SET topic = '사업 일반', title = '양품화 사업의 대상과 전체 진행 절차', content = '졸업생이 약 3년간 사용한 디벗을 회수해 기기 상태와 소프트웨어를 정비한 뒤 다음 학생에게 다시 배부하는 사업. 중·고등학교 3년 학제와 기기 내용연수 6년을 고려해 사용자 변경 시점에 기기 점검과 재설정 진행.

전체 절차: 학교 반납 준비 → 현장 점검과 수거 판정 → 기기별 상세점검 → 클리닝·라벨링·보호필름·케이스 교체·OS 설정 → 학교 관리정보 전환 → 신입생 대상 배부·설치·검수' WHERE id = 1 AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

UPDATE faqs SET topic = '수거 대상', title = '양품화 수거 대상 본체와 미수거 품목', content = '수거 대상은 반납 점검과 계정 로그아웃, 필요한 차단 해제를 마친 디벗 본체. 일반 전용펜·충전기·케이블은 수거하지 않으며 학교에서 보관.

화면 깨짐·불량화소·전원·부팅 등 수리가 필요한 기기는 원칙적으로 수거 전에 A/S 완료. 화면이나 기본 동작에 이상이 있거나 충전되지 않아 현장 점검이 어려운 기기는 미수거 처리 후 점검 가능한 상태에서 재방문.

케이스 파손·분실만으로 본체 수거를 제한하지 않음. 삼성 크롬북 하단 루버는 별도 부속품 기준 적용.' WHERE id = 2 AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

UPDATE faqs SET topic = '학교 사전준비(OS별)', title = '수거 전 학교 준비 항목', content = '반납 점검표를 반별로 수합하고 기기별 외관·화면·버튼·카메라·전용펜 상태 확인. 점검표는 기기에 붙이지 않고 학교에서 보관하며, 안내된 보관 기간은 6개월~1년.

학생에게 필요한 자료를 먼저 백업하도록 안내한 뒤 기기의 개인 데이터 삭제, OS 계정 로그아웃, 화면 잠금 해제와 필요한 관리 정책 해제 여부 확인. 수리할 기기는 수거 전에 A/S 진행.

기기는 현장 점검이 가능하도록 충전해 한곳에 보관. 아이패드 애플펜슬도 충전 상태 확인.' WHERE id = 3 AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

UPDATE faqs SET topic = '학교 사전준비(OS별)', title = '양품화 중 임시 허용할 정책과 작업 후 복구', content = '학교 관리자가 양품화 작업에 필요한 관리 정책을 한시적으로 허용하고, 작업 완료 후 학교의 평상시 차단 정책으로 복구.

초기화 차단 해제와 기기 초기화는 별도 작업. 정책을 허용했다고 해서 기기를 반드시 초기화하는 것은 아님. 크롬북의 파워워시·게스트 모드도 작업 중에만 허용하고 완료 후 평상시 설정으로 복구.

웨일북은 초기화 정책과 별개로 양품화 대상 단말을 Whalespace 관리 기기에서 제외하는 절차 적용.' WHERE id = 4 AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

UPDATE faqs SET topic = '학교 사전준비(OS별)', title = '계정·화면 잠금을 해제하지 못한 기기의 처리', content = 'Android와 iOS 기기는 수거 전에 계정 로그아웃과 화면 잠금 해제 완료.

그 외 OS는 수거 후 서비스센터 초기화 절차를 적용할 수 있는지 방문 전에 담당자에게 확인. OS별 처리 가능 여부가 다르므로 미해제 상태만으로 수거 가능 여부를 단정하지 않음.

웨일북은 계정 로그아웃과 별도로 관리 기기 제외 절차 확인. 삼성 계정 인증 문제로 로그아웃할 수 없는 Android 기기는 인증 절차를 우회하지 말고, Google 계정 로그아웃·개인 데이터 삭제 등 사이트에 안내된 대체 준비 사항 적용.' WHERE id = 5 AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

UPDATE faqs SET topic = '수거 일정', title = '2026~2027 양품화 일정과 학교별 확정 확인', content = '사이트에 안내된 사업 계획은 2026년 10~12월 수거, 2027년 2~3월 학교 배부. 수거 기간은 2026년 10월 15일~12월 24일이며 학교별 방학일 이전에 진행.

전체 수거 기간은 학교별 방문일이 아님. 학교별 날짜·시간·수량은 학교에 발송된 공문과 디벗관리시스템 [2027년 디벗 양품화] → [회수일정]을 대조하고, 시스템 상태가 [승인완료]인지 확인. 수거 예정일 3일 전까지 담당자의 사전 연락 예정.' WHERE id = 6 AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

UPDATE faqs SET topic = '수거 일정', title = '수거 일정 변경 신청과 승인 확인', content = '디벗관리시스템 [2027년 디벗 양품화] → [회수일정] → [일정 변경 신청]에서 희망 날짜·시간, 변경 사유, 담당자 직통 연락처를 입력해 신청.

변경신청은 확정된 방문일이 아님. 담당 매니저와 협의한 뒤 시스템 상태가 [승인완료]로 바뀌었는지 확인. 이미 승인완료된 일정은 시스템에서 변경 신청이 되지 않을 수 있으므로 담당 양품화 매니저에게 직접 연락해 조정.' WHERE id = 7 AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

UPDATE faqs SET topic = '수거 대상', title = '수거 당일 점검 항목과 미충전 기기 처리', content = '수거담당자가 기기의 충전 상태와 전원을 확인하고 외관·디스플레이·케이스·키보드·기본 동작·계정·잠금 상태를 점검. 수거·미수거·재방문 여부와 특이사항은 점검 확인서에 기록.

미충전 기기는 현장에서 점검할 수 없어 수거하지 않음. 충전 후 기본 점검을 마친 뒤 재방문 수거. 전용펜은 기기 수거일에 상태를 확인하며 펜 점검만을 위한 별도 방문은 없음.' WHERE id = 8 AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

UPDATE faqs SET topic = '수거 대상', title = '수거 전 고장과 현장 추가 수리 구분', content = '수거 전에 이미 확인된 파손·고장은 학교에서 먼저 A/S를 진행한 뒤 반납. 수리동의서 제출만으로 사전 확인된 수리를 양품화 검수 때까지 미루지 않음.

현장 검수 중 사전에 확인되지 않은 추가 수리 필요사항을 발견한 경우에는 수리동의서 제출 여부를 확인해 접수 가능 여부 판단. 학부모에게 수리 비용이 발생할 수 있음을 안내하고, 요청자·보호자 연락처가 접수 건에 정확히 등록되어 있는지 확인. 비용 기준은 양품화 수거 기준과 구분해 유지보수 안내 적용.' WHERE id = 9 AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

UPDATE faqs SET topic = '수거 대상', title = '수거확인서 확인·서명과 상세점검 결과', content = '수거확인서에서 계획수량·본체 수거수량·미수거수량·특이사항을 확인. 수거담당자의 선행 서명 후 학교 확인자의 직위·이름·연락처를 입력하고 학교 확인 서명 및 잠금 진행.

학교 서명 후 확인서가 잠기므로 수량과 특이사항을 먼저 대조. [점검표관리]에서 기기별 점검내역, [수거확인서]에서 회수 결과 확인. 수거 후 상세점검 내역은 회수일로부터 15일 이내 시스템에서 확인.' WHERE id = 10 AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

UPDATE faqs SET topic = '수거 대상', title = '계획수량·현기기수량·실제 수거량 구분', content = '계획수량은 사업 전 학교별 조사·취합 수량. 현기기수량은 정기점검 등 기존 자료를 바탕으로 시스템에 표시되는 수량으로, 이번 양품화 대상 명렬표와 다를 수 있음.

이번 사업의 실제 수거 희망 기기와 수량은 양품화 대상 명렬표로 확인하고, 실제 수거량은 방문 결과와 수거확인서 기준. 이후 다시 수거할 기기는 [미수거], 사업에서 제외할 기기는 [미대상]으로 구분.

수량 차이를 맞추기 위해 기기 상태를 임의로 바꾸거나 시스템 수량만으로 최종 대상을 단정하지 않음.' WHERE id = 11 AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

UPDATE faqs SET topic = '디벗관리시스템', title = '수거 대상 명렬표와 신입생 명렬표 구분', content = '양품화 대상 명렬표는 이번 사업에서 수거를 희망하는 기기를 확인하기 위해 수거 전에 제출하는 자료. 신입생 명렬표는 2월 신입생 수와 반 배정이 확정된 뒤 관리전환·배부를 위해 등록하는 별도 자료.

계획수량·현기기수량이 실제 희망 수량과 다르면 먼저 제출한 양품화 대상 명렬표와 시스템 반영 여부 확인. 명렬표를 찾기 어렵다면 과거 제출한 기기 목록표 또는 정기점검 명렬표를 참고해 재작성하고, 명렬표 관리 시스템의 반영 상태 확인.' WHERE id = 12 AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

UPDATE faqs SET topic = '관리전환·재배부', title = 'OS별 관리전환 담당과 학교 준비', content = '학교는 2월 신입생 수와 반 배정, 최종 수량을 확정한 뒤 신입생 명렬표와 필요한 OS별 계정·설정 정보를 준비.

관리전환 범위는 Android·Windows의 MDM, iPad의 MDM·ASM, Chromebook의 CEU, Whale북의 관리 기기 등록. Chromebook·Whale북의 관리전환은 양품화 사업자가 진행하며, 학교는 안내된 관리자 접속 정보와 담당자 정보를 제출.

기기 수거 전 학교가 하는 OS별 정책 설정과 양품화 사업자가 하는 관리전환은 서로 다른 절차.' WHERE id = 13 AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

UPDATE faqs SET topic = '관리전환·재배부', title = '배부·설치 일정과 구성품·확인서 점검', content = '담당 매니저와 학교 일정을 사전 협의하고, 최종 방문 일정·수량은 교육청 공문과 디벗관리시스템에서 확인.

설치 현장에서 OS별 구성품표와 실제 기기·구성품 수량, 설정을 대조. 충전기·케이블은 학교 보관. 학교 자체 스티커를 보존해야 하면 작업 전에 담당자에게 요청.

설치확인서의 설치 수량과 담당자 기록을 실제 결과와 대조한 뒤 서명. 내용이 다르면 서명 전에 정정 요청하고, 담당자 선행 서명과 학교 확인 서명 후 확인서 잠금 및 처리완료 상태 확인.' WHERE id = 14 AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

UPDATE faqs SET topic = '지급 품목', title = '학교 예비기기의 양품화 포함 기준', content = '사용하지 않는 예비기기를 양품화 대상에 포함할지는 학교에서 선택. 라벨링 등 후속 작업을 한 번에 처리할 수 있어 대상에 포함하는 방식을 권장.

학교가 예비기기를 자체 초기화해 재보급하는 것도 가능하지만, 기기 세팅·앱 설치·라벨링 등 후속 작업은 학교에서 진행. 별도 작업 부담을 줄이려면 양품화 대상 명렬표에 포함해 함께 수거하는 방식 검토.' WHERE id = 15 AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

UPDATE faqs SET topic = '지급 품목', title = '2027년 재보급 펜슬 수량과 지급 조건', content = '신규 펜슬은 2027학년도 신입생 재보급 기기 수가 양품화 대상 기기 수보다 많을 때만 지급 기준 적용. 재보급 수량이 양품화 대상 수량 이하이면 신규 지급 없음.

지급 기준안은 iPad용 호환펜 20%, 그 외 Android·Windows·ChromeOS·WhaleOS 디벗용 펜슬 15%. 산정 기준은 2027년 재보급 기기 수량. 예: 해당 조건 충족 시 재보급 120대 기준 iPad 호환펜 24개, 그 외 OS 펜슬 18개.

교육청 정책 확정 전 기준안이며, 최종 지급 여부와 수량은 교육청 정책 발표 후 안내.' WHERE id = 16 AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

UPDATE faqs SET topic = '수거 대상', title = '교사용 디벗의 양품화 대상 여부', content = '교사용 디벗은 이번 양품화 대상에서 제외. 대상 여부에 관한 추가 문의는 서울시교육청 창의미래교육과 확인 경로 안내.' WHERE id = 17 AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

UPDATE faqs SET topic = '수거 대상', title = '삼성 크롬북 하단 루버의 수거·지급 기준', content = '삼성 크롬북 하단 고무 루버는 본체와 별도인 부속품으로, 양품화 수거 대상이 아니며 양품화 과정에서 새로 부착하거나 지급하지 않음. 루버가 없어도 기기 본체 수거 가능.

루버 보충이나 교체는 양품화와 별도로 서비스 신청. 구매할 때는 앞쪽 프론트와 뒤쪽 리어 부품의 형태가 다르므로 필요한 위치를 확인.' WHERE id = 18 AND category_id = (SELECT id FROM faq_categories WHERE name = '2027년 양품화 사업');

-- Preserve the user's confirmed maintenance cost rules in maintenance FAQs, not Yangpumhwa guidance.
UPDATE faqs SET topic = 'A/S 및 구매', title = '유지보수 수리 본인부담금과 견적 확인', content = '유지보수 수리 시 사용자 부담금은 수리비의 20%, 최대 4만 원. 실제 수리 범위와 최종 부담금은 서비스센터 점검 후 안내.

이 비용 기준은 일반 유지보수 수리에 적용. 양품화 사업의 수거·재정비 비용 기준으로 안내하지 않음.' WHERE id = 25 AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

UPDATE faqs SET topic = 'A/S 및 구매', title = '유지보수 기기 분실·도난 시 구매 부담', content = '유지보수 대상 기기를 분실하거나 도난당해 재구매하는 경우 구매가격의 90%를 부담.

수리 본인부담금 20%(최대 4만 원)와 분실·도난 기기 재구매 부담 90%는 적용 상황이 다른 기준.' WHERE id = 26 AND category_id = (SELECT id FROM faq_categories WHERE name = '유지보수');

-- OS-specific school preparation steps from the Yangwiki manual.
INSERT INTO faqs (category_id, topic, title, content)
SELECT id, '학교 사전준비(OS별)', 'Android 기기의 양품화 수거 전 준비', '학생·학교 준비: Family Link 로그아웃, 화면 잠금 설정 해제, 기기 데이터 삭제, Google·삼성 계정 로그아웃 권장. 필요한 자료 백업을 먼저 확인.

학교 관리자 작업: AMA·Android 정책에서 양품화 작업 중 공장초기화와 USB 전송을 한시 허용하고, 작업 완료 후 평상시 차단 상태로 복구. 삼성 계정 인증 문제로 로그아웃이 어려운 경우 인증 절차를 우회하지 말고 Google 계정 로그아웃과 데이터 삭제 등 사이트에 제시된 대체 준비 적용.'
FROM faq_categories WHERE name = '2027년 양품화 사업';
SET @faq_id = LAST_INSERT_ID();
INSERT INTO faq_usage_stats (faq_id, open_count) VALUES (@faq_id, 0);
INSERT INTO faq_keywords (faq_id, keyword) VALUES (@faq_id, 'Android'), (@faq_id, '안드로이드'), (@faq_id, 'Family Link'), (@faq_id, 'AMA 정책'), (@faq_id, '계정 로그아웃');

INSERT INTO faqs (category_id, topic, title, content)
SELECT id, '학교 사전준비(OS별)', 'iPad의 양품화 수거 전 준비', '학생 준비: 필요한 자료 백업, 개인 데이터 삭제, 화면 잠금 해제, ASM 계정 로그아웃.

학교 관리자 작업: 계정 로그아웃 제한을 허용하고 공장초기화·USB 제한 모드·USB 파일 연결·외부 PC 페어링 관련 차단을 해제. 실제 정책 화면의 항목을 확인하고 양품화 작업에 필요한 설정만 허용.'
FROM faq_categories WHERE name = '2027년 양품화 사업';
SET @faq_id = LAST_INSERT_ID();
INSERT INTO faq_usage_stats (faq_id, open_count) VALUES (@faq_id, 0);
INSERT INTO faq_keywords (faq_id, keyword) VALUES (@faq_id, 'iPad'), (@faq_id, '아이패드'), (@faq_id, 'ASM'), (@faq_id, '외부 PC 페어링'), (@faq_id, 'USB 정책');

INSERT INTO faqs (category_id, topic, title, content)
SELECT id, '학교 사전준비(OS별)', 'Windows 기기의 양품화 수거 전 준비', '학생·학교 준비: 필요한 자료 백업과 개인 데이터 삭제.

학교 관리자 작업: 적용 정책의 차단 영역에서 USB 제한 모드와 USB 파일 연결을 허용하고 저장. 기기 초기화는 선택 작업이므로 USB 정책 해제와 초기화 실행을 같은 절차로 안내하지 않음.'
FROM faq_categories WHERE name = '2027년 양품화 사업';
SET @faq_id = LAST_INSERT_ID();
INSERT INTO faq_usage_stats (faq_id, open_count) VALUES (@faq_id, 0);
INSERT INTO faq_keywords (faq_id, keyword) VALUES (@faq_id, 'Windows'), (@faq_id, '윈도우'), (@faq_id, 'USB 제한 모드'), (@faq_id, 'USB 파일 연결');

INSERT INTO faqs (category_id, topic, title, content)
SELECT id, '학교 사전준비(OS별)', 'Chromebook의 양품화 수거 전 준비', '학생·학교 준비: 필요한 자료 백업과 개인 데이터 삭제.

학교 관리자 작업: 양품화 중 소프트웨어 업데이트·초기화 작업에 필요한 파워워시와 게스트 모드를 한시 허용. 양품화 작업 완료 후 학교의 평상시 차단 설정으로 복구.'
FROM faq_categories WHERE name = '2027년 양품화 사업';
SET @faq_id = LAST_INSERT_ID();
INSERT INTO faq_usage_stats (faq_id, open_count) VALUES (@faq_id, 0);
INSERT INTO faq_keywords (faq_id, keyword) VALUES (@faq_id, 'Chromebook'), (@faq_id, '크롬북'), (@faq_id, 'ChromeOS'), (@faq_id, '파워워시'), (@faq_id, '게스트 모드');

INSERT INTO faqs (category_id, topic, title, content)
SELECT id, '학교 사전준비(OS별)', 'Whale북의 양품화 수거 전 준비', '학생·학교 준비: 필요한 자료 백업, 개인 데이터 삭제, Whalespace 계정 로그아웃.

학교 관리자 작업: Whalespace Admin의 관리 기기 목록에서 실물 시리얼 등으로 대상 단말을 확인한 뒤 양품화 대상 기기를 관리 기기에서 제외. 구성원 계정 삭제나 기기 초기화와 구분해 처리.'
FROM faq_categories WHERE name = '2027년 양품화 사업';
SET @faq_id = LAST_INSERT_ID();
INSERT INTO faq_usage_stats (faq_id, open_count) VALUES (@faq_id, 0);
INSERT INTO faq_keywords (faq_id, keyword) VALUES (@faq_id, 'Whale북'), (@faq_id, '웨일북'), (@faq_id, 'Whalespace'), (@faq_id, '관리 기기 제외');

INSERT INTO faqs (category_id, topic, title, content)
SELECT id, '스마트단말관리시스템', 'Android 양품화 적용 정책을 확인하는 방법', '적용된 AMA 정책을 모르면 관리자 화면의 [단말현황]에서 단말 정보 CSV를 내려받아 확인.

양품화 대상 기기 뒷면 라벨의 시리얼 번호 앞 4자리와 CSV의 시리얼 번호 앞 4자리가 같은 행을 찾고, 해당 행의 [적용정책] 값을 확인. 이 정책을 [통합설정]에서 찾아 양품화 중 필요한 초기화·USB 관련 차단을 한시 해제하고 작업 후 원래 정책으로 복구.'
FROM faq_categories WHERE name = '2027년 양품화 사업';
SET @faq_id = LAST_INSERT_ID();
INSERT INTO faq_usage_stats (faq_id, open_count) VALUES (@faq_id, 0);
INSERT INTO faq_keywords (faq_id, keyword) VALUES (@faq_id, 'AMA'), (@faq_id, '적용 정책'), (@faq_id, '단말현황'), (@faq_id, 'CSV'), (@faq_id, '시리얼 번호');

INSERT INTO faqs (category_id, topic, title, content)
SELECT id, '수거 대상', '수거확인서에서 미수거와 미대상을 구분하는 방법', '미수거는 이번 방문에서 회수하지 못했지만 이후 차수에 다시 수거할 기기. 확인서에 미수거로 기록하고 재방문 대상 여부 확인.

미대상은 교사용 기기 등 이번 양품화 사업을 진행하지 않는 기기. 확인서에서 미대상으로 처리해 사업 수거 대상에서 제외.

양품화 대상이 아닌 기기를 미수거로 남기면 차수 대상 수량에 계속 포함되어 서명 절차가 진행되지 않을 수 있음. 실제 수거 여부와 학교 요청을 담당자와 대조한 뒤 상태 처리.'
FROM faq_categories WHERE name = '2027년 양품화 사업';
SET @faq_id = LAST_INSERT_ID();
INSERT INTO faq_usage_stats (faq_id, open_count) VALUES (@faq_id, 0);
INSERT INTO faq_keywords (faq_id, keyword) VALUES (@faq_id, '미수거'), (@faq_id, '미대상'), (@faq_id, '수거확인서'), (@faq_id, '수거 대상 제외');

INSERT INTO faqs (category_id, topic, title, content)
SELECT id, '디벗관리시스템', '학교 수량과 양품화 대상 명렬표가 다를 때', '계획수량은 사업 전 조사 결과, 현기기수량은 기존 정기점검 자료가 반영된 시스템 수량일 수 있어 이번 양품화 실제 희망 수량과 다를 수 있음.

학교가 제출한 이번 사업의 양품화 대상 명렬표와 실제 희망 기기·총수량을 먼저 확인. 명렬표 미제출이면 실제 희망 대상을 반영해 제출하고, 제출했는데 시스템 수량이 다르면 자료 접수와 재반영 여부를 담당 사업자에게 확인. 시스템 수량만으로 대상 제외나 최종 수거 가능 대수를 판단하지 않음.'
FROM faq_categories WHERE name = '2027년 양품화 사업';
SET @faq_id = LAST_INSERT_ID();
INSERT INTO faq_usage_stats (faq_id, open_count) VALUES (@faq_id, 0);
INSERT INTO faq_keywords (faq_id, keyword) VALUES (@faq_id, '수량 차이'), (@faq_id, '명렬표'), (@faq_id, '계획수량'), (@faq_id, '현기기수량'), (@faq_id, '시스템 반영');

INSERT INTO faqs (category_id, topic, title, content)
SELECT id, '관리전환·재배부', '신입생 명렬표 작성과 엑셀 등록', '2월 신입생 수와 반 배정이 확정된 뒤 [명렬표 관리]에서 개별 등록 또는 엑셀 일괄 등록 진행.

일괄 등록은 시스템 [양식다운로드]에서 받은 파일의 예시 행을 삭제하고 학년·반·번호·이름을 한 사람씩 입력한 뒤 XLSX 파일 업로드. 업로드 후 등록 목록에서 검색하거나 엑셀 내려받기로 내용 확인. 학교 계정에서는 해당 학교 학생만 조회·등록.

계정·비밀번호 등 민감 정보는 시스템 마스킹을 유지하고, 시스템이 요구하는 범위에서만 취급.'
FROM faq_categories WHERE name = '2027년 양품화 사업';
SET @faq_id = LAST_INSERT_ID();
INSERT INTO faq_usage_stats (faq_id, open_count) VALUES (@faq_id, 0);
INSERT INTO faq_keywords (faq_id, keyword) VALUES (@faq_id, '신입생 명렬표'), (@faq_id, '명렬표 관리'), (@faq_id, '엑셀 등록'), (@faq_id, '양식다운로드'), (@faq_id, '반 배정');

INSERT INTO faqs (category_id, topic, title, content)
SELECT id, '수거 대상', '수거 기간에도 A/S가 진행 중인 기기의 인계', '수거 기간 안에 A/S가 완료되지 않은 기기는 수리 완료 후 양품화 사업장으로 바로 배송하는 방식 안내.

학교에서 수리 완료 기기를 다시 받은 뒤 재발송하는 절차로 안내하지 않음. 기기 확인을 위해 A/S 접수번호 또는 기기 시리얼 번호를 담당자에게 전달하고, 수리 완료 예정일과 인계 상황 확인.'
FROM faq_categories WHERE name = '2027년 양품화 사업';
SET @faq_id = LAST_INSERT_ID();
INSERT INTO faq_usage_stats (faq_id, open_count) VALUES (@faq_id, 0);
INSERT INTO faq_keywords (faq_id, keyword) VALUES (@faq_id, 'A/S 진행 중'), (@faq_id, '수리 완료'), (@faq_id, '사업장 배송'), (@faq_id, '접수번호'), (@faq_id, '시리얼 번호');

INSERT INTO faqs (category_id, topic, title, content)
SELECT id, '수거 일정', '여러 차수로 나누어 수거할 때 확인할 사항', '수거를 여러 번 진행하면 차수마다 별도의 수거확인서 작성. 각 차수의 실제 수거 수량과 특이사항을 확인서별로 대조하고, 미수거 기기가 다음 차수 재방문 대상인지 확인.

학교 확인 서명은 해당 차수의 수량과 특이사항을 확인한 뒤 진행.'
FROM faq_categories WHERE name = '2027년 양품화 사업';
SET @faq_id = LAST_INSERT_ID();
INSERT INTO faq_usage_stats (faq_id, open_count) VALUES (@faq_id, 0);
INSERT INTO faq_keywords (faq_id, keyword) VALUES (@faq_id, '분할 수거'), (@faq_id, '수거 차수'), (@faq_id, '수거확인서'), (@faq_id, '재방문');

INSERT INTO faqs (category_id, topic, title, content)
SELECT id, '디벗관리시스템', '양품화 업무 시스템 접속 주소 확인', '인터넷 검색 결과에 표시되는 일반 디벗 사이트와 학교별 양품화 업무 시스템은 별도. 일정 확인·명렬표 등록·수거확인서 작성은 학교에 안내된 양품화 시스템 주소로 접속.

접속 후 학교에 발급된 계정으로 로그인하고, [2027년 디벗 양품화] 메뉴에서 해당 업무 선택.'
FROM faq_categories WHERE name = '2027년 양품화 사업';
SET @faq_id = LAST_INSERT_ID();
INSERT INTO faq_usage_stats (faq_id, open_count) VALUES (@faq_id, 0);
INSERT INTO faq_keywords (faq_id, keyword) VALUES (@faq_id, '시스템 주소'), (@faq_id, '양품화 업무 시스템'), (@faq_id, '디벗관리시스템'), (@faq_id, '회수일정'), (@faq_id, '로그인');
