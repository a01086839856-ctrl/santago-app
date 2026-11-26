import Link from "next/link";
import { getSession } from "@/lib/auth/session";

// 모든 화면 위에 보이는 공통 메뉴
// 로그인 상태면 "OOO님"과 로그아웃 버튼, 아니면 로그인 링크를 보여 준다 (SFR-007)
const menuClass =
  "flex min-h-12 items-center rounded-lg px-3 font-medium hover:bg-gray-100";

export default async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-1 px-4 py-2">
        <Link href="/" className="mr-auto text-2xl font-bold text-green-700">
          산타고
        </Link>
        <Link href="/schedules" className={menuClass}>
          산행 일정
        </Link>
        <Link href="/mypage" className={menuClass}>
          마이페이지
        </Link>
        {session ? (
          <>
            <span className="px-2 font-medium text-gray-700">{session.name}님</span>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className={menuClass}>
                로그아웃
              </button>
            </form>
          </>
        ) : (
          <Link href="/login" className={menuClass}>
            로그인
          </Link>
        )}
      </nav>
    </header>
  );
}
