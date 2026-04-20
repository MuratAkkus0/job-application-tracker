import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";

export default async function proxy(request: NextRequest) {
  const session = await getSession();
  const url = request.nextUrl.pathname;

  const isDashboardPage = url.startsWith("/dashboard");
  if (isDashboardPage && !session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isLoginPage = url.startsWith("/login");
  const isRegisterPage = url.startsWith("/register");
  if ((isLoginPage || isRegisterPage) && session?.user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}
