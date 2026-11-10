# FAQ DB 통합 원본 초안

> 용도: 승인된 FAQ 본문을 나중에 SQL 초기 데이터로 변환할 때 사용할 기준 원본.
> 상태: 전체 항목은 초안 또는 검토 필요. 운영 데이터로 승인된 항목 없음.
> 대상: `C:\Users\guswo\Desktop\개인 프로젝트\yangwiki\pages`의 업무 안내 페이지와 사용자 별도 운영정보.
> 출처 제한: `yangwiki/reference/` 디렉터리가 없어 사이트가 인용한 일부 PDF·PPTX 원문은 직접 대조하지 못함. 페이지 본문에 명시된 내용도 최종 등록 전 검토 필요.

## 작성 및 DB 변환 기준

- FAQ 본문은 `title`과 `content`로 구성. 질문형 제목이나 답변체 문장 불필요.
- `title`은 검색할 업무 주제를 간결하게 표시. `content`는 명사형·항목형 표현 우선.
- 같은 기준의 여러 사례는 공통 내용으로 압축. 기기·OS·사업·시기에 따라 적용 결과가 다르면 조건을 보존해 분리.
- `category`, `topic`, `keywords`, `status`, `source`, `review_note`는 검토·분류용 메타데이터. SQL 운영 데이터로 옮길 때 `status`, `source`, `review_note`는 제외.
- 숫자 자동 증가 `id`와 `created_at`은 DB가 생성. 이 원본에서 수동 입력하지 않음.
- `초안`: 원문 HTML에서 내용을 추려 정리했으나 사용자 승인은 미완료.
- `검토 필요`: 적용 범위·최신성·충돌·사용자 별도 제공 여부를 확인하기 전 운영 데이터에서 제외.
- 연락처·비용·일정·한시 사업은 원문에 있어도 최신성 확인 전 확정 안내 금지.

## 후보 현황

| 대분류 | 후보 수 | 초안 | 검토 필요 |
|---|---:|---:|---:|
| 2027년 양품화 사업 | 19 | 9 | 10 |
| 유지보수 | 18 | 4 | 14 |
| 2027년 디벗 재배치·여분기기 수거 사업 | 4 | 2 | 2 |
| 합계 | 41 | 15 | 26 |

승인된 항목은 아직 없음. `검토 필요` 항목은 근거·현행성·적용 범위 확인 후 사용자 승인 전까지 DB 초기 데이터에서 제외.

## 2027년 양품화 사업

### 양품화 사업 전체 흐름
- category: `2027년 양품화 사업`
- topic: 사업 일반
- title: 양품화 사업 전체 흐름
- content: 반납 준비 → 학교 현장 점검·수거 판정 → 기기별 상세점검 → 클리닝·라벨링·보호필름·케이스 교체·OS 설정 → 학교 정보 관리전환 → 배부·설치·검수
- keywords: 양품화, 사업 절차, 전체 흐름, 재보급
- status: 초안
- source: `pages/business/overview.html` · 사업 개요·전체 흐름
- review_note: 사업 연도별 일정·대상 기준은 해당 연도 공문 확인

### 수거 대상과 미수거 품목
- category: `2027년 양품화 사업`
- topic: 수거 대상·품목
- title: 양품화 수거 대상과 미수거 품목
- content: 수거 대상: 디벗 본체 / 미수거: 일반 전용펜·충전기·케이블 / 파손·불량 기기: 원칙적으로 A/S 완료 후 반납 / 케이스 파손·분실: 본체 수거 제한 사유 아님
- keywords: 수거 대상, 본체, 전용펜, 충전기, 케이블, 케이스
- status: 초안
- source: `pages/business/collection.html` · 수거 대상·품목 기준
- review_note: 교사용 기기·삼성 크롬북 부품은 별도 조건 항목 참조

### 수거 전 학교 준비
- category: `2027년 양품화 사업`
- topic: 수거 전 준비
- title: 수거 전 학교 준비 항목
- content: 반납 점검표: 반별 수합·학교 보관(안내 기간 6개월~1년) / 데이터·계정: 개인 자료 백업·삭제, OS별 로그아웃·잠금 해제 / 상태: 외관·화면·버튼·카메라·전용펜 확인 / 수리: 수리 필요 기기 A/S 진행 / 충전: 현장 점검 가능 상태로 충전·집중 보관
- keywords: 수거 전 준비, 반납 점검표, 개인정보 삭제, 계정 로그아웃, 충전
- status: 검토 필요
- source: `pages/school/preparation.html` · 수거 전 준비
- review_note: 점검표 보관 기간의 현행 적용 범위 확인

### OS별 차단 정책과 초기화 구분
- category: `2027년 양품화 사업`
- topic: OS별 준비
- title: OS별 수거 준비와 정책 복구
- content: 공통: 개인 데이터 삭제·계정 로그아웃·화면 잠금 해제 / OS별 관리 정책: 작업에 필요한 차단 항목만 한시 허용 / 작업 완료 후 학교 평상시 정책 복구 / 기기 초기화: 선택 작업 / 웨일북: 대상 단말을 관리 기기에서 제외
- keywords: OS별 준비, 정책 해제, 초기화, 복구, MDM, ASM, CEU, 웨일북
- status: 초안
- source: `pages/school/os-preparation.html`, `pages/school/os-management.html` · OS별 준비, OS별 관리자 작업 상세
- review_note: 세부 메뉴 경로는 실제 OS·관리자 화면 버전과 대조

### 계정·잠금 미해제 기기
- category: `2027년 양품화 사업`
- topic: OS별 예외
- title: 계정·잠금 미해제 기기의 수거 전 처리
- content: Android·iOS: 수거 전 계정·잠금 해제 / 그 외 OS: 수거 후 초기화 절차 적용 가능 여부를 방문 전 담당자 확인 / 웨일북: 별도 관리 기기 제외 절차
- keywords: 계정 미로그아웃, 잠금 미해제, 초기화, Android, iOS
- status: 검토 필요
- source: `pages/business/inspection.html`, `pages/school/os-preparation.html` · 현장 점검·판정, OS별 준비
- review_note: 수거 후 처리 가능 OS와 사전 확인 절차의 최신 적용 범위 재확인

### 수거 일정 확인
- category: `2027년 양품화 사업`
- topic: 일정
- title: 양품화 수거 일정 확인과 확정 상태
- content: 확인 위치: 학교 공문·디벗관리시스템 회수일정 / 확정 기준: 시스템 상태 승인완료 / 공문 일정·시스템 날짜·시간·수량 대조 / 수거 전 사전 연락 안내
- keywords: 수거 일정, 회수일정, 승인완료, 공문
- status: 초안
- source: `pages/school/schedule.html` · 일정 확인·변경
- review_note: 학교별 일정과 상태는 학교 업무 시스템에서 확인

### 수거 일정 변경
- category: `2027년 양품화 사업`
- topic: 일정 변경
- title: 수거 일정 변경 신청과 협의 상태
- content: 신청 위치: 디벗관리시스템 회수일정 / 입력 항목: 희망 일시·변경 사유·담당자 연락처 / 상태 흐름: 변경신청 → 담당자 협의 → 승인완료 / 승인완료 후 변경 신청 불가 시 담당 매니저와 조정
- keywords: 일정 변경, 변경 신청, 협의중, 일정 확정
- status: 검토 필요
- source: `pages/school/schedule.html` · 일정 확인·변경
- review_note: 현재 시스템 상태명·신청 절차·담당 경로 확인

### 현장 점검과 미충전 기기
- category: `2027년 양품화 사업`
- topic: 현장 점검
- title: 수거 당일 현장 점검과 미충전 기기
- content: 점검: 충전 상태·전원·외관·기본 동작·계정·잠금 / 미충전: 현장 점검 불가로 미수거 후 충전·재방문 점검 / 기록: 수거·미수거·재방문·특이사항
- keywords: 현장 점검, 미충전, 기본 동작, 재방문
- status: 초안
- source: `pages/business/inspection.html`, `pages/school/collection-day.html` · 현장 점검·판정, 수거 당일 대응
- review_note: 경미한 파손의 정량 판정 기준은 원문에 없음

### 수거 전 고장과 현장 추가 수리
- category: `2027년 양품화 사업`
- topic: 수리·동의
- title: 수거 전 고장 기기와 현장 추가 수리 구분
- content: 수거 전 확인된 고장: 학교 사전 A/S 후 반납 / 현장 검수 중 추가 발견 고장: 수리동의서 제출 여부 확인 후 처리 / 비용 발생 가능성·연락처 등록 상태 확인
- keywords: 수리동의서, 사전 A/S, 현장 수리, 자기부담
- status: 검토 필요
- source: `pages/school/preparation.html`, `pages/school/collection-day.html` · 수거 전 준비, 수거 당일 대응; `additional_info.md` 사용자 별도 확인
- review_note: 기존 동의서 예외·비용 적용·연락 절차의 현행 기준 확인

### 수거확인서와 학교 서명
- category: `2027년 양품화 사업`
- topic: 수거확인서
- title: 수거확인서 항목과 서명 잠금
- content: 확인 항목: 계획수량·본체 수거수량·미수거수량·특이사항 / 수거담당자 선행 서명 후 학교 확인 서명 / 학교 서명 저장 후 확인서 잠금 / 상세점검 내역: 회수 후 15일 이내 시스템 확인 안내
- keywords: 수거확인서, 서명, 잠금, 수량, 상세점검
- status: 초안
- source: `pages/school/receipt.html` · 수거확인서
- review_note: 잠금 해제·정정 절차는 원문에서 확인되지 않음

### 계획수량·실제 수거량과 미대상
- category: `2027년 양품화 사업`
- topic: 수량·대상 판정
- title: 계획수량·실제 수거량·미대상 구분
- content: 계획수량: 사업 전 조사·취합 수량 / 실제 수거량: 방문 결과 / 이후 수거 대상: 미수거 / 사업 제외 기기: 미대상 / 계획수량에 맞추기 위한 기기 상태 임의 변경 금지
- keywords: 계획수량, 실제 수량, 미수거, 미대상, 수량 차이
- status: 검토 필요
- source: `pages/school/preparation.html`, `pages/school/receipt.html` · 수거 전 준비, 수거확인서; `additional_info.md` 사용자 별도 확인
- review_note: 시스템 필드 의미와 사용자 확인 운영 절차 대조

### 수거 명렬표와 신입생 명렬표
- category: `2027년 양품화 사업`
- topic: 명렬표
- title: 수거 대상 명렬표와 신입생 명렬표 구분
- content: 수거 대상 명렬표: 양품화 수거 희망 기기 확인·수거 전 제출 / 신입생 명렬표: 2월 신입생 수·반 배정 확정 후 관리전환·배부용 등록 / 목적·작성 시기·기기 대상 구분
- keywords: 수거 명렬표, 신입생 명렬표, 엑셀 등록, 관리전환
- status: 초안
- source: `pages/school/preparation.html`, `pages/school/transfer.html` · 수거 전 준비, 명렬표·관리전환
- review_note: 실제 학생 개인정보는 FAQ 본문에 포함하지 않음

### OS별 관리전환 역할
- category: `2027년 양품화 사업`
- topic: 관리전환
- title: OS별 관리전환 범위와 담당
- content: 학교 준비: 학생 명렬표·OS별 계정·관리 정보 제출, 수거 전 정책 설정 / 등록 범위: Android·Windows MDM, iPad MDM·ASM, Chromebook CEU, Whale 관리 기기 / Chromebook·Whale북 관리전환: 사업자 진행 안내
- keywords: 관리전환, MDM, ASM, CEU, Chromebook, Whale북
- status: 검토 필요
- source: `pages/school/transfer.html`, `pages/business/distribution.html` · 명렬표·관리전환, 양품화·관리전환·배부
- review_note: 학교별 제출 정보와 역할의 현행 안내 확인. 계정·비밀번호 값은 저장하지 않음

### 배부·설치 확인
- category: `2027년 양품화 사업`
- topic: 배부·설치
- title: 배부 일정·수량·설치확인서
- content: 일정·수량: 담당 매니저 협의·공문·디벗관리시스템 확인 / 현장: OS별 구성품표·설정·수량 대조 / 충전기·케이블: 학교 보관 / 자체 스티커 보존: 작업 전 담당자 요청 / 설치확인서 불일치: 서명 전 정정 요청
- keywords: 배부 일정, 설치, 설치확인서, 배부 수량
- status: 초안
- source: `pages/business/distribution.html`, `pages/school/installation.html` · 양품화·관리전환·배부, 배부·설치 확인
- review_note: 학교별 확정 일정·수량을 일반 FAQ에 고정하지 않음

### 예비기기의 양품화 포함
- category: `2027년 양품화 사업`
- topic: 예비기기
- title: 사용하지 않는 예비기기의 양품화 포함 기준
- content: 대상 포함 여부: 학교 선택 / 포함 권장 사유: 라벨링 등 후속 작업의 일괄 처리 / 학교 자체 초기화·재보급: 가능 안내, 세팅·앱 설치·라벨링은 학교 작업
- keywords: 예비기기, 미사용 기기, 양품화 포함, 자체 초기화, 재보급
- status: 초안
- source: `pages/school/transfer.html` · 명렬표·관리전환
- review_note: 양품화 포함과 별도 여분기기 회수 사업을 혼동하지 않도록 구분

### 양품화 후 신규 펜슬 제공
- category: `2027년 양품화 사업`
- topic: 펜슬 제공
- title: 반납·재보급 수량에 따른 신규 펜슬 제공
- content: 재보급 수량 ≤ 반납 수량: 신규 제공 없음 / 재보급 수량 > 반납 수량: Windows·Android·Chrome·Whale 15%, iPad 20% 기준 / 부족분: 교육청 협의·확정 기준 대기
- keywords: 펜슬 제공, 반납 수량, 재보급 수량, 15%, 20%, 호환펜
- status: 검토 필요
- source: `pages/business/pencil.html` · 펜슬 취급·제공 안내; `additional_info.md` 사용자 별도 확인
- review_note: 2027년 재보급 수량·지급률 적용·부족분 지원 기준의 최종 확정 여부 확인

### 애플펜슬 1세대 배터리 특별지원
- category: `2027년 양품화 사업`
- topic: 펜슬 특별지원
- title: 2024학년도 애플펜슬 1세대 배터리 특별지원
- content: 대상: 2024학년도 보급 애플펜슬 1세대 중 사용자 과실이 아닌 배터리 노화 / 절차: 사전 보고·실물 반납 후 호환펜 교환 / 지원 수량: 사전 보고량과 실제 반납량 중 적은 수량 / 일반 파손·분실 A/S와 별도
- keywords: 애플펜슬 1세대, 배터리 노화, 특별지원, 호환펜
- status: 검토 필요
- source: `pages/business/pencil.html`, `pages/maintenance/apple-pencil-faq.html` · 펜슬 취급·제공 안내, 애플펜슬 A/S·구매 FAQ
- review_note: 한시 사업. 사전 제출일 2026-11-06 경과, 추가 신청 가능 여부와 2026-12-18 반납 안내의 현행성 확인

### 교사용 기기 대상 여부
- category: `2027년 양품화 사업`
- topic: 수거 대상 예외
- title: 교사용 디벗의 양품화 대상 여부
- content: 교사용 디벗: 양품화 대상 제외 안내 / 대상 여부 문의: 교육청 창의미래교육과 확인 경로
- keywords: 교사용 기기, 교사용 디벗, 수거 대상 제외
- status: 검토 필요
- source: `pages/business/collection.html` · 수거 대상·품목 기준
- review_note: 사이트에서 사용자 별도 운영정보로 구분. 현행 사업 대상 기준 재확인

### 삼성 크롬북 하단 루버
- category: `2027년 양품화 사업`
- topic: 수거 부품 예외
- title: 삼성 크롬북 하단 루버 처리
- content: 하단 루버: 본체와 별도 부품 / 루버 부재: 본체 수거 가능 / 양품화 과정 신규 부착·지급 없음 / 별도 구매 시 프론트·리어 부품 구분
- keywords: 삼성 크롬북, 고무 루버, 프론트, 리어, 부품 구매
- status: 검토 필요
- source: `pages/business/collection.html`, `pages/business/inspection.html` · 수거 대상·품목 기준, 현장 점검·판정
- review_note: 별도 구매 가격·서비스 신청 경로는 변동 가능. 가격은 최신 확인 전 미수록

## 유지보수

### 충전 불량 기기 기본 점검
- category: `유지보수`
- topic: 배터리·충전
- title: 충전 후에도 배터리 잔량이 거의 오르지 않는 기기
- content: 기본 확인: 강제 재부팅 → 충전 가능한 각 포트에서 개별 충전 시험 → 동일 증상 지속 시 서비스 점검 / 배터리 단독 문제와 기타 부품 문제의 비용 처리 구분
- keywords: 충전 불량, 배터리 1%, 포트, 재부팅, 점검
- status: 검토 필요
- source: `pages/maintenance/repair.html` · 수리 처리·운영 참고; `additional_info.md` 사용자 별도 확인
- review_note: 배터리 단독 고장 지원·다른 부품 동시 고장 시 부담 기준 확인

### 단체 A/S·구매 신청
- category: `유지보수`
- topic: 단체 접수
- title: 단체 A/S·구매 신청서 경로
- content: 신청서 위치: 게시판 → 사용자 매뉴얼 → AS 및 구매 단체 접수 신청서 / 작성 항목·제출 경로: 최신 양식·담당 안내 확인 / 개인정보 포함 자료: 안내받은 공식 제출 경로 이용
- keywords: 단체 A/S, 단체 구매, 신청서, 접수 양식
- status: 검토 필요
- source: `pages/maintenance/repair-faq.html`, `pages/maintenance/purchase-faq.html` · 수리 접수·진행 FAQ, 구매·구성품 FAQ; `additional_info.md` 사용자 별도 확인
- review_note: 양식 위치·접수 절차·필요 정보의 현행성 확인

### 양품화와 일반 유지보수 구분
- category: `유지보수`
- topic: 업무 범위
- title: 양품화 수거와 일반 유지보수 A/S 구분
- content: 양품화: 사업 일정에 따른 일괄 회수·점검·재정비·배부 / 일반 유지보수: 고장·파손·구매·분실 문의별 접수 / 비용·대상·접수 경로: 적용 사업별 구분
- keywords: 유지보수, 양품화, A/S, 사업 구분
- status: 초안
- source: `pages/maintenance/index.html`, `pages/business/overview.html` · 유지보수 FAQ, 사업 개요·전체 흐름
- review_note: 사업별 비용 조건 혼합 금지

### A/S 접수 경로
- category: `유지보수`
- topic: 수리 접수
- title: 기기 A/S 접수 경로
- content: 기본 경로: 무인보관함 QR 또는 지정 서비스 지점 / 학교·보급 연도·사업자·선도학교 여부별 접수 경로 확인 / 접수 장소와 실제 수리 담당 주체 구분
- keywords: A/S, 수리 신청, QR, 무인보관함, 서비스 지점
- status: 검토 필요
- source: `pages/maintenance/repair-faq.html`, `pages/contact.html` · 수리 접수·진행 FAQ, 문의 경로
- review_note: 연락처·ARS 번호·운영시간·지점 안내의 현행 적용 대상 확인

### A/S 접수 전 확인 정보
- category: `유지보수`
- topic: 수리 접수
- title: A/S 접수 전 확인할 기기 정보
- content: 보급 연도·차수·OS·제품 라벨·기기 식별정보·고장 증상·기존 접수번호 / 공식 접수 경로에 필요한 최소 정보만 제공
- keywords: 보급 연도, 기기 라벨, 시리얼, 고장 증상, 접수번호
- status: 초안
- source: `pages/maintenance/repair-faq.html`, `pages/contact.html` · 수리 접수·진행 FAQ, 문의 경로
- review_note: 학교·학생 개인정보와 기기 일련번호 실제 값은 공개 FAQ에 기재 금지

### 수리 진행 시간
- category: `유지보수`
- topic: 수리 기간
- title: A/S 수거·수리·배송 예상 기간
- content: 원문 안내: 기사 방문·기기 수거 영업일 1~3일 / 수리·배송 약 1~2주 / 제조사 점검·부품·접수 상황에 따른 변동
- keywords: 수리 기간, 기사 방문, 배송, 영업일
- status: 검토 필요
- source: `pages/maintenance/repair-faq.html` · 수리 접수·진행 FAQ
- review_note: 기간의 현행성 및 적용 서비스 범위 확인

### 수리 비용 확정
- category: `유지보수`
- topic: 비용·견적
- title: 수리비 진단과 비용 안내 시점
- content: 증상만으로 유·무상·최종 수리비 확정 불가 / 제조사·서비스센터 점검 후 수리 범위·비용 판정 / 견적서 발급 시점은 수리·구매 유형별 확인
- keywords: 수리 비용, 견적, 유상, 무상, 진단
- status: 초안
- source: `pages/maintenance/cost-faq.html`, `pages/maintenance/repair-faq.html` · 비용·견적·결제 FAQ, 수리 접수·진행 FAQ
- review_note: 양품화 사업 기준과 일반 유지보수 기준의 적용 범위 분리

### 사업별 자기부담 기준
- category: `유지보수`
- topic: 비용·자기부담
- title: 양품화·일반 유지보수 비용 기준 구분
- content: 자료별 기준: 학생 과실 파손·분실 부담 안내 / 일반 유지보수 실제 수리비·기존 단가표 안내 / 접수 건의 사업·기기·수리 유형별 적용 기준 확인
- keywords: 자기부담금, 파손, 분실, 수리비, 단가표
- status: 검토 필요
- source: `pages/business/inspection.html`, `pages/maintenance/repair.html`, `pages/maintenance/cost-faq.html` · 현장 점검·판정, 수리 처리·운영 참고, 비용·견적·결제 FAQ
- review_note: 20%·상한액·분실 부담률의 적용 관계 미확정. 금액 안내용 초기 데이터 등록 금지

### 여유분 구매와 분실 재구매
- category: `유지보수`
- topic: 구매·부담 기준
- title: 여유분 구매와 분실 재구매 부담 구분
- content: 구성품 여유분 구매: 원문 기준 사용자 부담 100% / 분실·도난 재구매: 원문 기준 사용자 부담 90% / 품목·사업·최신 단가표 확인
- keywords: 여유분 구매, 분실 재구매, 도난, 자기부담
- status: 검토 필요
- source: `pages/maintenance/purchase-faq.html`, `pages/maintenance/cost-faq.html` · 구매·구성품 FAQ, 비용·견적·결제 FAQ
- review_note: 부담률과 적용 품목의 최신성 확인

### 분실 재구매 환불
- category: `유지보수`
- topic: 환불
- title: 분실 재구매 제품 환불 조건
- content: 원문 기재 조건: 배송 완료 30일 이내 요청·제품 사용 흔적 없음·담당 엔지니어 상태 확인 / 환불 경로·처리 일정 최신 확인
- keywords: 환불, 분실 재구매, 사용 흔적, 배송
- status: 검토 필요
- source: `pages/maintenance/purchase-faq.html` · 구매·구성품 FAQ
- review_note: 기간·검수·환불 처리 절차의 현행성 확인

### 애플펜슬 모델·비용 기준
- category: `유지보수`
- topic: 애플펜슬 A/S·구매
- title: 애플펜슬 모델 호환과 비용 확인
- content: 아이패드 보급 연도·모델·사용 연차별 교체 기준 / 2026년 안내 예시 단가: 1세대 149,000원 상당·USB-C 119,000원 상당·대체 호환펜 30,000원 상당 / 실제 비용·재고·교체 기준 최신 확인
- keywords: 애플펜슬, 1세대, USB-C, 호환펜, 단가, 교체 기준
- status: 검토 필요
- source: `pages/maintenance/apple-pencil-faq.html`, `pages/maintenance/purchase-faq.html` · 애플펜슬 A/S·구매 FAQ, 구매·구성품 FAQ
- review_note: 가격·공급 모델·보급연도별 교체 기준의 현행성 확인. 예시 단가는 확정 가격 아님

### 애플펜슬 구성품·키보드 부품
- category: `유지보수`
- topic: 구성품 구매
- title: 펜슬·키보드 구성품 개별 구매 기준
- content: 애플펜슬 수리·교체: 박스 전체가 아닌 펜슬 교체 안내 / 일부 펜슬 캡·펜촉: 호환품 가능 안내 / 키보드 북커버: 키보드·커버 세트 공급 / 일체형 충전 케이블: 별도 구매 불가 안내
- keywords: 펜슬 캡, 펜촉, 젠더, 키보드 북커버, 충전 케이블
- status: 검토 필요
- source: `pages/maintenance/purchase-faq.html`, `pages/maintenance/apple-pencil-faq.html` · 구매·구성품 FAQ, 애플펜슬 A/S·구매 FAQ
- review_note: 모델·보급 시점에 따른 차이와 현재 구매 가능 품목 확인

### 무인보관함 QR 접수와 기기 수령
- category: `유지보수`
- topic: 무인보관함 A/S
- title: 무인보관함 QR 접수·기기 수령 흐름
- content: QR 접수·기기 투입 → 기사 수거·수리 → 수리 기기 보관함 재입고 → 안내 문자 확인 후 수령 / QR에 학교·보관함 정보 자동 입력 안내
- keywords: 무인보관함, QR 접수, 수리 기기 수령, 임시 비밀번호
- status: 초안
- source: `pages/maintenance/equipment.html`, `pages/maintenance/repair.html`, `pages/maintenance/repair-faq.html` · 기기·펜슬·무인보관함, 수리 처리·운영 참고, 수리 접수·진행 FAQ
- review_note: 문자·비밀번호 방식은 접수 유형별 최신 안내 기준. 실제 비밀번호 추정·공유 금지

### 무인보관함 설비 장애
- category: `유지보수`
- topic: 무인보관함 장애
- title: 무인보관함 장애와 기기 A/S 문의 분리
- content: 보관함 문·잠금장치·투입·수령 장애: 설비 유지보수 경로 / 기기 고장·수리 상태: A/S 접수 경로 / 임의 개방·초기화·분해 금지
- keywords: 무인보관함 장애, 문 안 열림, 잠금장치, A/S 이관
- status: 검토 필요
- source: `pages/maintenance/repair.html`, `pages/maintenance/repair-faq.html` · 수리 처리·운영 참고, 수리 접수·진행 FAQ; `additional_info.md` 사용자 별도 확인
- review_note: 학교급별 1차 대응 주체·유지보수팀 접수처 현행 확인

### 분실 시 대여기기
- category: `유지보수`
- topic: 분실·대여
- title: 분실 대여기기 제공·반납 절차
- content: 상담 접수·기기 세팅·학교 전달 / 안내 대여기간: 전달 완료 다음 날부터 30일 / 기간 중 기기 발견: 즉시 반납 / 미발견: 구매 후 반납 / 반납 기기: 5일 이내 본사 발송 안내
- keywords: 분실, 대여기기, 반납, 대여기간, MDM 위치 확인
- status: 검토 필요
- source: `pages/maintenance/loan.html` · 분실 시 대여기기 처리; `additional_info.md` 사용자 별도 운영안내
- review_note: 대여기간·비용·반납 경로의 현재 대상과 적용 여부 재확인

### 취약계층·재해 지원
- category: `유지보수`
- topic: 지원·예외
- title: 취약계층·재해 피해 지원 확인 경로
- content: 지원 가능 여부·부담률·횟수·증빙 기준: 접수 건별 최신 담당 안내 확인 / 화재·재해 지원: 자료 간 안내 충돌로 학교·담당 기관 확인 / 개인정보 증빙: 공개 FAQ에 미기재
- keywords: 취약계층, 재해, 화재, 지원, 증빙
- status: 검토 필요
- source: `pages/maintenance/support-faq.html`, `pages/business/inspection.html` · 지원·특수 상황 FAQ, 현장 점검·판정; `additional_info.md` 사용자 별도 확인
- review_note: 지원율·횟수·자격·재해 지원에 충돌 또는 근거 미확인. 확정 금액·지원 약속 금지

### A/S 경로 확인 정보
- category: `유지보수`
- topic: 문의 경로
- title: 보급 연도·라벨에 따른 A/S 경로 확인
- content: 접수 전 확인: 보급 연도·상하반기·기기 라벨·제품명·증상 / A/S 경로: 보급 시기·사업자·OS별 구분 / 양품화 일정 문의와 유지보수 수리 문의 분리
- keywords: 보급 연도, 라벨, 관리 사업자, A/S 문의
- status: 검토 필요
- source: `pages/business/collection.html`, `pages/maintenance/equipment.html`, `pages/contact.html` · 수거 대상·품목 기준, 기기·펜슬·무인보관함, 문의 경로
- review_note: 사업자·ARS 번호·업무시간·시스템 주소는 변경 가능. 최신 학교 안내 확인

### MDM과 양품화 업무 시스템
- category: `유지보수`
- topic: 시스템 문의
- title: MDM 관리 화면과 양품화 업무 시스템 구분
- content: 학교 기기 정책·기기 관리: OS별 MDM 관리자 화면 / 양품화 일정·수거확인서·명렬표: 학교에 안내된 양품화 업무 시스템 / MDM 접속·기능 문의: 별도 기술지원 경로
- keywords: MDM, 양품화 업무 시스템, 일정, 수거확인서, 명렬표
- status: 검토 필요
- source: `pages/contact.html`, `pages/school/os-management.html` · 문의 경로, OS별 관리자 작업 상세; `additional_info.md` 사용자 별도 확인
- review_note: 시스템 주소·담당 연락처·운영 경로의 최신성 확인

## 2027년 디벗 재배치·여분기기 수거 사업

### 양품화와 별도인 여분기기 회수
- category: `2027년 디벗 재배치·여분기기 수거 사업`
- topic: 사업 구분
- title: 여분기기 회수와 양품화 사업 구분
- content: 여분기기 회수: 양품화와 연계 기간의 별도 업무 / 양품화 대상 기기와 여분기기 구분 보관·수량 관리
- keywords: 여분기기, 재배치, 양품화 구분, 별도 사업
- status: 초안
- source: `pages/relocation/index.html` · 디벗 재배치·여분 기기 회수
- review_note: 해당 연도 회수 사업 시행 여부 확인

### 여분기기 회수 대상과 사전 조사
- category: `2027년 디벗 재배치·여분기기 수거 사업`
- topic: 대상·신청
- title: 여분기기 회수 대상과 사전 조사
- content: 학교별 여분 현황·회수 가능 수량 제출 / 해당 공문 수령 학교의 회수 대상 여부 확인 / 연도별 본체 수량·부속품 확인
- keywords: 여분 현황, 회수 가능 수량, 회수 대상, 사전 조사
- status: 검토 필요
- source: `pages/relocation/index.html` · 디벗 재배치·여분 기기 회수
- review_note: 2026년 9월 조사 등 한시 일정 경과 가능. 추가 신청·늦은 제출 가능 여부 확인

### 여분기기 회수 품목
- category: `2027년 디벗 재배치·여분기기 수거 사업`
- topic: 회수 품목
- title: 여분기기 회수 물품 구성
- content: 회수 물품: 디벗 본체·키보드 케이스·펜슬 등 부속품 일체 / 학교별 수량·실제 대상: 공문 붙임 확인
- keywords: 여분기기, 본체, 키보드 케이스, 펜슬, 부속품
- status: 초안
- source: `pages/relocation/index.html` · 디벗 재배치·여분 기기 회수
- review_note: 학교별 회수 내역과 부속품 범위 확인

### 여분기기 회수 일정
- category: `2027년 디벗 재배치·여분기기 수거 사업`
- topic: 일정
- title: 여분기기 회수 일정과 일정 경과 후 조정
- content: 대상 학교: 양품화 수거 일정과 동일 안내 / 날짜·회수 내역: 학교 공문 붙임 확인 / 안내일 경과: 사업자 개별 연락·일정 협의 안내
- keywords: 여분기기 일정, 양품화 일정, 공문, 일정 변경
- status: 검토 필요
- source: `pages/relocation/index.html` · 디벗 재배치·여분 기기 회수
- review_note: 학교별 일정과 경과 후 절차의 현행성 확인

## SQL 데이터 변환 전 확인

- `초안`도 사용자 승인 전에는 초기 데이터 SQL에 넣지 않는다.
- `검토 필요`는 적용 범위·최신성 확인과 사용자 승인 전 초기 데이터에서 제외한다.
- 승인된 FAQ만 `title`, `content`, `category`, `topic`, `keywords`로 변환한다. 숫자 `id`와 `created_at`은 DB 자동 생성.
- 사용자 승인 상태와 원문 출처는 이 문서에 보존하고 운영 테이블에 넣지 않는다.
- 본문·분류·키워드 수정은 이 통합 원본에 우선 반영한다. 카테고리별 문서의 기존 요약 표는 SQL 이관 원본으로 사용하지 않는다.
