import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Client routes security - ensure clients can only access contract viewing
  if (pathname.startsWith('/client/')) {
    // Only allow access to contract viewing pages
    if (!pathname.match(/^\/client\/contract\/[^\/]+$/)) {
      // Redirect invalid client routes to 404
      return NextResponse.redirect(new URL('/404', request.url))
    }
    
    // Add security headers for client pages
    const response = NextResponse.next()
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-Client-Portal', 'true')
    
    return response
  }

  // Prevent access to agency routes from client domains/contexts
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/wizard') || 
      pathname.startsWith('/settings') ||
      pathname.startsWith('/contracts')) {
    
    // Check if this might be a client trying to access agency routes
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''
    
    // If coming from a client page, redirect to client area
    if (referer.includes('/client/')) {
      return NextResponse.redirect(new URL('/client/contract/invalid', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/client/:path*',
    '/dashboard/:path*',
    '/wizard/:path*',
    '/settings/:path*',
    '/contracts/:path*'
  ]
}