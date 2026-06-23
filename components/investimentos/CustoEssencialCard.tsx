"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"
import { toast } from "sonner"

import { definirCustoVidaEssencial } from "@/app/actions/subcontas"
import { formatarMoeda } from "@/lib/calculations"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CustoEssencialCardProps {
  subcontaId: string
  /** Valor atual do custo essencial (null = não informado). */
  custoAtual: number | null
}

/**
 * Converte um valor BR (vírgula decimal, ponto de milhar) para `number`.
 * Retorna `NaN` se vazio/inválido.
 */
function parseValorBR(input: string): number {
  const limpo = input.trim().replace(/\s|R\$/g, "")
  if (!limpo) return NaN
  const normalizado = limpo.includes(",")
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo
  return Number(normalizado)
}

/** Valor inicial do input em formato BR (vírgula decimal). */
function valorInicial(valor: number | null): string {
  if (!valor) return ""
  return valor.toString().replace(".", ",")
}

/**
 * **Custo de vida essencial** (Spec 26 · RF-5/RF-6) — campo manual que define a
 * base da meta de reserva (6×), com um mini-texto orientando o que conta como
 * gasto essencial. Editar grava via `definirCustoVidaEssencial`; campo vazio
 * limpa o valor (meta volta a 0).
 */
export function CustoEssencialCard({ subcontaId, custoAtual }: CustoEssencialCardProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [valor, setValor] = React.useState("")
  const [enviando, setEnviando] = React.useState(false)

  function aoAlternar(aberto: boolean) {
    setOpen(aberto)
    if (aberto) setValor(valorInicial(custoAtual))
  }

  async function onSubmit() {
    const bruto = valor.trim()
    // Vazio = limpar (null → meta 0).
    let payload: number | null = null
    if (bruto) {
      const numero = parseValorBR(bruto)
      if (!Number.isFinite(numero) || numero < 0) {
        toast.error("Informe um valor válido (≥ 0).")
        return
      }
      payload = numero
    }
    setEnviando(true)
    try {
      await definirCustoVidaEssencial(subcontaId, payload)
      toast.success("Custo essencial atualizado.")
      setOpen(false)
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível salvar o custo essencial."
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-2 rounded-md border border-dashed border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">Custo de vida essencial</span>
        <Dialog open={open} onOpenChange={aoAlternar}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-auto gap-1 px-1 py-0 text-xs">
              <Pencil className="size-3" />
              {custoAtual ? formatarMoeda(custoAtual) : "Informar"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Custo de vida essencial</DialogTitle>
              <DialogDescription>
                Valor mensal só com o essencial. A meta da reserva é 6× esse
                valor. Deixe vazio para não calcular a meta.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="custo-essencial">Valor mensal</Label>
              <Input
                id="custo-essencial"
                inputMode="decimal"
                placeholder="0,00"
                autoFocus
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    onSubmit()
                  }
                }}
              />
            </div>

            <DialogFooter>
              <Button type="button" onClick={onSubmit} disabled={enviando}>
                {enviando ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mini-texto orientativo (RF-6): o que conta e o que não conta. */}
      <p className="text-xs leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Conta:</span> moradia,
        alimentação, transporte essencial e contas básicas (água, luz, gás,
        internet).{" "}
        <span className="font-medium text-foreground">Não conta:</span> lazer,
        restaurantes, assinaturas supérfluas e compras não essenciais.
      </p>
    </div>
  )
}
