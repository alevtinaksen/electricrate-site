import { NextResponse } from 'next/server';
import { clearTokenCookie } from '@/lib/auth';

/**
 * POST /api/admin/logout — Clear the admin JWT cookie
 */
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.headers.set('Set-Cookie', clearTokenCookie());
  return response;
}
