import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_token';
const TOKEN_EXPIRY = '24h';

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not configured');
  }
  return new TextEncoder().encode(secret);
}

export interface TokenPayload {
  role: 'dev' | 'editor';
  userId: string;
  name: string;
}

/**
 * Sign a JWT token with the given payload
 */
export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecret());
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Get the admin token from request cookies
 */
export function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}

/**
 * Get the admin token from Next.js cookies() helper (for Server Components / Route Handlers)
 */
export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}

/**
 * Create a Set-Cookie header value for the admin token
 */
export function createTokenCookie(token: string): string {
  const maxAge = 60 * 60 * 24; // 24 hours
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`;
}

/**
 * Create a Set-Cookie header value to clear the admin token
 */
export function clearTokenCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
}

export { COOKIE_NAME };
