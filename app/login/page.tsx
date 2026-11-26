// SFR-007 소셜 로그인(카카오·구글)
// 담당: 윤태현
// 버튼은 일반 링크(<a>)다. 로그인은 다른 사이트(카카오·구글)로 이동하므로 <Link>를 쓰지 않는다.
import { getSession } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/providers";

const ERROR_MESSAGES: Record<string, string> = {
  cancelled: "로그인을 취소했습니다. 다시 시도해 주세요.",
  state: "로그인 시간이 지났거나 요청이 올바르지 않습니다. 처음부터 다시 시도해 주세요.",
  config: "로그인 설정이 아직 완료되지 않았습니다. 관리자에게 알려 주세요.",
  failed: "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
};

const buttonClass =
  "flex min-h-14 w-full items-center justify-center rounded-xl px-5 text-lg font-bold";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const query = await searchParams;
  const error = typeof query.error === "string" ? ERROR_MESSAGES[query.error] : undefined;
  const next = safeNextPath(typeof query.next === "string" ? query.next : null);
  const nextQuery = next === "/" ? "" : `?next=${encodeURIComponent(next)}`;

  const session = await getSession();

  if (session) {
    return (
      <section className="mx-auto flex max-w-md flex-col gap-5 py-6">
        <h1 className="text-3xl font-bold">로그인</h1>
        <p className="text-lg">
          <strong>{session.name}</strong> 님으로 로그인되어 있습니다.
        </p>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className={`${buttonClass} border border-gray-300 bg-white hover:bg-gray-50`}
          >
            로그아웃
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-5 py-6">
      <div>
        <h1 className="text-3xl font-bold">로그인</h1>
        <p className="mt-3 text-lg text-gray-600">
          자주 쓰는 계정으로 간편하게 로그인하세요.
          <br />
          처음이면 자동으로 가입됩니다.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-lg text-red-800">
          {error}
        </p>
      )}

      <a
        href={`/api/auth/kakao${nextQuery}`}
        className={`${buttonClass} bg-[#FEE500] text-black/85 hover:brightness-95`}
      >
        카카오로 시작하기
      </a>
      <a
        href={`/api/auth/google${nextQuery}`}
        className={`${buttonClass} border border-gray-300 bg-white text-gray-900 hover:bg-gray-50`}
      >
        구글로 시작하기
      </a>
    </section>
  );
}
