"use client"

import {
  EditarPlanejadoModal,
  type CategoriaPlanejada,
} from "@/components/mensal/EditarPlanejadoModal"

/**
 * Botão **"Editar planejado"** — pluga o {@link EditarPlanejadoModal} (Spec 23)
 * na tela mensal, ao lado do "Novo lançamento". Recebe do Server Component a
 * subconta, o ano/mês da rota e as categorias com o planejado vigente já
 * resolvido (override × recorrente).
 */
export function EditarPlanejadoButton({
  subcontaId,
  ano,
  mes,
  categorias,
}: {
  subcontaId: string
  ano: number
  mes: number
  categorias: CategoriaPlanejada[]
}) {
  return (
    <EditarPlanejadoModal
      subcontaId={subcontaId}
      ano={ano}
      mes={mes}
      categorias={categorias}
    />
  )
}
