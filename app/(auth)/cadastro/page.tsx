'use client'

import { useState } from 'react'
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
import { Separator } from '@/components/ui/separator'
import { GoogleButton } from '@/components/auth/GoogleButton'

const schema = z
  .object({
    nome: z.string().min(1, 'Informe seu nome'),
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres'),
    confirmar: z.string(),
  })
  .refine((d) => d.senha === d.confirmar, {
    message: 'As senhas não conferem',
    path: ['confirmar'],
  })

type FormValues = z.infer<typeof schema>

/**
 * Tela de cadastro. Cria a conta via `signUp`; com confirmação de e-mail
 * desligada (§8.4), a sessão já volta na resposta → recarrega para `/` e deixa o
 * middleware rotear (onboarding/painel). A guarda `if (!data.session)` cobre o
 * caso de a confirmação ser religada no futuro.
 */
export default function CadastroPage() {
  const [error, setError] = useState<string | null>(null)
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.senha,
        options: { data: { nome: values.nome } },
      })

      if (signUpError) {
        setError('Não foi possível criar a conta. Tente novamente.')
        return
      }

      // Guarda defensiva: se a confirmação de e-mail estiver ligada, não há sessão.
      if (!data.session) {
        setAguardandoConfirmacao(true)
        return
      }

      window.location.assign('/')
    } catch {
      setError('Erro ao criar conta. Tente novamente.')
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
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>
              Preencha seus dados para começar a usar a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {aguardandoConfirmacao ? (
              <Alert>
                <AlertDescription>
                  Confirme seu e-mail para continuar. Enviamos um link de confirmação
                  para o endereço informado.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      type="text"
                      autoComplete="name"
                      placeholder="Seu nome"
                      disabled={isSubmitting}
                      {...register('nome')}
                    />
                    {errors.nome && (
                      <p className="text-sm text-destructive">{errors.nome.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="seu@email.com"
                      disabled={isSubmitting}
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha</Label>
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
                    <Label htmlFor="confirmar">Confirmar senha</Label>
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
                    {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                  </Button>
                </form>

                <div className="my-6 flex items-center gap-4">
                  <Separator className="flex-1" />
                  <span className="text-sm text-muted-foreground">ou</span>
                  <Separator className="flex-1" />
                </div>

                <GoogleButton label="Cadastrar com Google" />

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Já tem conta?{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    Entrar
                  </Link>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
