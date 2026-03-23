// TODO: Exercise 3a — Middleware | Target: public-site/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export function middleware(request: NextRequest) { return NextResponse.next(); }
export const config = { matcher: ['/dashboard/:path*', '/api/:path*'] };
