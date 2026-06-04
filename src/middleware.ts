import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/config/redis';

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
  analytics: true,
  prefix: '@dana-enterprise/ratelimit',
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  
  // Apply Rate Limiting to ALL API operations
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);
    
    if (!success) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too Many Requests', 
          message: 'Rate limit breached. Maximum allowed is 60 requests/min.' 
        }),
        { 
          status: 429, 
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      );
    }
  }

  // Session & Authentication Safeguards
  const sessionCookie = request.cookies.get('__session')?.value;
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isLoginRoute = request.nextUrl.pathname === '/login';

  if (isDashboardRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isLoginRoute && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/v1/:path*', '/dashboard/:path*', '/login'],
};
