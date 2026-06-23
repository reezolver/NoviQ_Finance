"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"
import { toast } from "sonner"

import { definirSaldoInicial } from "@/app/actions/subcontas"
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

interface SaldoInicialDialogProps {
  subcontaId: string
  /** Valor atual do saldo inicial (pré-preenche o input). */
  saldoInicial: number
}

/**
 * Converte um valor BR (vírgula decimal, ponto de milhar) para `number`.
 * Aceita negativo. Retorna `NaN` se vazio/inválido.
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
function valorInicial(valor: number): string {
  if (!valor) return ""
  return valor.toString().replace(".", ",")
}

/**
 * **Saldo inicial** da conta (Spec 25 · Q3) — controle discreto perto do card
 * "Saldo em conta" no Controle Mensal. Edita `subcontas.saldo_inicial` (base do
 * acumulado), aceita negativo. Salva via `definirSaldoInicial` + `router.refresh()`.
 */
export function SaldoInicialDialog({ subcontaId, saldoInicial }: SaldoInicialDialogProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [valor, setValor] = React.useState("")
  const [enviando, setEnviando] = React.useState(false)

  function aoAlternar(aberto: boolean) {
    setOpen(aberto)
    if (aberto) setValor(valorInicial(saldoInicial))
  }

  async function onSubmit() {
    const numero = parseValorBR(valor)
    if (!Number.isFinite(numero)) {
      toast.error("Informe um valor válido.")
      return
    }
    setEnviando(true)
    try {
      await definirSaldoInicial(subcontaId, numero)
      toast.success("Saldo inicial atualizado.")
      setOpen(false)
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível salvar o saldo inicial."
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={aoAlternar}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto gap-1 px-1 py-0 text-xs text-muted-foreground hover:text-foreground"
        >
          <Pencil className="size-3" />
          Saldo inicial: {formatarMoeda(saldoInicial)}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Saldo inicial da conta</DialogTitle>
          <DialogDescription>
            Saldo de partida antes do primeiro mês com lançamentos. É a base do
            &ldquo;Saldo em conta&rdquo; acumulado. Aceita valor negativo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="saldo-inicial">Valor</Label>
          <Input
            id="saldo-inicial"
            inputMode="text"
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
  )
}
