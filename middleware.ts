import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

/**
 * Middleware: Protects POST requests to /api/content, /api/upload, /api/analytics
 * Allows GET requests and /api/admin/* routes (login handles its own auth)
 */
export async function middleware(request: NextRequest) {
  const { pathname, } = request.nextUrl;
  const method = request.method;

  // Only protect POST/PUT/DELETE requests to data-modifying API routes
  if (method === 'GET' || method === 'OPTIONS' || method === 'HEAD') {
    return NextResponse.next();
  }

  // Don't protect the login/logout routes themselves
  if (pathname.startsWith('/api/admin/login') || pathname.startsWith('/api/admin/logout')) {
    return NextResponse.next();
  }

  // Protect these API routes with JWT verification
  const protectedPaths = ['/api/content', '/api/upload', '/api/analytics'];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Verify JWT token from cookie
  const token = getTokenFromRequest(request);

  if (!token) {
    return NextResponse.json(
      { error: 'Требуется авторизация. Войдите в админ-панель.' },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: 'Токен истёк или невалиден. Войдите заново.' },
      { status: 401 }
    );
  }

  // Token is valid — allow the request
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/content/:path*', '/api/upload/:path*', '/api/analytics/:path*'],
};
