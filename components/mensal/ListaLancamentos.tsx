"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { removerLancamento } from "@/app/actions/lancamentos"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatarMoeda } from "@/lib/calculations"
import type { LancamentoDetalhe } from "@/lib/extrato"

/**
 * Lista de **lançamentos individuais** de uma linha, com editar e excluir
 * (Spec 37 · RF‑9).
 *
 * ⚠️ Recebe uma lista genérica de lançamentos, **não** algo acoplado a
 * "categoria": a Spec 38 reusa este mesmo componente para as despesas do cartão
 * (R7). Por isso nada aqui menciona categoria.
 *
 * Os dados já vêm no payload do mês — expandir não dispara query nova (R8).
 */
export function ListaLancamentos({
  subcontaId,
  lancamentos,
  onEditar,
}: {
  subcontaId: string
  lancamentos: ReadonlyArray<LancamentoDetalhe>
  /** Abre o modal de lançamento em modo edição. */
  onEditar: (lancamento: LancamentoDetalhe) => void
}) {
  const router = useRouter()
  const [aExcluir, setAExcluir] = React.useState<LancamentoDetalhe | null>(null)
  const [excluindo, setExcluindo] = React.useState(false)

  async function confirmarExclusao() {
    if (!aExcluir) return
    setExcluindo(true)
    try {
      await removerLancamento(subcontaId, aExcluir.id)
      setAExcluir(null)
      // Atualiza linha, total do bloco, saldo, 50‑30‑20 e detalhamento (R5).
      router.refresh()
      toast.success("Lançamento excluído.")
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível excluir."
      )
    } finally {
      setExcluindo(false)
    }
  }

  if (lancamentos.length === 0) {
    return (
      <p className="px-3 py-2 text-sm text-muted-foreground">
        Nenhum lançamento neste mês — só o valor planejado.
      </p>
    )
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {lancamentos.map((l) => (
          <li
            key={l.id}
            className="flex items-center gap-2 py-1.5 pl-3 pr-1 text-sm"
          >
            <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
              {l.data.slice(8, 10)}/{l.data.slice(5, 7)}
            </span>
            <span className="min-w-0 flex-1 truncate">
              {l.descricao || <span className="text-muted-foreground">Sem descrição</span>}
            </span>
            <span className="shrink-0 font-mono tabular-nums">
              {formatarMoeda(l.valor)}
            </span>
            {/* Alvo de toque ≥44px e espaçados, para não errar no celular (R9). */}
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 md:size-8"
                aria-label={`Editar lançamento de ${formatarMoeda(l.valor)}`}
                onClick={() => onEditar(l)}
              >
                <Pencil />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 text-muted-foreground md:size-8"
                aria-label={`Excluir lançamento de ${formatarMoeda(l.valor)}`}
                onClick={() => setAExcluir(l)}
              >
                <Trash2 />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {/* R2: dado financeiro não se apaga com um toque só. */}
      <Dialog open={aExcluir !== null} onOpenChange={(o) => !o && setAExcluir(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir lançamento?</DialogTitle>
            <DialogDescription>
              {aExcluir
                ? `${aExcluir.descricao || "Lançamento"} de ${formatarMoeda(
                    aExcluir.valor
                  )} em ${aExcluir.data.slice(8, 10)}/${aExcluir.data.slice(5, 7)}. Os totais do mês serão recalculados.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAExcluir(null)}
              disabled={excluindo}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmarExclusao}
              disabled={excluindo}
            >
              {excluindo ? "Excluindo…" : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
