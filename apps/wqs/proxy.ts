import { Role } from "@prisma/client";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const config = {
  matcher: ["/", "/requests/:path*", "/dashboard/:path*", "/payments/:path*", "/pricing/:path*"],
};

const rolePaths: Record<Role, string[]> = {
  user: [
    "/",
    "/requests",
    "/requests/pending",
    "/requests/action-needed",
    "/requests/testing",
    "/requests/completed",
    "/payments",
    "/pricing",
  ],
  technician: [
    "/",
    "/requests",
    "/requests/pending",
    "/requests/sample-collection",
    "/requests/testing",
  ],
  admin: ["/", "/dashboard"],
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    const role = token?.role as Role;

    if (!role) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (!rolePaths[role]?.includes(pathname)) {
      return NextResponse.redirect(new URL("/404", req.url));
    }

    if (pathname === "/" && role === "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if ((pathname === "/" || pathname === "/requests") && role !== "admin") {
      return NextResponse.redirect(new URL("/requests/pending", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);