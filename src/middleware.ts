import { NextRequest, NextResponse } from 'next/server';

export const ADMIN_SESSION_COOKIE_NAME = 'tn_admin_session_token';
export const DRIVER_SESSION_COOKIE_NAME = 'tn_driver_session_token';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Admin login portal and admin auth API
  if (pathname === '/admin/login' || pathname.startsWith('/api/admin/auth/')) {
    if (pathname === '/admin/login') {
      const token = req.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
      if (token && token.startsWith('tns_') && token.length > 20) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
    return NextResponse.next();
  }

  // 2. Intercept /admin and /admin/* routes
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const adminToken = req.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;

    // Strict cloaking: non-admins or drivers trying to view admin get 404
    if (!adminToken || !adminToken.startsWith('tns_') || adminToken.length < 20) {
      const url = req.nextUrl.clone();
      url.pathname = '/not-found';
      const response = NextResponse.rewrite(url, { status: 404 });
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return response;
    }

    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  // 3. Intercept /api/admin/* endpoints
  if (pathname.startsWith('/api/admin/')) {
    const adminToken = req.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;

    if (!adminToken || !adminToken.startsWith('tns_') || adminToken.length < 20) {
      return NextResponse.json({ error: 'Endpoint introuvable' }, { status: 404 });
    }
  }

  // 4. Driver login and auth endpoints (Public entrypoint for partners)
  if (pathname === '/driver/login' || pathname.startsWith('/api/driver/auth/')) {
    if (pathname === '/driver/login') {
      const driverToken = req.cookies.get(DRIVER_SESSION_COOKIE_NAME)?.value;
      if (driverToken && driverToken.startsWith('tnd_') && driverToken.length > 20) {
        return NextResponse.redirect(new URL('/driver', req.url));
      }
    }
    return NextResponse.next();
  }

  // 5. Intercept /driver and /driver/* routes (Hardened cloaking)
  if (pathname === '/driver' || pathname.startsWith('/driver/')) {
    const driverToken = req.cookies.get(DRIVER_SESSION_COOKIE_NAME)?.value;

    // Strict 404 cloaking for unauthorized requests (passengers, crawlers, or bad tokens)
    if (!driverToken || !driverToken.startsWith('tnd_') || driverToken.length < 20) {
      const url = req.nextUrl.clone();
      url.pathname = '/not-found';
      const response = NextResponse.rewrite(url, { status: 404 });
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return response;
    }

    // Authenticated driver partner
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  // 6. Intercept /api/driver/* endpoints
  if (pathname.startsWith('/api/driver/')) {
    const driverToken = req.cookies.get(DRIVER_SESSION_COOKIE_NAME)?.value;

    if (!driverToken || !driverToken.startsWith('tnd_') || driverToken.length < 20) {
      return NextResponse.json({ error: 'Endpoint introuvable' }, { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/driver/:path*', '/api/driver/:path*'],
};
