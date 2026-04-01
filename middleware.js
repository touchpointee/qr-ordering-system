import { NextResponse } from "next/server";

function getAllowedOrigins() {
  const envOrigins = [
    process.env.CORS_ORIGIN,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_SOCKET_URL,
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  return new Set([
    ...envOrigins,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8082",
    "http://127.0.0.1:8082",
    "http://192.168.167.43:8081",
    "http://192.168.167.43:8082",
  ]);
}

function applyCorsHeaders(request, response) {
  const origin = request.headers.get("origin");
  const allowedOrigins = getAllowedOrigins();

  if (origin && allowedOrigins.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
  }

  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith("/api");
  const isAdminPage = pathname.startsWith("/admin");

  if (isApiRoute && request.method === "OPTIONS") {
    return applyCorsHeaders(request, new NextResponse(null, { status: 204 }));
  }

  if (isApiRoute) {
    return applyCorsHeaders(request, NextResponse.next());
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (!isAdminPage) {
    return NextResponse.next();
  }

  const token = request.cookies.get("staff_token")?.value;

  if (!token) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
