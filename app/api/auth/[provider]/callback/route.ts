// 로그인 콜백: /api/auth/kakao/callback, /api/auth/google/callback (SFR-007, 윤태현)
// 카카오·구글이 인가 코드를 붙여 돌려보내는 주소. 이 주소를 각 개발자 콘솔에 리다이렉트 URI로 등록한다.
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  OAUTH_STATE_COOKIE,
  decodeOAuthState,
  fetchProfile,
  getAppUrl,
  getCallbackUrl,
  getProvider,
} from "@/lib/auth/providers";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/auth/[provider]/callback">
) {
  const { provider: providerId } = await ctx.params;
  const provider = getProvider(providerId);
  const appUrl = getAppUrl(request.nextUrl.origin);

  // 실패하면 로그인 화면으로 돌려보내며 이유를 알려 준다
  const fail = (reason: string) => {
    const response = NextResponse.redirect(new URL(`/login?error=${reason}`, appUrl));
    response.cookies.delete({ name: OAUTH_STATE_COOKIE, path: "/api/auth" });
    return response;
  };

  if (!provider) return fail("failed");

  const params = request.nextUrl.searchParams;
  // 사용자가 동의 화면에서 취소한 경우
  if (params.get("error")) return fail("cancelled");

  const code = params.get("code");
  const saved = decodeOAuthState(request.cookies.get(OAUTH_STATE_COOKIE)?.value);
  if (
    !code ||
    !saved ||
    saved.provider !== provider.id ||
    saved.state !== params.get("state")
  ) {
    return fail("state");
  }

  try {
    const profile = await fetchProfile(
      provider,
      code,
      getCallbackUrl(appUrl, provider.id)
    );

    // 처음 로그인하면 회원을 만들고, 다시 로그인하면 이름만 최신으로 바꾼다
    // (회원 구분은 "로그인 방법 + 회원 고유번호", 카카오와 구글 계정은 합치지 않음)
    const user = await prisma.user.upsert({
      where: {
        provider_providerId: {
          provider: provider.dbProvider,
          providerId: profile.providerId,
        },
      },
      update: { name: profile.name, email: profile.email ?? undefined },
      create: {
        provider: provider.dbProvider,
        providerId: profile.providerId,
        name: profile.name,
        email: profile.email,
      },
    });

    const response = NextResponse.redirect(new URL(saved.next, appUrl));
    response.cookies.set(
      SESSION_COOKIE,
      createSessionToken({ userId: user.id, name: user.name, provider: user.provider }),
      sessionCookieOptions(appUrl)
    );
    response.cookies.delete({ name: OAUTH_STATE_COOKIE, path: "/api/auth" });
    return response;
  } catch (error) {
    console.error("[로그인 실패]", error);
    return fail("failed");
  }
}
