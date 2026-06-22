"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { converterAnamneseEmSubconta } from "@/app/actions/anamneses"
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
import { Switch } from "@/components/ui/switch"

const formSchema = z
  .object({
    criarLogin: z.boolean(),
    email: z.union([z.string().trim().email("E-mail inválido."), z.literal("")]),
    senha: z.union([z.string().min(6, "Mínimo 6 caracteres."), z.literal("")]),
  })
  .refine((d) => !d.criarLogin || d.email !== "", {
    path: ["email"],
    message: "Informe o e-mail do cliente.",
  })
  .refine((d) => !d.criarLogin || d.senha !== "", {
    path: ["senha"],
    message: "Informe uma senha provisória.",
  })

type FormValues = z.infer<typeof formSchema>

/**
 * Converte uma anamnese preenchida em subconta pré-preenchida
 * (`converterAnamneseEmSubconta`), opcionalmente criando o login do cliente.
 * Após converter, leva o gestor direto à carteira criada.
 */
export function ConverterAnamneseDialog({
  anamneseId,
  emailLead,
  trigger,
}: {
  anamneseId: string
  emailLead: string | null
  trigger: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [convertendo, setConvertendo] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { criarLogin: false, email: emailLead ?? "", senha: "" },
  })

  const criarLogin = form.watch("criarLogin")

  async function onSubmit(values: FormValues) {
    setConvertendo(true)
    try {
      const { subcontaId } = await converterAnamneseEmSubconta(anamneseId, {
        criarLogin: values.criarLogin,
        email: values.email.trim() || undefined,
        senha: values.senha || undefined,
      })
      toast.success(
        values.criarLogin
          ? "Subconta criada e login do cliente ativado."
          : "Subconta criada a partir da anamnese."
      )
      setOpen(false)
      router.push(`/${subcontaId}/controle-anual`)
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível converter.")
    } finally {
      setConvertendo(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(aberto) => {
        setOpen(aberto)
        if (!aberto) form.reset({ criarLogin: false, email: emailLead ?? "", senha: "" })
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Converter em subconta</DialogTitle>
          <DialogDescription>
            Cria a carteira do cliente já pré-preenchida (categorias, planejado,
            patrimônio, dívidas e objetivos) a partir das respostas.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="criarLogin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Criar login do cliente</FormLabel>
                    <FormDescription>
                      Cliente acessa a própria carteira com e-mail e senha.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {criarLogin && (
              <>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button type="submit" disabled={convertendo}>
                {convertendo ? "Convertendo…" : "Converter"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
