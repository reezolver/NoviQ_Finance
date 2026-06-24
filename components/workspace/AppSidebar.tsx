import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { SidebarNav } from "@/components/workspace/SidebarNav"
import { MenuUsuario } from "@/components/workspace/MenuUsuario"
import {
  AccountSwitcher,
  type SubcontaAcessivel,
} from "@/components/workspace/AccountSwitcher"

export type AppSidebarProps = {
  variante: "workspace" | "gestao"
  /** Subcontas acessíveis (RLS-enforced) que alimentam o switcher. */
  subcontas: SubcontaAcessivel[]
  /** Só no workspace: a subconta ativa da URL. */
  subcontaAtivaId?: string
  isGestor: boolean
  /** Na variante `gestao`, libera os itens só-master da nav (Educadores, Leads). */
  isMaster?: boolean
  /** Spec 19 · RF-2.5: dicas de UI para os atalhos de "criar conta". */
  temPessoal: boolean
  clientesNoLimite: boolean
  perfil: {
    nome?: string | null
    email?: string | null
    avatarUrl?: string | null
    preferenciaInicial: "pessoal" | "gestor" | null
  }
}

/**
 * **Sidebar da aplicação** (Spec 18) — a moldura de navegação única que unifica
 * workspace e painel. Server-friendly: recebe tudo por props e compõe o
 * `Sidebar` (`collapsible="icon"`) em três regiões:
 *
 * - `SidebarHeader` → **account switcher** (`AccountSwitcher`, Spec 19 — o
 *   team-switcher nativo da sidebar, fixo no topo).
 * - `SidebarContent` → `SidebarNav`, a navegação contextual conforme a variante.
 * - `SidebarFooter` → **menu do usuário** (`MenuUsuario`; a Spec 22 expande para
 *   "Conta").
 *
 * O `SidebarRail` dá a alça de colapsar/expandir clicando na borda.
 */
export function AppSidebar({
  variante,
  subcontas,
  subcontaAtivaId,
  isGestor,
  isMaster = false,
  temPessoal,
  clientesNoLimite,
  perfil,
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <AccountSwitcher
          subcontas={subcontas}
          subcontaAtivaId={subcontaAtivaId ?? ""}
          isGestor={isGestor}
          temPessoal={temPessoal}
          clientesNoLimite={clientesNoLimite}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav
          variante={variante}
          subcontaId={subcontaAtivaId}
          isMaster={isMaster}
        />
      </SidebarContent>
      <SidebarFooter>
        <MenuUsuario
          nome={perfil.nome}
          email={perfil.email}
          avatarUrl={perfil.avatarUrl}
          preferenciaInicial={perfil.preferenciaInicial}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
