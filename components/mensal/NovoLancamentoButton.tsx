"use client"

import {
  LancamentoModal,
  type CategoriaOption,
  type ObjetivoOption,
} from "@/components/lancamento/LancamentoModal"

/**
 * Botão **"Novo lançamento"** — pluga o {@link LancamentoModal} (Spec 05) na
 * tela mensal. Recebe do Server Component a subconta + categorias + objetivos
 * (já escopados por RLS) para alimentar as abas Despesa / Receita / Objetivo.
 */
export function NovoLancamentoButton({
  subcontaId,
  categorias,
  objetivos,
}: {
  subcontaId: string
  categorias: CategoriaOption[]
  objetivos: ObjetivoOption[]
}) {
  return (
    <LancamentoModal
      subcontaId={subcontaId}
      categorias={categorias}
      objetivos={objetivos}
    />
  )
}
