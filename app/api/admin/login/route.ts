import { NextResponse } from 'next/server';
import { signToken, createTokenCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { login = '', pin = '' } = body;

    const cleanLogin = String(login).trim().toLowerCase();
    const cleanPin = String(pin).trim().toLowerCase();

    // Environment-based admin credentials (NO hardcoded fallbacks)
    const adminDevLogin = process.env.ADMIN_DEV_LOGIN?.toLowerCase();
    const adminDevPin = process.env.ADMIN_DEV_PIN?.toLowerCase();
    const adminEditorLogin = process.env.ADMIN_EDITOR_LOGIN?.toLowerCase();
    const adminEditorPin = process.env.ADMIN_EDITOR_PIN?.toLowerCase();

    // Fail-safe: if env vars are not configured, deny all access
    if (!adminDevLogin || !adminDevPin || !adminEditorLogin || !adminEditorPin) {
      console.error('Admin credentials environment variables are not configured.');
      return NextResponse.json(
        { success: false, error: 'Сервис авторизации не настроен. Обратитесь к администратору.' },
        { status: 503 }
      );
    }

    let role: 'dev' | 'editor' | null = null;
    let userId = '';
    let name = '';

    // 1. Developer Role Match
    if (cleanLogin === adminDevLogin && cleanPin === adminDevPin) {
      role = 'dev';
      userId = 'dev_1';
      name = 'Разработчик';
    }

    // 2. Editor Role Match
    if (!role && cleanLogin === adminEditorLogin && cleanPin === adminEditorPin) {
      role = 'editor';
      userId = 'editor_1';
      name = 'Редактор';
    }

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Неверный логин или пароль' },
        { status: 401 }
      );
    }

    // Generate JWT token and set as HTTP-Only cookie
    const token = await signToken({ role, userId, name });
    const response = NextResponse.json({
      success: true,
      role,
      userId,
      name,
    });

    response.headers.set('Set-Cookie', createTokenCookie(token));

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера при авторизации' },
      { status: 500 }
    );
  }
}
