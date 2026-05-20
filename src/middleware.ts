import { NextResponse, type NextRequest } from "next/server";

const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const IS_DEMO = !CLERK_KEY.startsWith("pk_");

// In demo mode (no real Clerk keys), bypass auth entirely.
// In production with real keys, swap this for clerkMiddleware.
export default function middleware(req: NextRequest) {
  if (IS_DEMO) return NextResponse.next();

  // Real Clerk middleware would go here when keys are configured.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
