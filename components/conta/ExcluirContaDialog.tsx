"use client"

import * as React from "react"

import { createClient } from "@/lib/supabase"
import { excluirMinhaConta } from "@/app/actions/perfil"
import { toast } from "sonner"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type Modo = "temporario" | "permanente"

/**
 * **Excluir a própria conta** (Spec 22 · RF-4.4) — oferece as duas modalidades
 * da Spec 21 com confirmação forte (digitar o e-mail) e **re-autenticação**
 * (senha atual, D5). A modalidade `permanente` apaga as carteiras pessoais e o
 * login; os **clientes** do gestor seguem disponíveis ao master como
 * "Não atribuídos". Ao concluir: `signOut` + ida para `/login`.
 */
export function ExcluirContaDialog({ email }: { email: string }) {
  const [open, setOpen] = React.useState(false)
  const [modo, setModo] = React.useState<Modo>("temporario")
  const [confirmacao, setConfirmacao] = React.useState("")
  const [senha, setSenha] = React.useState("")
  const [enviando, setEnviando] = React.useState(false)

  // Reseta o estado ao abrir (no próprio handler do diálogo — sem efeito nem
  // ref lido em render).
  function aoMudarAbertura(next: boolean) {
    if (next) {
      setModo("temporario")
      setConfirmacao("")
      setSenha("")
    }
    setOpen(next)
  }

  const emailConfere =
    confirmacao.trim().toLowerCase() === email.trim().toLowerCase()
  const podeExcluir = emailConfere && senha.length > 0 && !enviando

  async function excluir() {
    if (!podeExcluir) return
    setEnviando(true)
    try {
      const supabase = createClient()
      // Re-autenticação (D5) — valida a senha atual antes da ação destrutiva.
      const { error: erroReauth } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      })
      if (erroReauth) throw new Error("Senha atual incorreta.")

      await excluirMinhaConta(modo)
      await supabase.auth.signOut()
      toast.success(
        modo === "temporario"
          ? "Conta desativada."
          : "Conta excluída permanentemente."
      )
      window.location.href = "/login"
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível excluir a conta."
      )
      setEnviando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={aoMudarAbertura}>
      <DialogTrigger asChild>
        <Button variant="destructive">Excluir minha conta</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir minha conta</DialogTitle>
          <DialogDescription>
            Escolha como excluir sua conta. Seus clientes continuam disponíveis
            para o master reatribuir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup
            value={modo}
            onValueChange={(v) => setModo(v as Modo)}
            className="gap-3"
          >
            <Label
              htmlFor="conta-temporario"
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5"
            >
              <RadioGroupItem
                id="conta-temporario"
                value="temporario"
                className="mt-0.5"
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium">Temporária</span>
                <span className="block text-sm text-muted-foreground">
                  Sua conta é desativada e o login suspenso. Recuperável por 90
                  dias, depois apagada para sempre.
                </span>
              </span>
            </Label>

            <Label
              htmlFor="conta-permanente"
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[[data-checked]]:border-destructive has-[[data-checked]]:bg-destructive/5"
            >
              <RadioGroupItem
                id="conta-permanente"
                value="permanente"
                className="mt-0.5"
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium">Permanente</span>
                <span className="block text-sm text-muted-foreground">
                  Apaga agora suas finanças pessoais e seu login, sem volta.
                </span>
              </span>
            </Label>
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="confirma-email" className="text-sm">
              Digite <span className="font-semibold">{email}</span> para confirmar
            </Label>
            <Input
              id="confirma-email"
              autoComplete="off"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              placeholder={email}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirma-senha-conta" className="text-sm">
              Senha atual
            </Label>
            <Input
              id="confirma-senha-conta"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={enviando}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void excluir()}
            disabled={!podeExcluir}
          >
            {enviando
              ? "Excluindo…"
              : modo === "temporario"
                ? "Desativar conta"
                : "Excluir para sempre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
