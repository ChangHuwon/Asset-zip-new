import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

const protectedPaths = ["/dashboard", "/accounts", "/entries"];
const authPaths = ["/start", "/create", "/join", "/login"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtected = protectedPaths.some((p) => path.startsWith(p));
  const isAuth = authPaths.some((p) => path.startsWith(p));

  const token = req.cookies.get("session")?.value;
  const session = await decrypt(token);

  if (isProtected && !session?.memberId) {
    return NextResponse.redirect(new URL("/start", req.nextUrl));
  }

  if (isAuth && session?.memberId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|icons|manifest.json).*)"],
};
