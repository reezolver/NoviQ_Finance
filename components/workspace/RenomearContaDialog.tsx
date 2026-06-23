"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { renomearSubconta } from "@/app/actions/subcontas"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

const formSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório.")
    .max(60, "Nome muito longo."),
})

type FormValues = z.infer<typeof formSchema>

/**
 * **Diálogo de renomear** (Spec 20 · RF-3.2) — componível, reusado no account
 * switcher (conta ativa) e nas ações de cliente do painel. Pré-preenche o nome
 * atual, valida (`max 60`) e chama `renomearSubconta`. A permissão real vive na
 * action + RLS; aqui é só UX. Reflete na hora com `router.refresh()` (as telas
 * são Server Components) + toast.
 *
 * Modo **controlado**: aberto pelo `DropdownMenuItem` que o invoca; por isso
 * deve viver **fora** do dropdown (não desmontar ao fechar o menu).
 */
export function RenomearContaDialog({
  subcontaId,
  nomeAtual,
  rotulo,
  open,
  onOpenChange,
}: {
  subcontaId: string
  nomeAtual: string
  /** Título/ação do diálogo, ex.: "Renomear conta" ou "Renomear cliente". */
  rotulo: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [enviando, setEnviando] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nome: nomeAtual },
  })

  // Re-sincroniza o input ao reabrir (o nome atual pode ter mudado).
  React.useEffect(() => {
    if (open) form.reset({ nome: nomeAtual })
  }, [open, nomeAtual, form])

  async function onSubmit(values: FormValues) {
    setEnviando(true)
    try {
      await renomearSubconta(subcontaId, values.nome.trim())
      toast.success("Nome atualizado.")
      onOpenChange(false)
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível renomear."
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{rotulo}</DialogTitle>
          <DialogDescription>
            Escolha um novo nome para esta conta.
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
                    <Input autoFocus maxLength={60} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={enviando}>
                {enviando ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
