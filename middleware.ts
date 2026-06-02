import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const pathname = requestUrl.pathname

  // Rotas públicas
  const isPublicRoute = pathname === '/login' ||
    pathname.startsWith('/recuperar-senha') ||
    pathname.startsWith('/styleguide')

  // Criar client Supabase
  const supabase = await createServerClient()

  // Verificar sessão
  const { data: { session } } = await supabase.auth.getSession()

  // Não autenticado tentando acessar rota protegida
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', requestUrl))
  }

  // Autenticado na página de login - redirecionar para dashboard padrão
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/controle-anual', requestUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
