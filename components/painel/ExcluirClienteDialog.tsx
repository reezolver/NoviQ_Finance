"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { excluirCliente } from "@/app/actions/subcontas"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type Modo = "temporario" | "permanente"

/**
 * **Diálogo de excluir cliente** (Spec 21 · RF-5.1 / RF-5c.6) — controlado,
 * aberto pelo item do menu de ações. Oferece as duas modalidades com texto
 * claro e exige **digitar o nome do cliente** (confirmação forte) para liberar
 * o botão. A permissão real vive na action + RLS; aqui é só UX.
 *
 * Vive **fora** do dropdown que o abre (não desmontar ao fechar o menu).
 */
export function ExcluirClienteDialog({
  subcontaId,
  nomeAtual,
  open,
  onOpenChange,
}: {
  subcontaId: string
  nomeAtual: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [modo, setModo] = React.useState<Modo>("temporario")
  const [confirmacao, setConfirmacao] = React.useState("")
  const [enviando, setEnviando] = React.useState(false)

  // Reseta o estado quando o diálogo abre (ou troca de cliente) — ajuste de
  // estado em render, guardado por uma chave, evitando um efeito que dispara
  // setState (padrão recomendado: react.dev/learn/you-might-not-need-an-effect).
  const chave = open ? subcontaId : null
  const chaveAnterior = React.useRef<string | null>(null)
  if (chave !== chaveAnterior.current) {
    chaveAnterior.current = chave
    if (open) {
      setModo("temporario")
      setConfirmacao("")
    }
  }

  const nomeConfere =
    confirmacao.trim().toLowerCase() === nomeAtual.trim().toLowerCase()

  async function excluir() {
    if (!nomeConfere || enviando) return
    setEnviando(true)
    try {
      await excluirCliente(subcontaId, modo)
      toast.success(
        modo === "temporario"
          ? "Cliente movido para a lixeira."
          : "Cliente excluído permanentemente."
      )
      onOpenChange(false)
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível excluir o cliente."
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir {nomeAtual}</DialogTitle>
          <DialogDescription>
            Escolha como excluir esta conta de cliente. Esta ação afeta os dados
            e o login do cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup
            value={modo}
            onValueChange={(v) => setModo(v as Modo)}
            className="gap-3"
          >
            <Label
              htmlFor="modo-temporario"
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5"
            >
              <RadioGroupItem
                id="modo-temporario"
                value="temporario"
                className="mt-0.5"
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium">Temporária</span>
                <span className="block text-sm text-muted-foreground">
                  Recuperável por 90 dias, depois apagada para sempre. O login do
                  cliente é suspenso na hora.
                </span>
              </span>
            </Label>

            <Label
              htmlFor="modo-permanente"
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[[data-checked]]:border-destructive has-[[data-checked]]:bg-destructive/5"
            >
              <RadioGroupItem
                id="modo-permanente"
                value="permanente"
                className="mt-0.5"
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium">Permanente</span>
                <span className="block text-sm text-muted-foreground">
                  Apaga agora os dados e o login, sem volta.
                </span>
              </span>
            </Label>
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="confirma-nome" className="text-sm">
              Digite <span className="font-semibold">{nomeAtual}</span> para
              confirmar
            </Label>
            <Input
              id="confirma-nome"
              autoComplete="off"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              placeholder={nomeAtual}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={enviando}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void excluir()}
            disabled={!nomeConfere || enviando}
          >
            {enviando
              ? "Excluindo…"
              : modo === "temporario"
                ? "Mover para a lixeira"
                : "Excluir para sempre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
