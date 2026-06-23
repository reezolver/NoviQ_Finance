"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, Upload } from "lucide-react"

import { createClient } from "@/lib/supabase"
import { atualizarPerfil, atualizarAvatar } from "@/app/actions/perfil"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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

const TAMANHO_MAX = 2 * 1024 * 1024 // 2 MB
const FORMATOS = ["image/jpeg", "image/png", "image/webp"]

const formSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório.").max(80, "Nome muito longo."),
})

type FormValues = z.infer<typeof formSchema>

/**
 * **Aba Perfil** (Spec 22 · RF-4.1) — edita o **nome** e a **foto** da
 * identidade do usuário (não confundir com o nome da carteira). A foto vai para
 * o bucket público `avatars` no prefixo `{uid}/...` (Storage policy restringe a
 * escrita ao dono); a URL pública resultante é gravada em `profiles.avatar_url`
 * via {@link atualizarAvatar}, alimentando o footer da sidebar e o switcher.
 */
export function PerfilForm({
  userId,
  nome,
  email,
  avatarUrl,
}: {
  userId: string
  nome: string | null
  email: string | null
  avatarUrl: string | null
}) {
  const router = useRouter()
  const [enviandoNome, setEnviandoNome] = React.useState(false)
  const [enviandoFoto, setEnviandoFoto] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [arquivo, setArquivo] = React.useState<File | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nome: nome ?? "" },
  })

  // Libera o object URL do preview ao trocar/desmontar (evita vazamento).
  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const iniciais = (nome?.trim() || email?.trim() || "?")
    .slice(0, 2)
    .toUpperCase()

  function onSelecionarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!FORMATOS.includes(file.type)) {
      toast.error("Use uma imagem JPG, PNG ou WEBP.")
      return
    }
    if (file.size > TAMANHO_MAX) {
      toast.error("A imagem deve ter no máximo 2 MB.")
      return
    }
    if (preview) URL.revokeObjectURL(preview)
    setArquivo(file)
    setPreview(URL.createObjectURL(file))
  }

  async function salvarFoto() {
    if (!arquivo || enviandoFoto) return
    setEnviandoFoto(true)
    try {
      const supabase = createClient()
      const ext = arquivo.name.split(".").pop()?.toLowerCase() || "jpg"
      const caminho = `${userId}/avatar-${Date.now()}.${ext}`

      const { error: erroUpload } = await supabase.storage
        .from("avatars")
        .upload(caminho, arquivo, { upsert: true, contentType: arquivo.type })
      if (erroUpload) throw new Error(erroUpload.message)

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(caminho)

      await atualizarAvatar(publicUrl)
      toast.success("Foto atualizada.")
      setArquivo(null)
      setPreview(null)
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível salvar a foto."
      )
    } finally {
      setEnviandoFoto(false)
    }
  }

  async function onSubmit(values: FormValues) {
    setEnviandoNome(true)
    try {
      await atualizarPerfil(values.nome.trim())
      toast.success("Nome atualizado.")
      router.refresh()
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível salvar o nome."
      )
    } finally {
      setEnviandoNome(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Foto */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">Foto de perfil</h3>
          <p className="text-sm text-muted-foreground">
            JPG, PNG ou WEBP, até 2 MB.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Avatar size="lg" className="size-16">
            <AvatarImage src={preview ?? avatarUrl ?? undefined} alt="" />
            <AvatarFallback>{iniciais}</AvatarFallback>
          </Avatar>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onSelecionarArquivo}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={enviandoFoto}
            >
              <Upload className="size-4" />
              Escolher imagem
            </Button>
            {arquivo ? (
              <Button
                type="button"
                onClick={() => void salvarFoto()}
                disabled={enviandoFoto}
              >
                {enviandoFoto ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {enviandoFoto ? "Salvando…" : "Salvar foto"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Nome */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input maxLength={80} placeholder="Seu nome" {...field} />
                </FormControl>
                <FormDescription>
                  Este é o seu nome de usuário, diferente do nome da conta/carteira.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {email ? (
            <div className="space-y-2">
              <FormLabel className="text-muted-foreground">E-mail</FormLabel>
              <Input value={email} disabled readOnly />
              <p className="text-sm text-muted-foreground">
                O e-mail é alterado na aba <span className="font-medium">Segurança</span>.
              </p>
            </div>
          ) : null}
          <Button type="submit" disabled={enviandoNome}>
            {enviandoNome ? "Salvando…" : "Salvar"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
