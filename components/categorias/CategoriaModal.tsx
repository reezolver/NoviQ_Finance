"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import {
  criarCategoria,
  editarCategoria,
  type CriarCategoriaInput,
  type EditarCategoriaInput,
} from "@/app/actions/categorias"
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
import { GRUPO_LABEL, GRUPOS_TODOS, type GrupoCategoria } from "./grupos"

/** Valores de uma categoria existente, para o modo edição. */
export interface CategoriaExistente {
  id: string
  nome: string
  grupo: GrupoCategoria
}

interface CategoriaModalProps {
  subcontaId: string
  /** Quando presente, o modal abre em modo edição daquela categoria. */
  categoria?: CategoriaExistente
  /** Gatilho customizado. Se ausente, usa o botão "Nova categoria" padrão. */
  trigger?: React.ReactNode
  /** Abertura controlada (opcional). Se ausente, o modal controla seu estado. */
  open?: boolean
  /** Callback de mudança de abertura no modo controlado. */
  onOpenChange?: (aberto: boolean) => void
}

const formSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome da categoria."),
  grupo: z.enum(["fixa", "variavel", "investimento", "renda"]),
})

type FormValues = z.infer<typeof formSchema>

/**
 * **Modal de categoria** — cria ou edita uma categoria (nome + grupo). O grupo
 * (`Fixa` · `Variável` · `Investimento` para despesa; `Renda` para receita) é o
 * que classifica cada lançamento dela, já que a despesa não guarda Fixa/Variável
 * por conta própria.
 *
 * Salva via Server Action `criarCategoria` / `editarCategoria`; reflete na hora
 * com `router.refresh()` (a tela de categorias é Server Component) + toast.
 */
export function CategoriaModal({
  subcontaId,
  categoria,
  trigger,
  open: openControlado,
  onOpenChange,
}: CategoriaModalProps) {
  const router = useRouter()
  const editando = categoria !== undefined
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
      nome: categoria?.nome ?? "",
      grupo: categoria?.grupo ?? "fixa",
    }),
    [categoria]
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: valoresIniciais(),
  })

  async function onSubmit(values: FormValues) {
    setEnviando(true)
    try {
      if (editando) {
        const payload: EditarCategoriaInput = {
          nome: values.nome.trim(),
          grupo: values.grupo,
        }
        await editarCategoria(subcontaId, categoria.id, payload)
        toast.success("Categoria atualizada.")
      } else {
        const payload: CriarCategoriaInput = {
          nome: values.nome.trim(),
          grupo: values.grupo,
        }
        await criarCategoria(subcontaId, payload)
        toast.success("Categoria criada.")
      }
      setOpen(false)
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível salvar a categoria."
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
              Nova categoria
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar categoria" : "Nova categoria"}</DialogTitle>
          <DialogDescription>
            {editando
              ? "Atualize o nome ou o grupo da categoria."
              : "Crie uma categoria e escolha o grupo dela (Fixa, Variável, Investimento ou Renda)."}
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
                    <Input placeholder="Ex.: Pet, Educação…" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grupo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grupo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GRUPOS_TODOS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {GRUPO_LABEL[g]}
                          {g === "renda" ? " (receita)" : " (despesa)"}
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
                    : "Criar categoria"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
