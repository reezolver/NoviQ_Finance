import { redirect } from "next/navigation"
import { Info } from "lucide-react"

import { getUsuarioAtual } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PerfilForm } from "@/components/conta/PerfilForm"
import { SegurancaForm } from "@/components/conta/SegurancaForm"
import { PreferenciasForm } from "@/components/conta/PreferenciasForm"
import { ExcluirContaDialog } from "@/components/conta/ExcluirContaDialog"

export const metadata = {
  title: "Conta · Noviq Finance",
}

/**
 * **Página de Conta** (Spec 22) — o "lar" das configurações pessoais, com abas
 * **Perfil · Segurança · Conta · Preferências**. Server Component: carrega o
 * perfil do usuário logado e injeta cada aba (forms Client com suas actions).
 *
 * O aviso do topo separa **identidade do usuário** (nome/foto/e-mail/senha, em
 * `profiles`/`auth.users`) do **nome da conta/carteira** (`subcontas.nome`,
 * editável no seletor de contas) — a confusão que gerou o "Master" (RF-4.7).
 */
export default async function ContaPage() {
  const usuario = await getUsuarioAtual()
  if (!usuario) redirect("/login")

  const supabase = await createSupabaseServerClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, email, avatar_url")
    .eq("id", usuario.id)
    .maybeSingle()

  const email = profile?.email ?? ""

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Conta</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie sua identidade, segurança e preferências.
        </p>
      </div>

      <Alert>
        <Info />
        <AlertTitle>Identidade ≠ nome da conta</AlertTitle>
        <AlertDescription>
          Nome, foto, e-mail e senha são da <strong>sua identidade</strong>. O
          nome da conta/carteira (ex.: &ldquo;Minhas finanças&rdquo;) se edita no
          seletor de contas, na barra lateral.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="conta">Conta</TabsTrigger>
          <TabsTrigger value="preferencias">Preferências</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="pt-6">
          <PerfilForm
            nome={profile?.nome ?? null}
            email={profile?.email ?? null}
            avatarUrl={profile?.avatar_url ?? null}
          />
        </TabsContent>

        <TabsContent value="seguranca" className="pt-6">
          {email ? (
            <SegurancaForm email={email} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Sua conta não tem e-mail/senha (login social). Em breve.
            </p>
          )}
        </TabsContent>

        <TabsContent value="conta" className="pt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-medium">Excluir conta</h2>
              <p className="text-sm text-muted-foreground">
                Encerre sua conta de forma temporária (recuperável por 90 dias) ou
                permanente. Seus clientes continuam disponíveis para o master
                reatribuir.
              </p>
            </div>
            {email ? (
              <ExcluirContaDialog email={email} />
            ) : (
              <p className="text-sm text-muted-foreground">
                A exclusão exige confirmação por e-mail/senha.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="preferencias" className="pt-6">
          <PreferenciasForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
