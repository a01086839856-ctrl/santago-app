import Link from "next/link";

// 모든 화면 위에 보이는 공통 메뉴
const menuClass =
  "flex min-h-12 items-center rounded-lg px-3 font-medium hover:bg-gray-100";

export default function SiteHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex w-full max-w-3xl items-center gap-1 px-4 py-2">
        <Link href="/" className="mr-auto text-2xl font-bold text-green-700">
          산타고
        </Link>
        <Link href="/schedules" className={menuClass}>
          산행 일정
        </Link>
        <Link href="/mypage" className={menuClass}>
          마이페이지
        </Link>
        <Link href="/login" className={menuClass}>
          로그인
        </Link>
      </nav>
    </header>
  );
}
