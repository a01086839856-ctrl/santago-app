// 카카오·구글 로그인 설정 (SFR-007, 윤태현)
// 두 곳 모두 OAuth 2.0 "인가 코드" 방식으로 로그인한다.
//   1) 우리 서버 → 카카오/구글 로그인 화면으로 보냄 (/api/auth/kakao)
//   2) 사용자가 로그인·동의하면 카카오/구글이 우리 콜백 주소로 "인가 코드"를 붙여 돌려보냄
//   3) 우리 서버가 인가 코드를 "토큰"으로 바꾸고, 토큰으로 회원 정보를 받아 옴
//   4) 회원 정보로 DB의 users를 찾거나 만들고, 로그인 쿠키를 넣음
// 키는 서버에서만 쓰므로 NEXT_PUBLIC_을 붙이지 않는다.

export type ProviderId = "kakao" | "google";

// 카카오·구글에서 받아 온 회원 정보를 우리 DB 모양으로 바꾼 것
export type OAuthProfile = {
  providerId: string; // 카카오·구글의 회원 고유번호
  name: string;
  email: string | null;
};

type ProviderConfig = {
  dbProvider: "KAKAO" | "GOOGLE"; // prisma/schema.prisma의 AuthProvider 값
  label: string;
  authorizeUrl: string; // 로그인 화면 주소
  tokenUrl: string; // 인가 코드 → 토큰
  userInfoUrl: string; // 토큰 → 회원 정보
  scope?: string;
  extraAuthorizeParams?: Record<string, string>;
  clientId: () => string | undefined;
  clientSecret: () => string | undefined;
  toProfile: (data: Record<string, unknown>) => OAuthProfile | null;
};

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  // 카카오 로그인 REST API
  // scope를 보내지 않으면 [카카오 로그인] > [동의항목]에서 설정한 항목으로 동의를 받는다
  kakao: {
    dbProvider: "KAKAO",
    label: "카카오",
    authorizeUrl: "https://kauth.kakao.com/oauth/authorize",
    tokenUrl: "https://kauth.kakao.com/oauth/token",
    userInfoUrl: "https://kapi.kakao.com/v2/user/me",
    clientId: () => process.env.KAKAO_LOGIN_REST_API_KEY,
    clientSecret: () => process.env.KAKAO_LOGIN_CLIENT_SECRET,
    toProfile: (data) => {
      const id = data.id;
      if (typeof id !== "number" && typeof id !== "string") return null;
      const account = (data.kakao_account ?? {}) as Record<string, unknown>;
      const profile = (account.profile ?? {}) as Record<string, unknown>;
      const properties = (data.properties ?? {}) as Record<string, unknown>;
      return {
        providerId: String(id),
        name: text(profile.nickname) ?? text(properties.nickname) ?? "카카오 회원",
        email: text(account.email),
      };
    },
  },
  // 구글 OAuth 2.0 (OpenID Connect)
  // 이름만 쓰므로 openid profile 두 가지만 요청한다
  google: {
    dbProvider: "GOOGLE",
    label: "구글",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
    scope: "openid profile",
    // 시연 때 계정을 바꿔 가며 로그인할 수 있게 계정 선택 화면을 항상 띄운다
    extraAuthorizeParams: { prompt: "select_account" },
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    toProfile: (data) => {
      const sub = text(data.sub);
      if (!sub) return null;
      return {
        providerId: sub,
        name: text(data.name) ?? "구글 회원",
        email: text(data.email),
      };
    },
  },
};

export function getProvider(id: string): (ProviderConfig & { id: ProviderId }) | null {
  if (id !== "kakao" && id !== "google") return null;
  return { ...PROVIDERS[id], id };
}

// 우리 서비스 주소. .env.local의 APP_URL이 있으면 그것을, 없으면 지금 요청한 주소를 쓴다
// (배포 서버는 Nginx 뒤에서 돌아가므로 APP_URL=https://도메인 을 꼭 넣는다)
export function getAppUrl(requestOrigin: string): string {
  return (process.env.APP_URL || requestOrigin).replace(/\/+$/, "");
}

// 카카오·구글에 등록하는 리다이렉트 URI와 똑같아야 한다
export function getCallbackUrl(appUrl: string, provider: ProviderId): string {
  return `${appUrl}/api/auth/${provider}/callback`;
}

// 로그인 후 돌아갈 주소. 우리 사이트 안의 주소(/로 시작)만 허용한다
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/";
  }
  return value;
}

// 로그인 시작 → 콜백 사이에 잠깐 들고 있는 값 (10분)
export const OAUTH_STATE_COOKIE = "santago_oauth";
export const OAUTH_STATE_MAX_AGE = 60 * 10;

export type OAuthState = {
  provider: ProviderId;
  state: string; // 요청 위조를 막는 일회용 무작위 값
  next: string;
};

export function encodeOAuthState(value: OAuthState): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export function decodeOAuthState(raw: string | undefined): OAuthState | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (
      (value.provider === "kakao" || value.provider === "google") &&
      typeof value.state === "string" &&
      typeof value.next === "string"
    ) {
      return { provider: value.provider, state: value.state, next: safeNextPath(value.next) };
    }
  } catch {
    // 잘못된 값이면 아래에서 null
  }
  return null;
}

// 인가 코드 → 토큰 → 회원 정보
export async function fetchProfile(
  provider: ProviderConfig,
  code: string,
  redirectUri: string
): Promise<OAuthProfile> {
  const clientId = provider.clientId();
  const clientSecret = provider.clientSecret();
  if (!clientId) throw new Error(`${provider.label} 키가 .env.local에 없습니다.`);

  const form = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
  });
  if (clientSecret) form.set("client_secret", clientSecret);

  const tokenResponse = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body: form,
    cache: "no-store",
  });
  const token = (await tokenResponse.json().catch(() => ({}))) as Record<string, unknown>;
  const accessToken = text(token.access_token);
  if (!tokenResponse.ok || !accessToken) {
    // 키·시크릿·리다이렉트 URI가 틀리면 여기서 실패한다. 원인 파악용으로 서버 로그에만 남김
    throw new Error(
      `${provider.label} 토큰 발급 실패 (${tokenResponse.status}): ${JSON.stringify(token)}`
    );
  }

  const userResponse = await fetch(provider.userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const user = (await userResponse.json().catch(() => ({}))) as Record<string, unknown>;
  const profile = userResponse.ok ? provider.toProfile(user) : null;
  if (!profile) {
    throw new Error(`${provider.label} 회원 정보 조회 실패 (${userResponse.status})`);
  }
  return profile;
}
