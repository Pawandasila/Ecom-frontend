import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("accessToken")?.value;
  const userRole = request.cookies.get("userRole")?.value;

  const publicPaths = ["/", "/signup"];
  const isPublicPath = publicPaths.includes(path);
  const adminPaths = [
    "/admin",
    "/admin/dashboard",
    "/admin/products",
    "/admin/orders",
    "/admin/users",
  ];
  const isAdminPath = adminPaths.some((adminPath) =>
    path.startsWith(adminPath)
  );
  const userPaths = ["/cart", "/orders", "/profile"];
  const isUserPath = userPaths.some((userPath) => path.startsWith(userPath));

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token && isPublicPath) {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/products", request.url));
    }
  }

  if (isAdminPath && userRole !== "admin") {
    return NextResponse.redirect(new URL("/products", request.url));
  }

  if (isUserPath && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/products",
    "/admin/:path*",
    "/cart",
    "/orders",
    "/profile",
  ],
};
