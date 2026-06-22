"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Check, Copy, Send } from "lucide-react"
import { toast } from "sonner"

import { criarAnamnese } from "@/app/actions/anamneses"
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

const formSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome do lead."),
  email: z.union([z.string().trim().email("E-mail inválido."), z.literal("")]),
})

type FormValues = z.infer<typeof formSchema>

/**
 * Modal "Enviar anamnese" (Spec 08) — o gestor cria uma anamnese (`criarAnamnese`)
 * e recebe o **link público** para enviar ao lead (copiar). O link é montado a
 * partir do `token` retornado + `window.location.origin`.
 */
export function EnviarAnamneseModal({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [enviando, setEnviando] = React.useState(false)
  const [link, setLink] = React.useState<string | null>(null)
  const [copiado, setCopiado] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nome: "", email: "" },
  })

  function fechar(aberto: boolean) {
    setOpen(aberto)
    if (!aberto) {
      form.reset()
      setLink(null)
      setCopiado(false)
    }
  }

  async function onSubmit(values: FormValues) {
    setEnviando(true)
    try {
      const { token } = await criarAnamnese(values.nome.trim(), values.email.trim() || undefined)
      setLink(`${window.location.origin}/anamnese/${token}`)
      toast.success("Anamnese criada. Copie o link e envie ao lead.")
      router.refresh()
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível criar a anamnese.")
    } finally {
      setEnviando(false)
    }
  }

  async function copiar() {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopiado(true)
      toast.success("Link copiado.")
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      toast.error("Não foi possível copiar. Copie manualmente.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={fechar}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Send />
            Enviar anamnese
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar anamnese</DialogTitle>
          <DialogDescription>
            Crie um link de anamnese para o lead preencher antes da reunião.
          </DialogDescription>
        </DialogHeader>

        {link ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <FormLabel>Link público</FormLabel>
              <div className="flex items-center gap-2">
                <Input readOnly value={link} className="font-mono text-xs" />
                <Button type="button" variant="outline" size="icon" onClick={copiar} aria-label="Copiar link">
                  {copiado ? <Check className="text-success" /> : <Copy />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Qualquer pessoa com este link pode preencher a anamnese (uso único).
              </p>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => fechar(false)}>
                Concluir
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do lead</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex.: João Pereira" autoFocus {...field} />
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
                    <FormLabel>E-mail (opcional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="lead@email.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Usado depois para sugerir o login do cliente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={enviando}>
                  {enviando ? "Criando…" : "Gerar link"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
