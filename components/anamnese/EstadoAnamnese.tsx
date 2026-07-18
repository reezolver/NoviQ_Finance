import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/**
 * Estado de página da anamnese pública (link inválido / já enviada / enviada
 * com sucesso). Presentational e sem hooks — a página (Server Component) e o
 * formulário (client) renderizam o **mesmo** componente, então o lead vê a
 * mesma tela quer o link já chegue preenchido, quer o 409 apareça só na
 * submissão (Spec 29 R4).
 *
 * Tokens do design system → dark + light.
 */
export function EstadoAnamnese({
  icone,
  titulo,
  descricao,
  destaque,
}: {
  icone: ReactNode
  titulo: string
  descricao: string
  /** `success` para estado esperado; `destructive` só para erro de verdade. */
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

/**
 * Texto único do link de uso único (R4). Um link já preenchido é comportamento
 * **correto** do produto, não falha — por isso vira estado, nunca toast
 * vermelho.
 */
export const TEXTO_JA_ENVIADA = {
  titulo: "Esta ficha já foi enviada",
  descricao:
    "Esta ficha já foi enviada e não pode ser preenchida de novo. Peça um novo link ao seu assessor.",
} as const
