'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

export default function AguardandoAprovacaoPage() {
  const router = useRouter()

  const handleSair = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Noviq Finance</h1>
          <p className="text-muted-foreground mt-2">Controle financeiro inteligente</p>
        </div>

        {/* Card de Aguardando Aprovação */}
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 rounded-full p-4">
                <Clock className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Conta em análise</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Sua solicitação de cadastro foi recebida com sucesso.
            </p>
            <p className="text-muted-foreground">
              Nossa equipe irá analisar seu perfil e liberar seu acesso em breve.
            </p>
            <p className="text-sm text-muted-foreground">
              Você receberá uma confirmação por e-mail assim que sua conta for aprovada.
            </p>

            {/* Botão Sair */}
            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSair}
              >
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
