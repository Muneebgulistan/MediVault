import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

const { auth } = NextAuth(authConfig);

export default auth(function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const isAuthorized = !!req.auth?.user?.id;
    if (!isAuthorized) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
