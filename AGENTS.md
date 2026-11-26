<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 산타고 팀 규칙

- Next.js 16 App Router, TypeScript, Tailwind CSS 4 프로젝트다. Cache Components는 꺼져 있으므로 `"use cache"`를 쓰지 않는다.
- 페이지의 `params`와 `searchParams`는 Promise다. `await`로 꺼내서 쓴다.
- 코드를 쓰기 전에 README.md의 담당표와 협업 규칙을 읽는다. 다른 사람 담당 파일은 고치지 않는다.
- 공용 데이터 타입은 `types/index.ts`, DB 연결 전 임시 데이터는 `lib/mock-data.ts`에 있다. 공용 파일을 바꿀 때는 팀원에게 먼저 알린다.
- 화면 글자는 18px 이상(`text-base` 이상), 버튼과 링크 버튼은 높이 48px 이상(`min-h-12`)으로 만든다. 사용자는 40~60대 등산객이다.
- 비밀 키는 `.env.local`에만 둔다. `NEXT_PUBLIC_`으로 시작하는 값은 브라우저 코드에 들어가므로 비밀 키를 넣지 않는다.
- 사용자 개인정보(이름, 이메일, 전화번호)는 구글 애널리틱스 이벤트에 넣지 않는다.
- DB는 Prisma 7 + AWS RDS for PostgreSQL이다. 설계는 `prisma/schema.prisma`, 연결은 `import { prisma } from "@/lib/db"`로만 한다. Prisma Client는 `@prisma/client`가 아니라 `generated/prisma/client`에 만들어진다. 새 Prisma Client가 필요하면 `lib/prisma-client.ts`의 `createPrismaClient()`를 쓴다(RDS SSL 처리가 들어 있음).
- `prisma/schema.prisma`는 윤태현 담당이다. 바꿔야 하면 코드를 고치기 전에 팀원에게 먼저 말한다. 두 사람이 같은 DB를 쓰므로 `db:push`, `db:seed`는 함부로 실행하지 않는다.
- 남은 좌석은 `totalSeats - 좌석 줄 수`로 계산한다. 목록 화면은 오늘 이후 일정만 보여 준다.
- 로그인 확인은 `import { getCurrentUser, getSession } from "@/lib/auth/session"`으로 한다. 회원 번호로 DB에 저장·조회하는 곳(예약, 결제, 마이페이지)은 `getCurrentUser()`, 화면 표시만 할 때는 `getSession()`을 쓴다. 로그인이 필요한 화면은 `redirect("/login?next=/현재주소")`로 보낸다. `lib/auth/`와 `app/api/auth/`는 윤태현 담당이다.
