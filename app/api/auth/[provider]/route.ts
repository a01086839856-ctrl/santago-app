// 로그인 시작: /api/auth/kakao, /api/auth/google (SFR-007, 윤태현)
// 카카오·구글 로그인 화면으로 보낸다.
import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_MAX_AGE,
  encodeOAuthState,
  getAppUrl,
  getCallbackUrl,
  getProvider,
  safeNextPath,
} from "@/lib/auth/providers";
import { hasAuthSecret } from "@/lib/auth/session";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/auth/[provider]">
) {
  const { provider: providerId } = await ctx.params;
  const provider = getProvider(providerId);
  if (!provider) {
    return NextResponse.json({ error: "지원하지 않는 로그인 방법" }, { status: 404 });
  }

  const appUrl = getAppUrl(request.nextUrl.origin);
  const clientId = provider.clientId();
  if (!clientId || !hasAuthSecret()) {
    console.error(
      `[로그인] .env.local 확인: ${provider.label} 키 ${clientId ? "있음" : "없음"}, AUTH_SECRET ${hasAuthSecret() ? "있음" : "없거나 32자 미만"}`
    );
    return NextResponse.redirect(new URL("/login?error=config", appUrl));
  }

  // 요청 위조 방지용 일회용 값. 콜백에서 같은 값이 돌아와야 로그인을 진행한다
  const state = randomBytes(16).toString("base64url");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));

  const authorizeUrl = new URL(provider.authorizeUrl);
  authorizeUrl.search = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: getCallbackUrl(appUrl, provider.id),
    state,
    ...(provider.scope ? { scope: provider.scope } : {}),
    ...provider.extraAuthorizeParams,
  }).toString();

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(
    OAUTH_STATE_COOKIE,
    encodeOAuthState({ provider: provider.id, state, next }),
    {
      httpOnly: true,
      sameSite: "lax", // 카카오·구글에서 돌아올 때(주소 이동)는 쿠키가 같이 온다
      secure: appUrl.startsWith("https://"),
      path: "/api/auth",
      maxAge: OAUTH_STATE_MAX_AGE,
    }
  );
  return response;
}
