import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isRecuperarSenhaPage = request.nextUrl.pathname.startsWith('/recuperar-senha')
  const isNovaSenhaPage = request.nextUrl.pathname.startsWith('/nova-senha')
  const isCadastroPage = request.nextUrl.pathname.startsWith('/cadastro')
  const isAguardandoAprovacaoPage = request.nextUrl.pathname.startsWith('/aguardando-aprovacao')
  const isPublicPage = request.nextUrl.pathname === '/'

  if (!user && !isAuthPage && !isRecuperarSenhaPage && !isNovaSenhaPage && !isCadastroPage && !isAguardandoAprovacaoPage && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Proteção de rotas por tipo de perfil
  if (user) {
    // Buscar tipo_perfil e status do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('tipo_perfil, status')
      .eq('id', user.id)
      .single()

    // Verificar se usuário está pendente de aprovação
    if (profile?.status === 'pendente' && !isAguardandoAprovacaoPage) {
      return NextResponse.redirect(new URL('/aguardando-aprovacao', request.url))
    }

    const pathname = request.nextUrl.pathname

    // Cliente não pode acessar /painel ou /master
    if (profile?.tipo_perfil === 'cliente') {
      if (pathname.startsWith('/painel') || pathname.startsWith('/master')) {
        return NextResponse.redirect(new URL('/controle-anual', request.url))
      }
    }

    // Educador não pode acessar /master
    if (profile?.tipo_perfil === 'educador') {
      if (pathname.startsWith('/master')) {
        return NextResponse.redirect(new URL('/painel-clientes', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
