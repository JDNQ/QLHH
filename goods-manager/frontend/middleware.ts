import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read access token from cookies (we'll also store it there for middleware access)
  // Note: localStorage is not accessible in middleware (edge runtime)
  // Token is stored in a cookie 'accessToken' by the auth store
  const token = request.cookies.get('accessToken')?.value;

  // We also check the zustand persisted state in a cookie
  const authStorage = request.cookies.get('auth-storage')?.value;
  let isAuthenticated = false;
  let isAdmin = false;

  if (authStorage) {
    try {
      const parsed = JSON.parse(decodeURIComponent(authStorage));
      const state = parsed?.state;
      isAuthenticated = !!state?.accessToken && !!state?.user;
      isAdmin = state?.user?.role === 'ADMIN';
    } catch {
      // ignore parse errors
    }
  }

  // Also accept direct accessToken cookie
  if (token) isAuthenticated = true;

  // ── /auth/* ─ redirect if already logged in ──────────────────────────────
  if (pathname.startsWith('/auth')) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ── /dashboard/* ─ require authentication ────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── /admin/* ─ require admin role ────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/:path*', '/dashboard/:path*', '/admin/:path*'],
};
