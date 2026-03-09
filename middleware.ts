import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAdminRoute = pathname.startsWith('/admin')
  const isAuthRoute = pathname.startsWith('/login')
  const isAuthenticated = !!req.auth
  const isAdmin = req.auth?.user?.role === 'ADMIN'

  if (isAdminRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
