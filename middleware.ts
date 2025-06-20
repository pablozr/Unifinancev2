﻿import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (!error && data?.user) {
      user = data.user
    }
  } catch (error) {
  }

  const protectedRoutes = ['/dashboard', '/profile', '/settings']
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (request.nextUrl.pathname === '/' || 
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/api')) {
    return supabaseResponse
  }

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo')
    if (redirectTo && redirectTo !== '/dashboard') {
      const url = request.nextUrl.clone()
      url.pathname = redirectTo
      url.searchParams.delete('redirectTo')
      return NextResponse.redirect(url)
    } else {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      url.searchParams.delete('redirectTo')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (to prevent issues with server actions)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
