"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import {
  criarDivida,
  editarDivida,
  type CriarDividaInput,
  type EditarDividaInput,
} from "@/app/actions/dividas"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

/** Valores de uma dívida existente, para o modo edição. */
export interface DividaExistente {
  id: string
  tipo: string
  valorTotal: number
}

interface DividaModalProps {
  subcontaId: string
  divida?: DividaExistente
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (aberto: boolean) => void
}

/** Converte valor BR (vírgula decimal) para `number`; `NaN` se vazio/inválido. */
function parseValorBR(input: string): number {
  const limpo = input.trim().replace(/\s|R\$/g, "")
  if (!limpo) return NaN
  const normalizado = limpo.includes(",")
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo
  return Number(normalizado)
}

const formSchema = z
  .object({
    tipo: z.string().trim().min(1, "Informe o tipo da dívida."),
    valorTotal: z.string().min(1, "Informe o valor total."),
  })
  .superRefine((val, ctx) => {
    const total = parseValorBR(val.valorTotal)
    if (!Number.isFinite(total) || total < 0) {
      ctx.addIssue({
        code: "custom",
        path: ["valorTotal"],
        message: "O valor não pode ser negativo.",
      })
    }
  })

type FormValues = z.infer<typeof formSchema>

/**
 * **Modal de dívida** (Spec 09) — cria ou edita uma linha de `dividas` (tipo e
 * valor total). O `valor_total` entra no Patrimônio Líquido (`Σ patrimônio − Σ
 * dívidas`), calculado no servidor.
 */
export function DividaModal({
  subcontaId,
  divida,
  trigger,
  open: openControlado,
  onOpenChange,
}: DividaModalProps) {
  const router = useRouter()
  const editando = divida !== undefined
  const [openInterno, setOpenInterno] = React.useState(false)
  const [enviando, setEnviando] = React.useState(false)

  const controlado = openControlado !== undefined
  const open = controlado ? openControlado : openInterno
  const setOpen = React.useCallback(
    (aberto: boolean) => {
      if (!controlado) setOpenInterno(aberto)
      onOpenChange?.(aberto)
    },
    [controlado, onOpenChange]
  )

  const valoresIniciais = React.useCallback(
    (): FormValues => ({
      tipo: divida?.tipo ?? "",
      valorTotal: divida ? String(divida.valorTotal) : "",
    }),
    [divida]
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: valoresIniciais(),
  })

  async function onSubmit(values: FormValues) {
    setEnviando(true)
    try {
      const payload: CriarDividaInput & EditarDividaInput = {
        tipo: values.tipo.trim(),
        valorTotal: parseValorBR(values.valorTotal),
      }
      if (editando) {
        await editarDivida(subcontaId, divida.id, payload)
        toast.success("Dívida atualizada.")
      } else {
        await criarDivida(subcontaId, payload)
        toast.success("Dívida adicionada.")
      }
      setOpen(false)
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível salvar a dívida."
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(aberto) => {
        setOpen(aberto)
        if (!aberto) form.reset(valoresIniciais())
      }}
    >
      {!controlado && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button variant="outline" size="sm">
              <Plus />
              Adicionar dívida
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar dívida" : "Nova dívida"}</DialogTitle>
          <DialogDescription>
            {editando
              ? "Atualize os dados desta dívida."
              : "Adicione uma dívida — ela reduz o patrimônio líquido."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Financiamento do carro" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valorTotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor total</FormLabel>
                  <FormControl>
                    <Input inputMode="decimal" placeholder="0,00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={enviando}>
                {enviando
                  ? "Salvando…"
                  : editando
                    ? "Salvar alterações"
                    : "Adicionar dívida"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
