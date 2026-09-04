import { NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken, clearTokenCookie } from '@/lib/auth';

/**
 * GET /api/admin/me — Check if the current user is authenticated
 * Returns the user's role and info if valid JWT cookie exists
 */
export async function GET() {
  try {
    const token = await getTokenFromCookies();

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (!payload) {
      // Token is invalid or expired — clear the cookie
      const response = NextResponse.json(
        { authenticated: false, error: 'Токен истёк или невалиден' },
        { status: 401 }
      );
      response.headers.set('Set-Cookie', clearTokenCookie());
      return response;
    }

    return NextResponse.json({
      authenticated: true,
      role: payload.role,
      userId: payload.userId,
      name: payload.name,
    });
  } catch {
    return NextResponse.json(
      { authenticated: false, error: 'Ошибка проверки авторизации' },
      { status: 500 }
    );
  }
}
