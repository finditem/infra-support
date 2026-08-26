import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const NO_AUTH_REQUIRED_PATHS = ["/login", "/auth/confirm"];
const GUEST_ONLY_PATHS = ["/login"];

export const middleware = async (request: NextRequest) => {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // /api/ 경로(Slack 웹훅, cron)는 로그인 세션이 없는 서버 간 요청이라 여기서 제외한다.
  // 대신 각 라우트가 자체적으로 Slack 서명이나 CRON_SECRET을 검증한다.
  const isNoAuthRequiredPath =
    NO_AUTH_REQUIRED_PATHS.includes(request.nextUrl.pathname) ||
    request.nextUrl.pathname.startsWith("/api/");
  const isGuestOnlyPath = GUEST_ONLY_PATHS.includes(request.nextUrl.pathname);

  if (!user && !isNoAuthRequiredPath) {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  if (user && isGuestOnlyPath) {
    const redirectResponse = NextResponse.redirect(new URL("/", request.url));
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // 여기서 이미 검증한 유저 id를 요청 헤더로 실어 보내면, Server Component가
  // auth.getUser()를 다시 호출하지 않고도(왕복 네트워크 호출 1회 절약) 재사용할 수 있다.
  // 클라이언트가 같은 이름의 헤더를 직접 보내더라도 항상 여기서 set/delete로 덮어쓰므로 위조되지 않는다.
  const requestHeaders = new Headers(request.headers);
  if (user) {
    requestHeaders.set("x-user-id", user.id);
  } else {
    requestHeaders.delete("x-user-id");
  }

  const finalResponse = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return finalResponse;
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|logo.svg).*)"],
};
