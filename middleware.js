import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/api/login', '/api/logout'];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const session = req.cookies.get('fund_session')?.value;
  const expected = process.env.SESSION_SECRET;

  if (!session || !expected || session !== expected) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
