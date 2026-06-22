"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User } from "lucide-react"
import { toast } from "sonner"

import { criarSubconta } from "@/app/actions/subcontas"
import { Button } from "@/components/ui/button"

/**
 * Acesso à **conta pessoal do gestor** (Spec 07). Se já existe, vira um link
 * para o workspace da própria subconta `pessoal`. Se ainda não existe, cria-a
 * sob demanda (`criarSubconta('pessoal', …)`) e navega para ela.
 *
 * A conta pessoal não tem login próprio (`owner_user_id = gestor_id`) — é só
 * mais um contexto de workspace do gestor.
 */
export function ContaPessoalButton({
  pessoalId,
  nomeSugerido,
}: {
  pessoalId: string | null
  nomeSugerido: string
}) {
  const router = useRouter()
  const [criando, setCriando] = React.useState(false)

  if (pessoalId) {
    return (
      <Button asChild variant="outline">
        <Link href={`/${pessoalId}/controle-anual`}>
          <User />
          Minha conta pessoal
        </Link>
      </Button>
    )
  }

  async function criar() {
    setCriando(true)
    try {
      const { subconta } = await criarSubconta("pessoal", nomeSugerido)
      toast.success("Conta pessoal criada.")
      router.push(`/${subconta.id}/controle-anual`)
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível criar a conta pessoal."
      )
      setCriando(false)
    }
  }

  return (
    <Button variant="outline" disabled={criando} onClick={() => void criar()}>
      <User />
      {criando ? "Criando…" : "Criar conta pessoal"}
    </Button>
  )
}
