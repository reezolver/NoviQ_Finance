'use client'

import { useState } from 'react'
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

/**
 * Recuperação de senha. Dispara o e-mail de redefinição apontando o `redirectTo`
 * para o callback com `next=/nova-senha`. Após enviar, mostra mensagem neutra
 * (não revela quais e-mails têm conta).
 */
export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/callback?next=/nova-senha`,
      })

      if (resetError) {
        setError('Não foi possível enviar o e-mail. Tente novamente.')
        setLoading(false)
        return
      }

      setEnviado(true)
    } catch {
      setError('Erro ao enviar o e-mail. Tente novamente.')
    } finally {
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
            <CardTitle>Recuperar senha</CardTitle>
            <CardDescription>
              Informe seu e-mail e enviaremos um link para redefinir a senha
            </CardDescription>
          </CardHeader>
          <CardContent>
            {enviado ? (
              <div className="space-y-6">
                <Alert>
                  <AlertDescription>
                    Se este e-mail tiver conta, enviamos um link para redefinir a senha.
                  </AlertDescription>
                </Alert>
                <p className="text-center text-sm text-muted-foreground">
                  <Link href="/login" className="text-primary hover:underline">
                    Voltar para o login
                  </Link>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar link'}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  <Link href="/login" className="text-primary hover:underline">
                    Voltar para o login
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
