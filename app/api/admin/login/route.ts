import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { login = '', pin = '' } = body;

    const cleanLogin = String(login).trim().toLowerCase();
    const cleanPin = String(pin).trim().toLowerCase();

    // Environment-based admin credentials
    const adminDevLogin = (process.env.ADMIN_DEV_LOGIN || 'alevtina').toLowerCase();
    const adminDevPin = (process.env.ADMIN_DEV_PIN || '7777').toLowerCase();
    const adminEditorLogin = (process.env.ADMIN_EDITOR_LOGIN || 'vlad').toLowerCase();
    const adminEditorPin = (process.env.ADMIN_EDITOR_PIN || '2026').toLowerCase();

    // 1. Developer Role Match
    if (
      (cleanLogin === adminDevLogin && cleanPin === adminDevPin) ||
      (cleanPin === adminDevPin && !cleanLogin) ||
      (cleanPin === adminDevLogin && !cleanLogin)
    ) {
      return NextResponse.json({
        success: true,
        role: 'dev',
        userId: 'dev_1',
        name: 'Алевтина (Разработчик)',
      });
    }

    // 2. Editor Role Match
    if (
      (cleanLogin === adminEditorLogin && cleanPin === adminEditorPin) ||
      (cleanPin === adminEditorPin && !cleanLogin) ||
      (cleanPin === 'sapunov' && !cleanLogin) ||
      (cleanLogin === 'vlad' && cleanPin === '2026')
    ) {
      return NextResponse.json({
        success: true,
        role: 'editor',
        userId: 'editor_1',
        name: 'Влад Сапунов',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Неверный логин или пароль' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера при авторизации' },
      { status: 500 }
    );
  }
}
