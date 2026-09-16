import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static assets, api/auth, and login page
  if (pathname === '/login' || pathname.startsWith('/api/auth') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    const isSecure = process.env.NODE_ENV === 'production' || request.nextUrl.protocol === 'https:'
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'sweet-spoon-hetty-secret-key-2026'
    
    // NextAuth v5 uses authjs prefix, v4 uses next-auth prefix
    const v5Cookie = isSecure ? '__Secure-authjs.session-token' : 'authjs.session-token'
    const v4Cookie = isSecure ? '__Secure-next-auth.session-token' : 'next-auth.session-token'

    let token = await getToken({ req: request, secret, salt: v5Cookie })
    if (!token) {
      token = await getToken({ req: request, secret, salt: v4Cookie })
    }
    if (!token) {
      // Fallback without salt just in case
      token = await getToken({ req: request, secret })
    }

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (token.role !== 'OWNER' && token.role !== 'ADMIN') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
