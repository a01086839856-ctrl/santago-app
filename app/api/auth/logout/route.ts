// 로그아웃: POST /api/auth/logout (SFR-007, 윤태현)
// 주소만 열어도 로그아웃되지 않도록 GET이 아니라 POST(버튼)로만 받는다.
import { NextResponse, type NextRequest } from "next/server";
import { getAppUrl } from "@/lib/auth/providers";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const appUrl = getAppUrl(request.nextUrl.origin);
  // 303: 폼 전송(POST) 뒤 첫 화면을 GET으로 다시 연다
  const response = NextResponse.redirect(new URL("/", appUrl), 303);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
