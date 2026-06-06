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
  const isPublicPage = request.nextUrl.pathname === '/'

  if (!user && !isAuthPage && !isRecuperarSenhaPage && !isNovaSenhaPage && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Proteção de rotas por tipo de perfil
  if (user) {
    // Buscar tipo_perfil do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('tipo_perfil')
      .eq('id', user.id)
      .single()

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
        return NextResponse.redirect(new URL('/painel', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
