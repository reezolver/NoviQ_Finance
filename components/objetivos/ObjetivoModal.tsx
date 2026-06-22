"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import {
  criarObjetivo,
  editarObjetivo,
  type CriarObjetivoInput,
  type EditarObjetivoInput,
} from "@/app/actions/objetivos"
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

/** Valores de um objetivo existente, para o modo edição. */
export interface ObjetivoExistente {
  id: string
  nome: string
  valorAlvo: number
  dataLimite: string
  valorInicial: number
}

interface ObjetivoModalProps {
  subcontaId: string
  /** Quando presente, o modal abre em modo edição daquele objetivo. */
  objetivo?: ObjetivoExistente
  /** Gatilho customizado. Se ausente, usa o botão "Novo objetivo" padrão. */
  trigger?: React.ReactNode
  /** Abertura controlada (opcional). Se ausente, o modal controla seu estado. */
  open?: boolean
  /** Callback de mudança de abertura no modo controlado. */
  onOpenChange?: (aberto: boolean) => void
}

/**
 * Converte um valor digitado no padrão BR (vírgula decimal, ponto de milhar)
 * para `number`. Retorna `NaN` se vazio/inválido. Aceita também ponto decimal.
 */
function parseValorBR(input: string): number {
  const limpo = input.trim().replace(/\s|R\$/g, "")
  if (!limpo) return NaN
  const normalizado = limpo.includes(",")
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo
  return Number(normalizado)
}

// ─── Schema do formulário (client) ────────────────────────────────────────────

const formSchema = z
  .object({
    nome: z.string().trim().min(1, "Informe o nome do objetivo."),
    valorAlvo: z.string().min(1, "Informe o valor alvo."),
    dataLimite: z.string().min(1, "Informe a data limite."),
    valorInicial: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    const alvo = parseValorBR(val.valorAlvo)
    if (!Number.isFinite(alvo) || alvo <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["valorAlvo"],
        message: "O valor alvo deve ser maior que zero.",
      })
    }
    if (val.valorInicial && val.valorInicial.trim()) {
      const inicial = parseValorBR(val.valorInicial)
      if (!Number.isFinite(inicial) || inicial < 0) {
        ctx.addIssue({
          code: "custom",
          path: ["valorInicial"],
          message: "O valor inicial não pode ser negativo.",
        })
      }
    }
  })

type FormValues = z.infer<typeof formSchema>

/**
 * **Modal de objetivo** (Spec 06) — cria ou edita uma meta (nome, valor alvo,
 * data limite e um valor inicial opcional). O acumulado e o progresso são
 * derivados no servidor (`valor_inicial + Σ lançamentos do tipo objetivo`), por
 * isso não aparecem aqui.
 *
 * Salva via Server Action `criarObjetivo` / `editarObjetivo`; reflete na hora
 * com `router.refresh()` (a tela de objetivos é Server Component) + toast.
 */
export function ObjetivoModal({
  subcontaId,
  objetivo,
  trigger,
  open: openControlado,
  onOpenChange,
}: ObjetivoModalProps) {
  const router = useRouter()
  const editando = objetivo !== undefined
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
      nome: objetivo?.nome ?? "",
      valorAlvo: objetivo ? String(objetivo.valorAlvo) : "",
      dataLimite: objetivo?.dataLimite ?? "",
      valorInicial:
        objetivo && objetivo.valorInicial > 0 ? String(objetivo.valorInicial) : "",
    }),
    [objetivo]
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: valoresIniciais(),
  })

  async function onSubmit(values: FormValues) {
    const valorInicialNum = values.valorInicial?.trim()
      ? parseValorBR(values.valorInicial)
      : undefined

    setEnviando(true)
    try {
      if (editando) {
        const payload: EditarObjetivoInput = {
          nome: values.nome.trim(),
          valorAlvo: parseValorBR(values.valorAlvo),
          dataLimite: values.dataLimite,
          valorInicial: valorInicialNum ?? 0,
        }
        await editarObjetivo(subcontaId, objetivo.id, payload)
        toast.success("Objetivo atualizado.")
      } else {
        const payload: CriarObjetivoInput = {
          nome: values.nome.trim(),
          valorAlvo: parseValorBR(values.valorAlvo),
          dataLimite: values.dataLimite,
          valorInicial: valorInicialNum,
        }
        await criarObjetivo(subcontaId, payload)
        toast.success("Objetivo criado.")
      }
      setOpen(false)
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível salvar o objetivo."
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
            <Button>
              <Plus />
              Novo objetivo
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar objetivo" : "Novo objetivo"}</DialogTitle>
          <DialogDescription>
            {editando
              ? "Atualize os dados da sua meta financeira."
              : "Defina uma meta: nome, valor alvo e até quando atingi-la."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Casamento" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valorAlvo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor alvo</FormLabel>
                  <FormControl>
                    <Input inputMode="decimal" placeholder="0,00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataLimite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data limite</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valorInicial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Valor inicial{" "}
                    <span className="font-normal text-muted-foreground">(opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input inputMode="decimal" placeholder="0,00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={enviando}>
                {enviando ? "Salvando…" : editando ? "Salvar alterações" : "Criar objetivo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
