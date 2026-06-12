'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function CadastroPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validações
    if (!nome || !email || !senha || !confirmarSenha) {
      setError('Todos os campos são obrigatórios.')
      setLoading(false)
      return
    }

    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      setLoading(false)
      return
    }

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Criar usuário no Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome: nome,
          },
        },
      })

      if (signUpError) {
        // Verificar se é erro de e-mail já cadastrado
        if (signUpError.message.includes('already')) {
          setError('Este e-mail já está cadastrado. Faça login ou use outro e-mail.')
        } else {
          setError(signUpError.message)
        }
        return
      }

      // O usuário pode precisar confirmar o e-mail
      // Inserir o perfil usando o id retornado
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            nome: nome,
            tipo_perfil: 'educador',
            status: 'pendente',
          })

        if (profileError) {
          console.error('Profile error:', profileError)
          // Se o perfil já existe (upsert)
          await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              nome: nome,
              tipo_perfil: 'educador',
              status: 'pendente',
            })
        }

        router.push('/aguardando-aprovacao')
      } else {
        // E-mail de confirmação enviado
        router.push('/aguardando-aprovacao')
      }
    } catch (err) {
      console.error('Cadastro error:', err)
      setError('Erro ao criar conta. Tente novamente.')
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

        {/* Card de Cadastro */}
        <Card>
          <CardHeader>
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>
              Cadastre-se para começar a usar o Noviq Finance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCadastro} className="space-y-4">
              {/* Campo Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

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
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
              </div>

              {/* Campo Confirmar Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar senha</Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  placeholder="••••••••"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Botão Criar Conta */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Button>

              {/* Link Já tem conta */}
              <div className="text-center">
                <a
                  href="/login"
                  className="text-sm text-primary hover:underline"
                >
                  Já tem conta? Entrar
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
