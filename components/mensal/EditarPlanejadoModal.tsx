"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"
import { toast } from "sonner"

import { definirPlanejado } from "@/app/actions/orcamentos"
import { formatarMoeda, type GrupoCategoria } from "@/lib/calculations"
import { GRUPO_LABEL } from "@/lib/extrato"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { InputMoeda } from "@/components/ui/input-moeda"
import { numeroParaMascara, parseValorBR } from "@/lib/moeda"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

/** Categoria + valor planejado vigente do mês (override OU recorrente herdado). */
export interface CategoriaPlanejada {
  categoriaId: string
  nome: string
  grupo: GrupoCategoria
  /** Planejado vigente do mês (resolvido override × recorrente na page). */
  planejadoVigente: number
}

interface EditarPlanejadoModalProps {
  subcontaId: string
  ano: number
  mes: number
  categorias: CategoriaPlanejada[]
  /** Gatilho customizado. Se ausente, usa o botão "Editar planejado" padrão. */
  trigger?: React.ReactNode
}

/** Ordem de exibição dos grupos no diálogo (mesma do Controle Mensal). */
const ORDEM_GRUPOS: ReadonlyArray<GrupoCategoria> = [
  "renda",
  "fixa",
  "variavel",
  "investimento",
]

/** Valor inicial do input: vazio quando 0, senão já mascarado (Spec 34). */
function valorInicial(valor: number): string {
  if (!valor) return ""
  return numeroParaMascara(valor)
}

/**
 * **Editar planejado do mês** (Spec 23 / RF-1). Lista as categorias agrupadas
 * por grupo (na ordem de `categorias.ordem`, já resolvida na page) com um
 * `Input` de valor por linha, mostrando o **planejado vigente** (override do
 * mês ou recorrente herdado).
 *
 * - Salvar grava **só as categorias que mudaram**, via `definirPlanejado`.
 * - Por padrão grava override daquele mês; com o checkbox "Aplicar a todos os
 *   meses (recorrente)" marcado, grava a linha recorrente.
 * - Reflete na hora com `router.refresh()` + toast `sonner`.
 */
export function EditarPlanejadoModal({
  subcontaId,
  ano,
  mes,
  categorias,
  trigger,
}: EditarPlanejadoModalProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [recorrente, setRecorrente] = React.useState(false)
  const [enviando, setEnviando] = React.useState(false)
  const [valores, setValores] = React.useState<Record<string, string>>({})

  /** (Re)inicializa os inputs com o valor vigente. Chamado ao abrir o diálogo. */
  function inicializar() {
    const inicial: Record<string, string> = {}
    for (const c of categorias) {
      inicial[c.categoriaId] = valorInicial(c.planejadoVigente)
    }
    setValores(inicial)
    setRecorrente(false)
  }

  function aoAlternar(aberto: boolean) {
    setOpen(aberto)
    if (aberto) inicializar()
  }

  // Categorias agrupadas, preservando a ordem recebida (já ordenada por `ordem`).
  const gruposVisiveis = React.useMemo(() => {
    return ORDEM_GRUPOS.map((grupo) => ({
      grupo,
      itens: categorias.filter((c) => c.grupo === grupo),
    })).filter((g) => g.itens.length > 0)
  }, [categorias])

  async function onSubmit() {
    // Só as categorias cujo valor mudou em relação ao vigente.
    const alteradas = categorias.filter((c) => {
      const digitado = parseValorBR(valores[c.categoriaId] ?? "")
      const novo = Number.isFinite(digitado) ? digitado : 0
      return novo !== c.planejadoVigente
    })

    // Valida cada valor alterado (>= 0).
    for (const c of alteradas) {
      const digitado = parseValorBR(valores[c.categoriaId] ?? "")
      const novo = Number.isFinite(digitado) ? digitado : 0
      if (novo < 0) {
        toast.error(`Valor inválido em "${c.nome}".`)
        return
      }
    }

    if (alteradas.length === 0) {
      toast.info("Nenhuma alteração para salvar.")
      setOpen(false)
      return
    }

    setEnviando(true)
    try {
      for (const c of alteradas) {
        const digitado = parseValorBR(valores[c.categoriaId] ?? "")
        const novo = Number.isFinite(digitado) ? digitado : 0
        await definirPlanejado(subcontaId, {
          categoriaId: c.categoriaId,
          valorPlanejado: novo,
          ano,
          mes,
          recorrente,
        })
      }
      toast.success("Planejado atualizado.")
      setOpen(false)
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível salvar o planejado."
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={aoAlternar}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Pencil />
            Editar planejado
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar planejado do mês</DialogTitle>
          <DialogDescription>
            Defina o valor planejado de cada categoria. Por padrão vale só para
            este mês.
          </DialogDescription>
        </DialogHeader>

        {categorias.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma categoria cadastrada para planejar.
          </p>
        ) : (
          <>
            <ScrollArea className="max-h-[50vh] pr-3">
              <div className="space-y-5">
                {gruposVisiveis.map(({ grupo, itens }) => (
                  <div key={grupo} className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {GRUPO_LABEL[grupo]}
                    </p>
                    {itens.map((c) => (
                      <div
                        key={c.categoriaId}
                        className="flex items-center justify-between gap-3"
                      >
                        <Label
                          htmlFor={`planejado-${c.categoriaId}`}
                          className="flex-1 font-normal"
                        >
                          {c.nome}
                          <span className="block text-xs text-muted-foreground">
                            Atual: {formatarMoeda(c.planejadoVigente)}
                          </span>
                        </Label>
                        <InputMoeda
                          id={`planejado-${c.categoriaId}`}
                          className="w-32 text-right"
                          value={valores[c.categoriaId] ?? ""}
                          onChange={(valor) =>
                            setValores((v) => ({
                              ...v,
                              [c.categoriaId]: valor,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex items-start gap-2 rounded-md border p-3">
              <Checkbox
                id="planejado-recorrente"
                checked={recorrente}
                onCheckedChange={(v) => setRecorrente(v === true)}
              />
              <Label
                htmlFor="planejado-recorrente"
                className="font-normal leading-snug"
              >
                Aplicar a todos os meses (recorrente)
                <span className="block text-xs text-muted-foreground">
                  Vale como padrão para os meses sem valor específico.
                </span>
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" onClick={onSubmit} disabled={enviando}>
                {enviando ? "Salvando…" : "Salvar planejado"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
