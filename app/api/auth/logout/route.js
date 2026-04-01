const { NextResponse } = require("next/server");

function getSecureCookieFlag(request) {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) return forwardedProto.split(",")[0].trim() === "https";
  return request.nextUrl.protocol === "https:";
}

export async function POST(request) {
  const response = NextResponse.json({ success: true });
  response.cookies.set("staff_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: getSecureCookieFlag(request),
    path: "/",
    maxAge: 0,
  });
  return response;
}
