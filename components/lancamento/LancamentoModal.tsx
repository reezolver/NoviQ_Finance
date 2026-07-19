"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ChevronDown, Plus } from "lucide-react"
import { toast } from "sonner"

import { criarLancamento, type CriarLancamentoInput } from "@/app/actions/lancamentos"
import { criarCategoria } from "@/app/actions/categorias"
import { GRUPO_LABEL } from "@/components/categorias/grupos"
import type { Database } from "@/types/database"
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
import { InputMoeda } from "@/components/ui/input-moeda"
import { parseValorBR } from "@/lib/moeda"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type GrupoCategoria = Database["public"]["Enums"]["grupo_categoria"]
type TipoLancamento = Database["public"]["Enums"]["tipo_lancamento"]

export interface CategoriaOption {
  id: string
  nome: string
  grupo: GrupoCategoria
}

export interface ObjetivoOption {
  id: string
  nome: string
}

interface LancamentoModalProps {
  subcontaId: string
  categorias: CategoriaOption[]
  objetivos: ObjetivoOption[]
  /** Gatilho customizado. Se ausente, usa o botão "Novo lançamento" padrão. */
  trigger?: React.ReactNode
}

const TABS: ReadonlyArray<{ value: TipoLancamento; label: string }> = [
  { value: "despesa", label: "Despesa" },
  { value: "receita", label: "Receita" },
  { value: "objetivo", label: "Objetivo" },
]

/** Grupos de categoria de uma despesa — também as opções do filtro Fixa/Variável/Investimento. */
const GRUPOS_DESPESA: ReadonlyArray<Extract<GrupoCategoria, "fixa" | "variavel" | "investimento">> =
  ["fixa", "variavel", "investimento"]

/** Data de hoje no formato AAAA-MM-DD (fuso local). */
function hojeISO(): string {
  const agora = new Date()
  const off = agora.getTimezoneOffset()
  return new Date(agora.getTime() - off * 60_000).toISOString().slice(0, 10)
}

// ─── Schema do formulário (client) ───────────────────────────────────────────

const formSchema = z
  .object({
    tipo: z.enum(["despesa", "receita", "objetivo"]),
    valor: z.string().min(1, "Informe o valor."),
    categoriaId: z.string().optional(),
    objetivoId: z.string().optional(),
    // Grupo do aporte (só objetivo) — fixa | variavel (Spec 24).
    grupo: z.enum(["fixa", "variavel"]).optional(),
    // Filtro Fixa/Variável/Investimento da aba Despesa: só restringe a lista de
    // categorias (o grupo real do lançamento vem da categoria escolhida).
    classificacaoDespesa: z.enum(["fixa", "variavel", "investimento"]).optional(),
    data: z.string().min(1, "Informe a data."),
    descricao: z.string().optional(),
    observacao: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    const valor = parseValorBR(val.valor)
    if (!Number.isFinite(valor) || valor <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["valor"],
        message: "O valor deve ser maior que zero.",
      })
    }
    if (val.tipo === "objetivo") {
      if (!val.objetivoId) {
        ctx.addIssue({
          code: "custom",
          path: ["objetivoId"],
          message: "Selecione um objetivo.",
        })
      }
      if (!val.grupo) {
        ctx.addIssue({
          code: "custom",
          path: ["grupo"],
          message: "Classifique como Fixa ou Variável.",
        })
      }
    } else if (!val.categoriaId) {
      ctx.addIssue({
        code: "custom",
        path: ["categoriaId"],
        message: "Selecione uma categoria.",
      })
    }
  })

type FormValues = z.infer<typeof formSchema>

/**
 * **Modal de lançamento rápido** (Spec 05) — a operação mais frequente, com
 * mínimo atrito. Abas = tipo (`despesa` · `receita` · `objetivo`); campos
 * mínimos (Valor, Categoria/Objetivo, Data=hoje). Descrição/observação ficam
 * recolhidas até o usuário expandir. **Sem** campo de cartão/conta (decisão #2).
 *
 * Salva via Server Action `criarLancamento`; reflete na hora com
 * `router.refresh()` (a tela mensal é Server Component) + toast `sonner`.
 */
export function LancamentoModal({
  subcontaId,
  categorias,
  objetivos,
  trigger,
}: LancamentoModalProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [mostrarOpcionais, setMostrarOpcionais] = React.useState(false)
  const [enviando, setEnviando] = React.useState(false)
  const [criandoCategoria, setCriandoCategoria] = React.useState(false)
  const [nomeNovaCategoria, setNomeNovaCategoria] = React.useState("")
  const [salvandoCategoria, setSalvandoCategoria] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: "despesa",
      valor: "",
      categoriaId: "",
      objetivoId: "",
      grupo: undefined,
      classificacaoDespesa: "fixa",
      data: hojeISO(),
      descricao: "",
      observacao: "",
    },
  })

  const tipo = form.watch("tipo")
  const classificacaoDespesa = form.watch("classificacaoDespesa") ?? "fixa"

  const categoriasDaAba = React.useMemo(() => {
    if (tipo === "receita") return categorias.filter((c) => c.grupo === "renda")
    if (tipo === "despesa")
      return categorias.filter((c) => c.grupo === classificacaoDespesa)
    return []
  }, [tipo, categorias, classificacaoDespesa])

  /** Troca de aba = troca de tipo; limpa a seleção dependente do tipo. */
  function trocarTipo(novo: string) {
    const tipoNovo = novo as TipoLancamento
    form.setValue("tipo", tipoNovo)
    form.setValue("categoriaId", "")
    form.setValue("objetivoId", "")
    form.setValue("grupo", undefined)
    form.clearErrors(["categoriaId", "objetivoId", "grupo"])
  }

  /** Troca do filtro Fixa/Variável/Investimento: limpa a categoria selecionada. */
  function trocarClassificacaoDespesa(novo: string) {
    form.setValue(
      "classificacaoDespesa",
      novo as "fixa" | "variavel" | "investimento"
    )
    form.setValue("categoriaId", "")
    form.clearErrors("categoriaId")
  }

  function resetar() {
    form.reset({
      tipo: "despesa",
      valor: "",
      categoriaId: "",
      objetivoId: "",
      grupo: undefined,
      classificacaoDespesa: "fixa",
      data: hojeISO(),
      descricao: "",
      observacao: "",
    })
    setMostrarOpcionais(false)
    setCriandoCategoria(false)
    setNomeNovaCategoria("")
  }

  /**
   * Cria uma categoria sem sair do modal de lançamento. O grupo é o do contexto
   * atual: o filtro escolhido (despesa) ou `renda` (receita). Em sucesso, atualiza
   * a lista (`router.refresh()`) e já seleciona a categoria recém-criada.
   */
  async function criarCategoriaRapida() {
    const nome = nomeNovaCategoria.trim()
    if (!nome) return
    const grupo = tipo === "receita" ? "renda" : classificacaoDespesa
    setSalvandoCategoria(true)
    try {
      const { id } = await criarCategoria(subcontaId, { nome, grupo })
      toast.success("Categoria criada.")
      form.setValue("categoriaId", id)
      form.clearErrors("categoriaId")
      setCriandoCategoria(false)
      setNomeNovaCategoria("")
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível criar a categoria."
      )
    } finally {
      setSalvandoCategoria(false)
    }
  }

  async function onSubmit(values: FormValues) {
    const valor = parseValorBR(values.valor)
    const base = {
      valor,
      data: values.data,
      descricao: values.descricao?.trim() || undefined,
      observacao: values.observacao?.trim() || undefined,
    }

    let payload: CriarLancamentoInput
    if (values.tipo === "objetivo") {
      payload = {
        tipo: "objetivo",
        objetivoId: values.objetivoId!,
        grupo: values.grupo!,
        ...base,
      }
    } else if (values.tipo === "receita") {
      payload = { tipo: "receita", categoriaId: values.categoriaId!, ...base }
    } else {
      payload = { tipo: "despesa", categoriaId: values.categoriaId!, ...base }
    }

    setEnviando(true)
    try {
      await criarLancamento(subcontaId, payload)
      toast.success("Lançamento salvo.")
      setOpen(false)
      resetar()
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível salvar o lançamento."
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
        if (!aberto) resetar()
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus />
            Novo lançamento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo lançamento</DialogTitle>
          <DialogDescription>
            Registre uma despesa, receita ou aporte em um objetivo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Abas = tipo do lançamento */}
            <Tabs value={tipo} onValueChange={trocarTipo}>
              <TabsList className="w-full">
                {TABS.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Valor */}
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <InputMoeda autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria (despesa/receita) ou Objetivo */}
            {tipo === "objetivo" ? (
              <>
                <FormField
                  control={form.control}
                  name="objetivoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objetivo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger
                            className="w-full"
                            aria-invalid={!!form.formState.errors.objetivoId}
                          >
                            <SelectValue
                              placeholder={
                                objetivos.length
                                  ? "Selecione um objetivo"
                                  : "Nenhum objetivo cadastrado"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {objetivos.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {o.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Classifica o aporte como gasto Fixo ou Variável (Spec 24). */}
                <FormField
                  control={form.control}
                  name="grupo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classificar como</FormLabel>
                      <FormControl>
                        <RadioGroup
                          className="flex gap-6"
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="fixa" />
                            </FormControl>
                            <FormLabel className="font-normal">Fixa</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="variavel" />
                            </FormControl>
                            <FormLabel className="font-normal">Variável</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                {/* Filtro Fixa/Variável/Investimento — só despesa (Spec: paridade
                    visual com o objetivo). Restringe a lista de categorias abaixo. */}
                {tipo === "despesa" && (
                  <FormField
                    control={form.control}
                    name="classificacaoDespesa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Classificar como</FormLabel>
                        <FormControl>
                          <RadioGroup
                            className="flex flex-wrap gap-x-6 gap-y-2"
                            onValueChange={trocarClassificacaoDespesa}
                            value={field.value ?? "fixa"}
                          >
                            {GRUPOS_DESPESA.map((g) => (
                              <FormItem
                                key={g}
                                className="flex items-center gap-2 space-y-0"
                              >
                                <FormControl>
                                  <RadioGroupItem value={g} />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {GRUPO_LABEL[g]}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="categoriaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger
                            className="w-full"
                            aria-invalid={!!form.formState.errors.categoriaId}
                          >
                            <SelectValue
                              placeholder={
                                categoriasDaAba.length
                                  ? "Selecione uma categoria"
                                  : "Nenhuma categoria — crie uma abaixo"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoriasDaAba.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />

                      {/* Atalho: criar categoria sem sair do lançamento. */}
                      {criandoCategoria ? (
                        <div className="mt-2 flex items-center gap-2">
                          <Input
                            autoFocus
                            placeholder="Nome da nova categoria"
                            value={nomeNovaCategoria}
                            onChange={(e) => setNomeNovaCategoria(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                void criarCategoriaRapida()
                              }
                            }}
                          />
                          <Button
                            type="button"
                            size="sm"
                            disabled={salvandoCategoria || !nomeNovaCategoria.trim()}
                            onClick={() => void criarCategoriaRapida()}
                          >
                            {salvandoCategoria ? "Criando…" : "Criar"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCriandoCategoria(false)
                              setNomeNovaCategoria("")
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-1 justify-start text-muted-foreground"
                          onClick={() => setCriandoCategoria(true)}
                        >
                          <Plus />
                          Nova categoria
                          {tipo === "despesa"
                            ? ` (${GRUPO_LABEL[classificacaoDespesa]})`
                            : ""}
                        </Button>
                      )}
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Data — default hoje */}
            <FormField
              control={form.control}
              name="data"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição / Observação — recolhidas até expandir */}
            {mostrarOpcionais ? (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Descrição{" "}
                        <span className="font-normal text-muted-foreground">
                          (opcional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ex.: mercado do mês" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="observacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Observação{" "}
                        <span className="font-normal text-muted-foreground">
                          (opcional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="Anotações adicionais…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                onClick={() => setMostrarOpcionais(true)}
              >
                <ChevronDown />
                Adicionar descrição / observação
              </Button>
            )}

            <DialogFooter>
              <Button type="submit" disabled={enviando}>
                {enviando ? "Salvando…" : "Salvar lançamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
