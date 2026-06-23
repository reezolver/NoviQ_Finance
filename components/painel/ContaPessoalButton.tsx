"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { User } from "lucide-react"
import { toast } from "sonner"

import { criarSubconta } from "@/app/actions/subcontas"
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

/**
 * Nome default da conta pessoal (Spec 20 · D3) — genérico e editável. Nunca
 * derivar de `profiles.nome`/`tipo_perfil` (era a origem do "Master").
 */
const NOME_PADRAO_PESSOAL = "Minhas finanças"

const formSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório.")
    .max(60, "Nome muito longo."),
})

type FormValues = z.infer<typeof formSchema>

/**
 * Acesso à **conta pessoal do gestor** (Spec 07). Se já existe, vira um link
 * para o workspace da própria subconta `pessoal`. Se ainda não existe, abre um
 * diálogo que **pede o nome** (default "Minhas finanças", editável) antes de
 * criar — desacopla o nome da conta do nome/tipo do usuário (Spec 20 · RF-3.1).
 *
 * A conta pessoal não tem login próprio (`owner_user_id = gestor_id`) — é só
 * mais um contexto de workspace do gestor.
 */
export function ContaPessoalButton({ pessoalId }: { pessoalId: string | null }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [criando, setCriando] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nome: NOME_PADRAO_PESSOAL },
  })

  if (pessoalId) {
    return (
      <Button asChild variant="outline">
        <Link href={`/${pessoalId}/controle-anual`}>
          <User />
          Minha conta pessoal
        </Link>
      </Button>
    )
  }

  async function onSubmit(values: FormValues) {
    setCriando(true)
    try {
      const { subconta } = await criarSubconta("pessoal", values.nome.trim())
      toast.success("Conta pessoal criada.")
      router.push(`/${subconta.id}/controle-anual`)
    } catch (erro) {
      toast.error(
        erro instanceof Error
          ? erro.message
          : "Não foi possível criar a conta pessoal."
      )
      setCriando(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(aberto) => {
        setOpen(aberto)
        if (aberto) form.reset({ nome: NOME_PADRAO_PESSOAL })
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <User />
          Criar conta pessoal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar conta pessoal</DialogTitle>
          <DialogDescription>
            Dê um nome para a sua carteira pessoal. Você pode renomeá-la depois.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da conta</FormLabel>
                  <FormControl>
                    <Input autoFocus maxLength={60} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={criando}>
                {criando ? "Criando…" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
