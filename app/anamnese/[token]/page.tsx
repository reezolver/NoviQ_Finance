import { CheckCircle2, FileX2 } from "lucide-react"

import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AnamneseForm } from "@/components/anamnese/AnamneseForm"

/**
 * Página **pública** da anamnese (Spec 08) — sem auth (a rota `/anamnese/*` está
 * na lista de públicas do middleware). Valida o `token` no servidor via
 * service-role (o lead nunca lê a tabela diretamente) e decide o estado:
 * formulário, "já enviada" ou "link inválido".
 */
export default async function AnamnesePublicaPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const admin = createSupabaseAdminClient()
  const { data: anamnese } = await admin
    .from("anamneses")
    .select("nome_lead, status")
    .eq("token", token)
    .maybeSingle()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 md:px-6">
        <span className="text-xl font-bold text-primary">Noviq</span>
        <ThemeToggle />
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-2xl p-4 md:p-8">
          {!anamnese ? (
            <EstadoMensagem
              icone={<FileX2 className="size-6 text-destructive" />}
              titulo="Link inválido ou expirado"
              descricao="Confira o link com quem te enviou a anamnese ou peça um novo."
              destaque="destructive"
            />
          ) : anamnese.status === "preenchida" ? (
            <EstadoMensagem
              icone={<CheckCircle2 className="size-6 text-success" />}
              titulo="Anamnese já enviada"
              descricao="Recebemos suas respostas. Seu assessor vai analisá-las antes da reunião. Obrigado!"
              destaque="success"
            />
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Ficha financeira
                </h1>
                <p className="text-sm text-muted-foreground">
                  {anamnese.nome_lead
                    ? `Olá, ${anamnese.nome_lead}! `
                    : ""}
                  Preencha os campos abaixo para que seu assessor monte um
                  panorama completo das suas finanças. Leva poucos minutos.
                </p>
              </div>
              <AnamneseForm token={token} nomeInicial={anamnese.nome_lead ?? ""} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function EstadoMensagem({
  icone,
  titulo,
  descricao,
  destaque,
}: {
  icone: React.ReactNode
  titulo: string
  descricao: string
  destaque: "success" | "destructive"
}) {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div
          className={`mb-2 flex size-12 items-center justify-center rounded-full ${
            destaque === "success" ? "bg-success/10" : "bg-destructive/10"
          }`}
        >
          {icone}
        </div>
        <CardTitle>{titulo}</CardTitle>
        <CardDescription className="max-w-md">{descricao}</CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  )
}
