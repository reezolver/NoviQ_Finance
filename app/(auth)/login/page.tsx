'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { GoogleButton } from '@/components/auth/GoogleButton'

/**
 * Tela de login (porta de entrada do app). Autentica via
 * `signInWithPassword` no client de browser; ao concluir, recarrega para `/`
 * e deixa o **middleware** rotear conforme o papel (master/educador → `/painel`;
 * cliente → Controle Anual da própria subconta). O reload completo garante que
 * o cookie de sessão chegue ao servidor antes do roteamento.
 */
function LoginForm() {
  const searchParams = useSearchParams()
  const erroCallback = searchParams.get('erro') === 'auth'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    erroCallback ? 'Não foi possível concluir o acesso. Tente novamente.' : null
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError('E-mail ou senha inválidos. Tente novamente.')
        setLoading(false)
        return
      }

      // Sessão gravada nos cookies → recarrega e deixa o middleware rotear.
      window.location.href = '/'
    } catch {
      setError('Erro ao fazer login. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary">Noviq Finance</h1>
          <p className="mt-2 text-muted-foreground">Controle financeiro inteligente</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    href="/recuperar-senha"
                    className="text-sm text-primary hover:underline"
                  >
                    Esqueci a senha
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-sm text-muted-foreground">ou</span>
              <Separator className="flex-1" />
            </div>

            <GoogleButton label="Entrar com Google" />

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Não tem conta?{' '}
              <Link href="/cadastro" className="text-primary hover:underline">
                Criar conta
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
