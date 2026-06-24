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

  /**
   * Seleção da foto = **salvar na hora** (um passo só). O fluxo anterior tinha
   * dois passos (escolher → "Salvar foto"), e era comum escolher, ver o preview
   * e achar que já tinha salvo — por isso a foto "não ficava". Agora o upload
   * para o bucket `avatars` + a gravação da URL em `profiles.avatar_url`
   * acontecem assim que o arquivo é escolhido.
   */
  async function onSelecionarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    // Permite re-selecionar o mesmo arquivo depois (limpa o value do input).
    e.target.value = ""
    if (!file || enviandoFoto) return
    if (!FORMATOS.includes(file.type)) {
      toast.error("Use uma imagem JPG, PNG ou WEBP.")
      return
    }
    if (file.size > TAMANHO_MAX) {
      toast.error("A imagem deve ter no máximo 2 MB.")
      return
    }

    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
    setEnviandoFoto(true)
    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
      const caminho = `${userId}/avatar-${Date.now()}.${ext}`

      const { error: erroUpload } = await supabase.storage
        .from("avatars")
        .upload(caminho, file, { upsert: true, contentType: file.type })
      if (erroUpload) throw new Error(erroUpload.message)

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(caminho)

      await atualizarAvatar(publicUrl)
      toast.success("Foto atualizada.")
      router.refresh()
    } catch (erro) {
      // Falhou: descarta o preview otimista e volta para a foto anterior.
      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
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
          <div className="relative">
            <Avatar size="lg" className="size-16">
              <AvatarImage src={preview ?? avatarUrl ?? undefined} alt="" />
              <AvatarFallback>{iniciais}</AvatarFallback>
            </Avatar>
            {enviandoFoto ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60">
                <Loader2 className="size-5 animate-spin text-foreground" />
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
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
              {enviandoFoto
                ? "Salvando…"
                : avatarUrl
                  ? "Trocar imagem"
                  : "Escolher imagem"}
            </Button>
            <p className="text-xs text-muted-foreground">
              A foto é salva automaticamente ao escolher.
            </p>
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
