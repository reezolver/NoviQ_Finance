import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

type TipoPerfil = Database['public']['Enums']['tipo_perfil']

/**
 * Resolve para onde mandar a **raiz autenticada** conforme o papel:
 * - `cliente` → Controle Anual da **própria** subconta (`owner_user_id = user.id`).
 * - `educador`/`master` → `/painel` (dashboard de gestão — Spec 07).
 *
 * Roda com o client de usuário (RLS-enforced): a policy `can_access_subconta`
 * já garante que o cliente só enxerga a própria subconta. Retorna `null`
 * quando o cliente ainda não tem subconta vinculada (deixa passar sem redirect).
 */
async function rotaInicial(
  supabase: SupabaseClient<Database>,
  userId: string,
  tipoPerfil: TipoPerfil | undefined
): Promise<string | null> {
  if (tipoPerfil === 'cliente') {
    const { data } = await supabase
      .from('subcontas')
      .select('id')
      .eq('owner_user_id', userId)
      .eq('tipo', 'cliente')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    return data ? `/${data.id}/controle-anual` : null
  }
  // educador | master
  return '/painel'
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
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

  const pathname = request.nextUrl.pathname

  // Páginas de autenticação / entrada (públicas, mas são "porta de entrada":
  // se o usuário já está logado, são redirecionadas para a home do papel).
  const isLoginPage = pathname.startsWith('/login')
  const isCadastroPage = pathname.startsWith('/cadastro')
  const isRecuperarSenhaPage = pathname.startsWith('/recuperar-senha')
  const isNovaSenhaPage = pathname.startsWith('/nova-senha')
  const isAguardandoAprovacaoPage = pathname.startsWith('/aguardando-aprovacao')
  const isAuthPage =
    isLoginPage ||
    isCadastroPage ||
    isRecuperarSenhaPage ||
    isNovaSenhaPage ||
    isAguardandoAprovacaoPage

  // Públicas que NÃO redirecionam logados: landing `/` e anamnese pública (Spec 08).
  const isRoot = pathname === '/'
  const isAnamnesePublica = pathname.startsWith('/anamnese/')
  const isPublicPage = isRoot || isAnamnesePublica || isAuthPage

  // Não autenticado: só pode acessar páginas públicas.
  if (!user) {
    if (!isPublicPage) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  // Autenticado: papel + status vêm de `profiles` (fonte atualizada pelas actions).
  const { data: profile } = await supabase
    .from('profiles')
    .select('tipo_perfil, status')
    .eq('id', user.id)
    .single()

  // Pendente de aprovação (educador): preso em /aguardando-aprovacao.
  if (profile?.status === 'pendente') {
    if (!isAguardandoAprovacaoPage) {
      return NextResponse.redirect(new URL('/aguardando-aprovacao', request.url))
    }
    return supabaseResponse
  }

  // Raiz autenticada: entrando pela landing/login/etc → direcionar por papel.
  if (isRoot || isAuthPage) {
    const destino = await rotaInicial(supabase, user.id, profile?.tipo_perfil)
    if (destino && pathname !== destino) {
      return NextResponse.redirect(new URL(destino, request.url))
    }
    return supabaseResponse
  }

  // Proteção por papel: cliente não acessa o dashboard de gestão `/painel`.
  // (Acesso fino a `[subcontaId]` é validado na layout do workspace via RLS,
  // não aqui — evita query cara e duplicação da RLS.)
  if (profile?.tipo_perfil === 'cliente' && pathname.startsWith('/painel')) {
    const destino = await rotaInicial(supabase, user.id, 'cliente')
    return NextResponse.redirect(new URL(destino ?? '/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
