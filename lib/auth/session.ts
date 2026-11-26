// 로그인 상태(세션) 관리 (SFR-007, 윤태현)
// - 로그인에 성공하면 "회원 번호·이름·로그인 방법"을 서명해서 쿠키에 넣는다.
// - 서명은 서버만 아는 AUTH_SECRET으로 만든다. 쿠키 내용을 누가 바꾸면 서명이 안 맞아 무시된다.
// - 추가 패키지 없이 Node.js 기본 기능(crypto)만 쓴다.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE = "santago_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7일 (초 단위)

export type LoginProvider = "KAKAO" | "GOOGLE" | "DEMO";

// 쿠키에 들어가는 로그인 정보
export type Session = {
  userId: number;
  name: string;
  provider: LoginProvider;
};

type TokenPayload = Session & { exp: number };

export function hasAuthSecret(): boolean {
  return (process.env.AUTH_SECRET ?? "").length >= 32;
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET이 없거나 너무 짧습니다. .env.local에 32자 이상 값을 넣어 주세요."
    );
  }
  return secret;
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

// 로그인 정보 → 서명된 문자열 ("내용.서명")
export function createSessionToken(session: Session): string {
  const payload: TokenPayload = {
    ...session,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

// 서명된 문자열 → 로그인 정보. 서명이 틀리거나 기간이 지나면 null
export function readSessionToken(token: string | undefined): Session | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  try {
    const expected = Buffer.from(sign(body));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as TokenPayload;
    if (typeof payload.userId !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return {
      userId: payload.userId,
      name: payload.name,
      provider: payload.provider,
    };
  } catch {
    return null;
  }
}

// 세션 쿠키 옵션. 주소가 https면 secure를 켠다(배포 서버)
export function sessionCookieOptions(appUrl: string) {
  return {
    httpOnly: true, // 브라우저 자바스크립트가 못 읽게
    sameSite: "lax" as const, // 다른 사이트에서 보내는 요청에는 쿠키를 싣지 않음
    secure: appUrl.startsWith("https://"),
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

/*
  화면(서버 컴포넌트)에서 로그인 상태 확인하기

  1) getSession(): 쿠키만 확인. 빠르다. 헤더의 "OOO님" 표시처럼 가벼운 곳에 쓴다.
  2) getCurrentUser(): 쿠키 확인 + DB에 회원이 실제로 있는지 확인.
     예약·결제·마이페이지처럼 회원 번호로 DB에 저장하거나 조회하는 곳에서는 이걸 쓴다.

  사용 예)
    import { getCurrentUser } from "@/lib/auth/session";
    const user = await getCurrentUser();
    if (!user) redirect("/login?next=/mypage");
*/
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  return readSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, provider: true, email: true },
  });
}
