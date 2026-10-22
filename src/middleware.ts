import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * حماية أولية للوحة الإدارة (فحص وجود كوكي الجلسة).
 * التحقق الكامل من صلاحية الجلسة يتم على الخادم في Layout و Route Handlers.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get("wael_admin_session")?.value);

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!hasSession) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/admin/login" && hasSession) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
