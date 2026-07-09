// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getLogtoContext, getAccessToken } from '@logto/next/server-actions';
import { logtoConfig } from './app/logto';

export async function middleware(request: NextRequest) {
  const { isAuthenticated } = await getLogtoContext(logtoConfig);

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  try {
    const resource = logtoConfig.resources?.[0];
    await getAccessToken(logtoConfig, resource);
  } catch (e) {
    console.error("Middleware failed to refresh token", e);
  }

  return NextResponse.next();
}

export const config = {
  // Защищаем всё, кроме статики, API Logto и страниц колбэка
  matcher: ['/((?!sign-in|callback|_next/static|_next/image|favicon.ico).*)'],
};