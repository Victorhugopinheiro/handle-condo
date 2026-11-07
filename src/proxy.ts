import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { RESIDENT_COOKIE } from "@/lib/constants";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";
import { verifyResidentToken } from "@/lib/resident-token";

function isStaffPath(pathname: string) {
  return pathname.startsWith("/dashboard") || pathname === "/login";
}

function isResidentPath(pathname: string) {
  return pathname.startsWith("/ocorrencias") || pathname === "/acesso";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  let url: string | undefined;
  let anonKey: string | undefined;
  try {
    url = getSupabaseUrl();
    anonKey = getSupabaseAnonKey();
  } catch {
    url = undefined;
    anonKey = undefined;
  }

  let hasStaff = false;
  if (url && anonKey) {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        },
      },
    });

    const { data } = await supabase.auth.getClaims();
    hasStaff = typeof data?.claims?.sub === "string";
  }

  const residentToken = request.cookies.get(RESIDENT_COOKIE)?.value;
  const hasResident = residentToken
    ? Boolean(await verifyResidentToken(residentToken))
    : false;

  if (
    isStaffPath(pathname) &&
    hasResident &&
    !hasStaff &&
    pathname !== "/login"
  ) {
    return NextResponse.redirect(new URL("/ocorrencias", request.url));
  }

  if (
    isResidentPath(pathname) &&
    hasStaff &&
    !hasResident &&
    pathname !== "/acesso"
  ) {
    return NextResponse.redirect(
      new URL("/dashboard/ocorrencias", request.url)
    );
  }

  if (pathname.startsWith("/dashboard") && !hasStaff) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/ocorrencias") && !hasResident) {
    return NextResponse.redirect(new URL("/acesso", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
