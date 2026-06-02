import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const pathname = requestUrl.pathname

  // Rotas que não requerem autenticação
  const publicRoutes = ['/login', '/recuperar-senha', '/styleguide']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  try {
    // Criar client Supabase para SSR
    const supabase = await createServerClient()

    // Verificar sessão do usuário
    const { data: { session } } = await supabase.auth.getSession()

    // Se não está autenticado e tenta acessar rota protegida
    if (!session && !isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Se está autenticado e tenta acessar /login, redirecionar conforme perfil
    if (session && pathname === '/login') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tipo_perfil')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        switch (profile.tipo_perfil) {
          case 'cliente':
            return NextResponse.redirect(new URL('/controle-anual', request.url))
          case 'educador':
            return NextResponse.redirect(new URL('/painel', request.url))
          case 'master':
            return NextResponse.redirect(new URL('/master', request.url))
        }
      }
    }

    return NextResponse.next()
  } catch (error) {
    // Em caso de erro, permitir a requisição continuar
    // Isso evita bloqueios em caso de problemas com o Supabase
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
