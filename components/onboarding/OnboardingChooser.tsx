"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, User, Users } from "lucide-react"
import { toast } from "sonner"

import { definirPreferencia } from "@/app/actions/onboarding"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/**
 * Pergunta única do onboarding (Spec 17 · §3.3). Dois cartões grandes que gravam
 * a preferência e navegam para a home correspondente. Roteamento real fica no
 * `middleware`; aqui só empurramos o usuário direto para o destino devolvido pela
 * action (evita um "pulo" pela `/`).
 */
export function OnboardingChooser() {
  const router = useRouter()
  const [pendente, setPendente] = React.useState<"pessoal" | "gestor" | null>(
    null
  )

  async function escolher(pref: "pessoal" | "gestor") {
    setPendente(pref)
    try {
      const { destino } = await definirPreferencia(pref)
      router.replace(destino)
    } catch (erro) {
      toast.error(
        erro instanceof Error
          ? erro.message
          : "Não foi possível salvar sua escolha."
      )
      setPendente(null)
    }
  }

  const carregando = pendente !== null

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Opcao
        icone={<User className="size-6 text-primary" />}
        titulo="Só as minhas finanças"
        descricao="Quero organizar e acompanhar o meu próprio dinheiro."
        ativo={pendente === "pessoal"}
        desabilitado={carregando}
        onClick={() => void escolher("pessoal")}
      />
      <Opcao
        icone={<Users className="size-6 text-primary" />}
        titulo="As minhas e as de outros clientes"
        descricao="Quero também gerenciar as finanças de clientes que acompanho."
        ativo={pendente === "gestor"}
        desabilitado={carregando}
        onClick={() => void escolher("gestor")}
      />
    </div>
  )
}

function Opcao({
  icone,
  titulo,
  descricao,
  ativo,
  desabilitado,
  onClick,
}: {
  icone: React.ReactNode
  titulo: string
  descricao: string
  ativo: boolean
  desabilitado: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitado}
      aria-busy={ativo}
      className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl disabled:cursor-not-allowed"
    >
      <Card className="h-full transition-colors hover:border-primary aria-busy:border-primary data-[ativo=true]:border-primary">
        <CardHeader>
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            {icone}
          </div>
          <CardTitle className="text-lg">{titulo}</CardTitle>
          <CardDescription>{descricao}</CardDescription>
        </CardHeader>
        <CardContent>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            {ativo ? "Salvando…" : "Escolher"}
            {!ativo && <ArrowRight className="size-4" />}
          </span>
        </CardContent>
      </Card>
    </button>
  )
}
