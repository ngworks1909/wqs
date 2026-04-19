import { Role } from '@prisma/client';
import { withAuth } from 'next-auth/middleware'
import { NextResponse, NextRequest } from 'next/server';

export const config = {
  matcher: ["/", "/requests", "/dashboard", "/payments", "/requests/:path*", "/pricing/:path*"],
}

const rolePaths: Record<Role, string[]> = {
  [Role.user]: [
    "/",
    "/requests",
    "/requests/pending",
    "/requests/action-needed",
    "/requests/testing",
    "/requests/completed",
    "/payments",
    "/pricing",
  ],
  [Role.technician]: [
    "/",
    "/requests",
    "/requests/pending",
    "/requests/sample-collection",
    "/requests/testing",
  ],
  [Role.admin]: ["/", "/dashboard"],
};

export default withAuth(async (req: NextRequest) => {
  const token = req.cookies.get("__Secure-next-auth.session-token")?.value

  // Redirect if no token
  if (!token) {
    // Typecast req to NextRequest to access nextUrl
    return NextResponse.redirect(new URL('/login', (req as NextRequest).url));
  }
  const userRole: Role = token.role;

  const pathname = (req as NextRequest).nextUrl.pathname;
  if (!rolePaths[userRole].includes(pathname)) {
    return NextResponse.redirect(new URL("/404", (req as NextRequest).url));
  }
  if(pathname === "/" && userRole === Role.admin) {
    return NextResponse.redirect(new URL("/dashboard", (req as NextRequest).url));
  }

  if (pathname === "/" || pathname === "/requests") {
    return NextResponse.redirect(new URL("/requests/pending", (req as NextRequest).url));
  }

  // Allow the request to continue
  return NextResponse.next();
});