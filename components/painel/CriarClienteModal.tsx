"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { criarSubconta, criarLoginCliente } from "@/app/actions/subcontas"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const formSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome do cliente."),
  email: z.string().trim().email("E-mail inválido."),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
})

type FormValues = z.infer<typeof formSchema>

/**
 * **Modal "Criar conta de cliente"** (Spec 07). Cria a subconta `cliente` e, em
 * seguida, o login do cliente (identidade própria em `auth.users`):
 * `criarSubconta('cliente', …)` → `criarLoginCliente(subcontaId, email, senha)`.
 *
 * Roda como Server Actions (RLS + `assertGestor`). Reflete na hora com
 * `router.refresh()` (o painel é Server Component) + toast.
 */
export function CriarClienteModal({
  trigger,
  limiteAtingido = false,
  open: openProp,
  onOpenChange,
}: {
  trigger?: React.ReactNode
  /** Spec 16 · RF-8: quando `true`, antecipa o limite de 3 clientes na UI
   * (gatilho desabilitado + tooltip). A server action continua a barreira real. */
  limiteAtingido?: boolean
  /** Spec 19 · RF-2.5: modo controlado — abre o modal sem `DialogTrigger`
   * (ex.: a partir do atalho do account switcher). */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen
  const setOpen = React.useCallback(
    (aberto: boolean) => {
      if (!isControlled) setInternalOpen(aberto)
      onOpenChange?.(aberto)
    },
    [isControlled, onOpenChange]
  )
  const [enviando, setEnviando] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nome: "", email: "", senha: "" },
  })

  async function onSubmit(values: FormValues) {
    setEnviando(true)
    try {
      const { subconta } = await criarSubconta(
        "cliente",
        values.nome.trim(),
        values.email.trim()
      )
      await criarLoginCliente(subconta.id, values.email.trim(), values.senha)
      toast.success("Cliente criado. O login dele já está ativo.")
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível criar o cliente."
      )
    } finally {
      setEnviando(false)
    }
  }

  // Limite atingido: não abre o modal — mostra o gatilho desabilitado + tooltip.
  if (limiteAtingido) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* `span` recebe os eventos do tooltip mesmo com o botão desabilitado. */}
            <span className="inline-flex">
              {trigger ?? (
                <Button disabled>
                  <Plus />
                  Criar conta de cliente
                </Button>
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent>Limite de 3 clientes atingido.</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(aberto) => {
        setOpen(aberto)
        if (!aberto) form.reset()
      }}
    >
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button>
              <Plus />
              Criar conta de cliente
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar conta de cliente</DialogTitle>
          <DialogDescription>
            Cria a carteira do cliente e o login de acesso dele. O cliente já
            consegue entrar com este e-mail e senha.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Maria Silva" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail de acesso</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="cliente@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha provisória</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                  </FormControl>
                  <FormDescription>
                    O cliente poderá trocá-la depois.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={enviando}>
                {enviando ? "Criando…" : "Criar cliente"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
