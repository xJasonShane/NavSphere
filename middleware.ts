import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 本地开发模式，不需要认证
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
