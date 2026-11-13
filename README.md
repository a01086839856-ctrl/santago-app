# 산타고 (SanTago)

등산객을 위한 산행 버스 좌석 예약 서비스. 클라우드기반웹개발(2026-2) 1분반 8조 팔로미 팀 프로젝트(데모 버전).

- 팀: 윤태현(팀장), 강도현
- 최종 데모: 2026년 12월 7일 주
- 진행 점검: 수업 공유 시트 "2026-2 클라우드기반웹개발"의 1분반_8조 탭

## 기술 스택

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- DB: PostgreSQL (AWS RDS, DAR-001에서 연결 예정)
- 배포: AWS EC2 (Nginx), 도메인과 HTTPS 적용 예정 (ECR-001)

## 처음 시작하기

1. Node.js 20.9 이상(LTS 권장)과 Git을 설치한다.
2. 저장소를 받는다.
   ```bash
   git clone https://github.com/a01086839856-ctrl/santago-app.git
   cd santago-app
   npm install
   ```
3. 환경 변수 파일을 만든다. 값은 필요한 것만 채우면 된다.
   ```bash
   cp .env.example .env.local
   ```
4. 개발 서버를 켜고 브라우저에서 http://localhost:3000 을 연다.
   ```bash
   npm run dev
   ```

## 폴더 구조

```
app/                  화면(라우트). 폴더 이름이 곧 주소
  page.tsx            /                  홈
  schedules/          /schedules         산행 일정 목록 (SFR-001)
    [id]/             /schedules/1       산행 일정 상세 (SFR-002)
  mypage/             /mypage            예약 내역·QR·통계 그래프 (SFR-005·006)
  login/              /login             소셜 로그인 (SFR-007)
  api/                /api/...           서버 API (필요할 때 각자 추가)
components/           여러 화면에서 같이 쓰는 화면 조각
lib/                  공용 함수, DB 연결, 임시 데이터(mock-data.ts)
types/                팀 공용 데이터 모양(index.ts)
```

## 담당표

| 번호 | 내용 | 담당 | 완료예정 |
|---|---|---|---|
| SFR-001 | 산행 일정 목록 조회(지역·난이도·날짜 필터) | 강도현 | 11-20 |
| SFR-002 | 산행 일정 상세 조회(코스·탑승지·잔여 좌석) | 강도현 | 11-20 |
| SFR-003 | 좌석 선택 및 예약(중복 예약 방지) | 윤태현 | 11-27 |
| SFR-004 | 결제 및 예약 확정(토스페이먼츠 테스트 모드) | 강도현 | 11-27 |
| SFR-005 | 예약 내역 조회 및 QR 탑승권 | 강도현 | 12-04 |
| SFR-006 | 마이페이지 통계 그래프(막대·도넛·가로 막대·선) | 강도현 | 12-04 |
| SFR-007 | 소셜 로그인(카카오·구글) | 윤태현 | 11-20 |
| SFR-008 | 카카오맵 탑승지·산행지·내 위치 표시 | 강도현 | 11-27 |
| SFR-009 | 버스 운행 경로 지도 표시(탑승지→산행지) | 강도현 | 12-04 |
| SFR-010 | 구글 애널리틱스(GA4) 페이지·예약 단계 이벤트 수집 | 강도현 | 11-27 |
| SFR-011 | AI 산행 안내(준비물·주의사항 생성) | 윤태현 | 12-04 |
| SFR-012 | AI 자연어 일정 검색 | 윤태현 | 12-04 |
| DAR-001 | 데이터베이스 설계 및 초기 데이터 구축 | 윤태현 | 11-20 |
| ECR-001 | AWS 인프라 구성 및 배포(도메인·HTTPS 포함) | 윤태현 | 11-27 |

## 협업 규칙

1. main 브랜치에는 직접 올리지 않는다. 기능마다 브랜치를 만든다.
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/sfr-001-schedule-list
   ```
2. 커밋 메시지는 요구사항 번호로 시작한다. 예: `SFR-001: 지역 필터 추가`
3. 기능이 끝나면 브랜치를 올리고(push) GitHub에서 Pull Request를 만든다. 상대가 실행해 보고 확인하면 main에 합친다(merge).
4. 작업을 시작하기 전에는 항상 `git pull origin main`으로 최신 코드를 받는다.
5. 공용 파일(`types/index.ts`, `app/layout.tsx`, `app/globals.css`, `components/SiteHeader.tsx`, `package.json`)을 바꿀 때는 먼저 상대에게 말한다.
6. `.env.local`과 키 값은 절대 올리지 않는다.

## 화면 기본 규칙

- 사용자는 40~60대 등산객이다. 본문 글자는 18px 이상(`text-base` 이상), 버튼은 높이 48px 이상(`min-h-12`)으로 만든다.
- `text-sm`, `text-xs`는 날짜 옆 보조 정보처럼 꼭 필요할 때만 쓴다.

## AI로 코딩할 때

- 이 프로젝트는 Next.js 16이다. AI가 예전 버전 방식으로 코드를 쓰기 쉬우니, `package.json`의 버전을 알려 주고 그 기준으로 쓰라고 한다.
- 코딩 도구(Claude Code, Cursor 등)를 쓰면 `AGENTS.md`를 먼저 읽게 한다.
- Cache Components는 꺼 두었다. `"use cache"`는 쓰지 않는다.
- 페이지의 `params`, `searchParams`는 Promise라서 `await`로 꺼낸다.
- `NEXT_PUBLIC_`으로 시작하는 환경 변수는 빌드할 때 브라우저 코드에 들어간다. 비밀 키에는 붙이지 않는다.
