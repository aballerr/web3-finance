import { NextRequest, NextResponse } from "next/server";
import { authGet } from "utils/fetch-wrapper";

export default async function middleware(req: NextRequest) {
  const pingUrl = `auth/ping`;

  const url = req.nextUrl.clone();
  const jwt = req.cookies.get("jwt");

  const { isAuthenticated, isSetup } = await authGet({
    url: pingUrl,
    jwtAccessToken: jwt,
  });

  if (isAuthenticated && url.pathname.includes("login") && !isSetup) {
    const url = isSetup ? "/" : "/safes";

    return NextResponse.redirect(new URL(url, req.url));
  } else if (isAuthenticated && url.pathname === "/" && !isSetup) {
    return NextResponse.redirect(new URL("/safes", req.url));
  }

  return NextResponse.next();
}
