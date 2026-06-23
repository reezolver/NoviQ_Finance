"use client"

import * as React from "react"
import { Mail, KeyRound } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

/**
 * Re-autenticação (D5): confirma a **senha atual** com um `signInWithPassword`
 * antes de qualquer mudança sensível. Lança um erro amigável se falhar.
 */
async function reautenticar(
  supabase: ReturnType<typeof createClient>,
  email: string,
  senhaAtual: string
) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senhaAtual,
  })
  if (error) {
    throw new Error("Senha atual incorreta.")
  }
}

/**
 * **Aba Segurança** (Spec 22 · RF-4.2/4.3) — troca de **senha** e de **e-mail**,
 * cada uma exigindo a **senha atual** (re-autenticação, D5). Tudo roda pelo
 * client autenticado (`supabase.auth.updateUser`). A troca de e-mail dispara o
 * fluxo de confirmação do Supabase — só vale após o link no novo endereço.
 */
export function SegurancaForm({ email }: { email: string }) {
  // --- Senha ---
  const [senhaAtual, setSenhaAtual] = React.useState("")
  const [novaSenha, setNovaSenha] = React.useState("")
  const [confirmaSenha, setConfirmaSenha] = React.useState("")
  const [enviandoSenha, setEnviandoSenha] = React.useState(false)

  // --- E-mail ---
  const [novoEmail, setNovoEmail] = React.useState("")
  const [senhaEmail, setSenhaEmail] = React.useState("")
  const [enviandoEmail, setEnviandoEmail] = React.useState(false)

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault()
    if (enviandoSenha) return
    if (novaSenha.length < 6) {
      toast.error("A nova senha deve ter ao menos 6 caracteres.")
      return
    }
    if (novaSenha !== confirmaSenha) {
      toast.error("A confirmação não confere com a nova senha.")
      return
    }
    setEnviandoSenha(true)
    try {
      const supabase = createClient()
      await reautenticar(supabase, email, senhaAtual)
      const { error } = await supabase.auth.updateUser({ password: novaSenha })
      if (error) throw new Error(error.message)
      toast.success("Senha atualizada.")
      setSenhaAtual("")
      setNovaSenha("")
      setConfirmaSenha("")
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível trocar a senha."
      )
    } finally {
      setEnviandoSenha(false)
    }
  }

  async function trocarEmail(e: React.FormEvent) {
    e.preventDefault()
    if (enviandoEmail) return
    setEnviandoEmail(true)
    try {
      const supabase = createClient()
      await reautenticar(supabase, email, senhaEmail)
      const { error } = await supabase.auth.updateUser({ email: novoEmail.trim() })
      if (error) throw new Error(error.message)
      toast.success("Confirme pelo link enviado ao novo e-mail.")
      setNovoEmail("")
      setSenhaEmail("")
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível trocar o e-mail."
      )
    } finally {
      setEnviandoEmail(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Senha */}
      <form onSubmit={trocarSenha} className="space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Trocar senha</h3>
        </div>
        <div className="grid gap-4 sm:max-w-md">
          <div className="space-y-2">
            <Label htmlFor="senha-atual">Senha atual</Label>
            <Input
              id="senha-atual"
              type="password"
              autoComplete="current-password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nova-senha">Nova senha</Label>
            <Input
              id="nova-senha"
              type="password"
              autoComplete="new-password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirma-senha">Confirmar nova senha</Label>
            <Input
              id="confirma-senha"
              type="password"
              autoComplete="new-password"
              value={confirmaSenha}
              onChange={(e) => setConfirmaSenha(e.target.value)}
              required
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={
            enviandoSenha || !senhaAtual || !novaSenha || !confirmaSenha
          }
        >
          {enviandoSenha ? "Salvando…" : "Trocar senha"}
        </Button>
      </form>

      <Separator />

      {/* E-mail */}
      <form onSubmit={trocarEmail} className="space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Trocar e-mail</h3>
        </div>
        <Alert>
          <AlertTitle>Confirmação obrigatória</AlertTitle>
          <AlertDescription>
            A troca só vale depois de confirmar pelo link enviado ao novo e-mail.
          </AlertDescription>
        </Alert>
        <div className="grid gap-4 sm:max-w-md">
          <div className="space-y-2">
            <Label htmlFor="email-atual" className="text-muted-foreground">
              E-mail atual
            </Label>
            <Input id="email-atual" value={email} disabled readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="novo-email">Novo e-mail</Label>
            <Input
              id="novo-email"
              type="email"
              autoComplete="email"
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha-email">Senha atual</Label>
            <Input
              id="senha-email"
              type="password"
              autoComplete="current-password"
              value={senhaEmail}
              onChange={(e) => setSenhaEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={enviandoEmail || !novoEmail || !senhaEmail}
        >
          {enviandoEmail ? "Enviando…" : "Trocar e-mail"}
        </Button>
      </form>
    </div>
  )
}
