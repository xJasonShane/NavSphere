import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development'

  // 生产环境拦截管理后台和本地 API 路由
  if (!isDev) {
    if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/local')) {
      return NextResponse.rewrite(new URL('/not-found', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/local/:path*']
}
