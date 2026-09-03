import { NextResponse } from 'next/server';

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

    // 1. Developer Role Match
    if (cleanLogin === adminDevLogin && cleanPin === adminDevPin) {
      return NextResponse.json({
        success: true,
        role: 'dev',
        userId: 'dev_1',
        name: 'Разработчик',
      });
    }

    // 2. Editor Role Match
    if (cleanLogin === adminEditorLogin && cleanPin === adminEditorPin) {
      return NextResponse.json({
        success: true,
        role: 'editor',
        userId: 'editor_1',
        name: 'Редактор',
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
