import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const ADMIN_ROLES = ["superadmin", "kitchen_manager"];

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token =
    request.cookies.get("staff_token")?.value ||
    (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");

  if (!token) return unauthorized();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (!ADMIN_ROLES.includes(decoded.role)) return forbidden();
    }
    return NextResponse.next();
  } catch {
    return unauthorized();
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
