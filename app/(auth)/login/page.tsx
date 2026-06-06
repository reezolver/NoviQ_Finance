'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: signInError, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError('E-mail ou senha inválidos. Tente novamente.')
        return
      }

      // Buscar o tipo_perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('tipo_perfil')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        setError('Perfil não encontrado. Entre em contato com o suporte.')
        return
      }

      // Redirecionar conforme o tipo_perfil
      switch (profile.tipo_perfil) {
        case 'cliente':
          router.push('/controle-anual')
          break
        case 'educador':
          router.push('/painel')
          break
        case 'master':
          router.push('/master')
          break
        default:
          router.push('/controle-anual')
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Noviq Finance</h1>
          <p className="text-muted-foreground mt-2">Controle financeiro inteligente</p>
        </div>

        {/* Card de Login */}
        <Card>
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Campo E-mail */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Botão Entrar */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>

              {/* Link Esqueci minha senha */}
              <div className="text-center">
                <a
                  href="/recuperar-senha"
                  className="text-sm text-primary hover:underline"
                >
                  Esqueci minha senha
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
