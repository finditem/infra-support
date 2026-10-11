import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const NO_AUTH_REQUIRED_PATHS = ["/login", "/auth/confirm"];
const GUEST_ONLY_PATHS = ["/login"];
const INVITE_SETUP_PATH = "/invite/setup";

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
  const isApiPath = request.nextUrl.pathname.startsWith("/api/");

  if (!user && !isNoAuthRequiredPath) {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  if (user && !isApiPath) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("registered_at")
      .eq("id", user.id)
      .maybeSingle();
    const isRegistrationComplete = !profileError && !!profile?.registered_at;
    const isInviteSetupPath = request.nextUrl.pathname === INVITE_SETUP_PATH;

    // 초대 링크 확인으로 생긴 세션은 이름·비밀번호 설정이 끝날 때까지 설정 화면에서만 쓴다.
    // 프로필 조회 실패도 완료로 간주하지 않아 업무 화면이 열리는 것을 막는다.
    if (!isRegistrationComplete && !isInviteSetupPath) {
      const redirectResponse = NextResponse.redirect(new URL(INVITE_SETUP_PATH, request.url));
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    }

    if (isRegistrationComplete && isInviteSetupPath) {
      const redirectResponse = NextResponse.redirect(new URL("/", request.url));
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    }
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
