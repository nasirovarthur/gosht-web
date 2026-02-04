import { NextRequest, NextResponse } from 'next/server'

const SUPPORTED_LANGUAGES = ['uz', 'ru', 'en']
const DEFAULT_LANGUAGE = 'uz'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Если путь начинается с /studio без языка, перенаправляем на /uz/studio
  if (pathname === '/studio' || pathname.startsWith('/studio/')) {
    return NextResponse.redirect(new URL(`/${DEFAULT_LANGUAGE}/studio`, request.url))
  }

  // Проверяем есть ли уже язык в URL
  const pathnameHasLanguage = SUPPORTED_LANGUAGES.some(
    (lang) => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`
  )

  // Если языка нет, перенаправляем на язык по умолчанию
  if (!pathnameHasLanguage && pathname === '/') {
    return NextResponse.redirect(new URL(`/${DEFAULT_LANGUAGE}`, request.url))
  }

  // Если путь не начинается с поддерживаемого языка (и не / и не /studio), перенаправляем
  if (!pathnameHasLanguage && pathname !== '/' && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL(`/${DEFAULT_LANGUAGE}${pathname}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|cur|heic|heif|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
