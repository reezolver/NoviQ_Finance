'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

const schema = z
  .object({
    senha: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres'),
    confirmar: z.string(),
  })
  .refine((d) => d.senha === d.confirmar, {
    message: 'As senhas não conferem',
    path: ['confirmar'],
  })

type FormValues = z.infer<typeof schema>

/**
 * Definição da nova senha. Alcançada já com sessão de recuperação (o callback da
 * Spec 14 trocou o `code` e redirecionou para cá via `?next=/nova-senha`). Ao
 * montar, valida que existe sessão; sem ela, orienta a refazer a recuperação.
 */
export default function NovaSenhaPage() {
  const [error, setError] = useState<string | null>(null)
  const [verificandoSessao, setVerificandoSessao] = useState(true)
  const [temSessao, setTemSessao] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    const checar = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setTemSessao(!!session)
      setVerificandoSessao(false)
    }
    checar()
  }, [])

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.senha,
      })

      if (updateError) {
        setError('Não foi possível atualizar a senha. Tente novamente.')
        return
      }

      window.location.assign('/')
    } catch {
      setError('Erro ao atualizar a senha. Tente novamente.')
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
            <CardTitle>Nova senha</CardTitle>
            <CardDescription>Defina uma nova senha para sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            {verificandoSessao ? (
              <p className="text-sm text-muted-foreground">Verificando...</p>
            ) : !temSessao ? (
              <div className="space-y-6">
                <Alert variant="destructive">
                  <AlertDescription>
                    Este link de recuperação expirou ou é inválido. Solicite um novo
                    para redefinir a senha.
                  </AlertDescription>
                </Alert>
                <p className="text-center text-sm text-muted-foreground">
                  <Link href="/recuperar-senha" className="text-primary hover:underline">
                    Refazer recuperação
                  </Link>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="senha">Nova senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    {...register('senha')}
                  />
                  {errors.senha && (
                    <p className="text-sm text-destructive">{errors.senha.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmar">Confirmar nova senha</Label>
                  <Input
                    id="confirmar"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    {...register('confirmar')}
                  />
                  {errors.confirmar && (
                    <p className="text-sm text-destructive">
                      {errors.confirmar.message}
                    </p>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
