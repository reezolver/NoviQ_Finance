"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import {
  criarPatrimonio,
  editarPatrimonio,
  type CriarPatrimonioInput,
  type EditarPatrimonioInput,
} from "@/app/actions/patrimonio"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CATEGORIAS_INVESTIMENTO,
  CATEGORIA_INVESTIMENTO_LABEL,
  FINALIDADE_LABEL,
  TIPO_PATRIMONIO_LABEL,
  type CategoriaInvestimento,
  type FinalidadePatrimonio,
  type TipoPatrimonio,
} from "@/components/investimentos/labels"

/** Valores de um ativo existente, para o modo edição. */
export interface PatrimonioExistente {
  id: string
  tipo: TipoPatrimonio
  descricao: string
  valor: number
  rentabilidade: number
  categoriaInvestimento: CategoriaInvestimento | null
  finalidade: FinalidadePatrimonio | null
}

interface PatrimonioModalProps {
  subcontaId: string
  /** Quando presente, abre em modo edição daquele ativo. */
  ativo?: PatrimonioExistente
  /** Gatilho customizado. Se ausente, usa o botão "Adicionar ativo" padrão. */
  trigger?: React.ReactNode
  /** Abertura controlada (opcional). */
  open?: boolean
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

const TIPOS: TipoPatrimonio[] = ["investimento", "imovel", "veiculo"]
const FINALIDADES: FinalidadePatrimonio[] = ["reserva", "patrimonio"]
const SEM_FINALIDADE = "__nenhuma__"

// ─── Schema do formulário (client) ────────────────────────────────────────────

const formSchema = z
  .object({
    tipo: z.enum(["imovel", "veiculo", "investimento"]),
    descricao: z.string().trim().min(1, "Informe uma descrição."),
    valor: z.string().min(1, "Informe o valor."),
    rentabilidade: z.string().optional(),
    categoriaInvestimento: z
      .enum(["renda_fixa", "renda_variavel", "multimercado"])
      .optional(),
    finalidade: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    const valor = parseValorBR(val.valor)
    if (!Number.isFinite(valor) || valor < 0) {
      ctx.addIssue({
        code: "custom",
        path: ["valor"],
        message: "O valor não pode ser negativo.",
      })
    }
    if (val.rentabilidade && val.rentabilidade.trim()) {
      const rent = parseValorBR(val.rentabilidade)
      if (!Number.isFinite(rent) || rent < 0) {
        ctx.addIssue({
          code: "custom",
          path: ["rentabilidade"],
          message: "A rentabilidade não pode ser negativa.",
        })
      }
    }
    if (val.tipo === "investimento" && !val.categoriaInvestimento) {
      ctx.addIssue({
        code: "custom",
        path: ["categoriaInvestimento"],
        message: "Selecione a categoria.",
      })
    }
  })

type FormValues = z.infer<typeof formSchema>

/**
 * **Modal de ativo** (Spec 09) — cria ou edita uma linha de `patrimonio`: tipo,
 * descrição, valor, rentabilidade, categoria de investimento e finalidade
 * (reserva × patrimônio). Total aplicado e derivados (PL, reserva) são
 * calculados no servidor — não aparecem aqui.
 */
export function PatrimonioModal({
  subcontaId,
  ativo,
  trigger,
  open: openControlado,
  onOpenChange,
}: PatrimonioModalProps) {
  const router = useRouter()
  const editando = ativo !== undefined
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
      tipo: ativo?.tipo ?? "investimento",
      descricao: ativo?.descricao ?? "",
      valor: ativo ? String(ativo.valor) : "",
      rentabilidade:
        ativo && ativo.rentabilidade > 0 ? String(ativo.rentabilidade) : "",
      categoriaInvestimento: ativo?.categoriaInvestimento ?? undefined,
      finalidade: ativo?.finalidade ?? SEM_FINALIDADE,
    }),
    [ativo]
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: valoresIniciais(),
  })

  const tipoSelecionado = form.watch("tipo")

  async function onSubmit(values: FormValues) {
    const rentabilidadeNum = values.rentabilidade?.trim()
      ? parseValorBR(values.rentabilidade)
      : undefined
    const finalidade =
      values.finalidade && values.finalidade !== SEM_FINALIDADE
        ? (values.finalidade as FinalidadePatrimonio)
        : null
    const categoria =
      values.tipo === "investimento"
        ? values.categoriaInvestimento ?? null
        : null

    setEnviando(true)
    try {
      const payload: CriarPatrimonioInput & EditarPatrimonioInput = {
        tipo: values.tipo,
        descricao: values.descricao.trim(),
        valor: parseValorBR(values.valor),
        rentabilidade: rentabilidadeNum ?? 0,
        categoriaInvestimento: categoria,
        finalidade,
      }
      if (editando) {
        await editarPatrimonio(subcontaId, ativo.id, payload)
        toast.success("Ativo atualizado.")
      } else {
        await criarPatrimonio(subcontaId, payload)
        toast.success("Ativo adicionado.")
      }
      setOpen(false)
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível salvar o ativo."
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
              Adicionar ativo
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar ativo" : "Novo ativo"}</DialogTitle>
          <DialogDescription>
            {editando
              ? "Atualize os dados deste ativo da carteira."
              : "Adicione um ativo à carteira: tipo, valor e finalidade."}
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIPOS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {TIPO_PATRIMONIO_LABEL[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Tesouro Selic 2029" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input inputMode="decimal" placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rentabilidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Rentabilidade{" "}
                      <span className="font-normal text-muted-foreground">
                        (opcional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input inputMode="decimal" placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {tipoSelecionado === "investimento" && (
              <FormField
                control={form.control}
                name="categoriaInvestimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIAS_INVESTIMENTO.map((c) => (
                          <SelectItem key={c} value={c}>
                            {CATEGORIA_INVESTIMENTO_LABEL[c]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="finalidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Finalidade</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a finalidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={SEM_FINALIDADE}>Não classificar</SelectItem>
                      {FINALIDADES.map((f) => (
                        <SelectItem key={f} value={f}>
                          {FINALIDADE_LABEL[f]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    : "Adicionar ativo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
