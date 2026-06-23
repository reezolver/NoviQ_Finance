"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Check,
  ChevronsUpDown,
  LayoutDashboard,
  Pencil,
  Plus,
  User,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { criarSubconta } from "@/app/actions/subcontas"
import { CriarClienteModal } from "@/components/painel/CriarClienteModal"
import { RenomearContaDialog } from "@/components/workspace/RenomearContaDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import type { Database } from "@/types/database"

type TipoSubconta = Database["public"]["Enums"]["tipo_subconta"]

export interface SubcontaAcessivel {
  id: string
  nome: string
  tipo: TipoSubconta
}

/**
 * **Account switcher** (Spec 19) — o team-switcher nativo da sidebar (estilo
 * Vercel/Linear). Vive **fixo** no `SidebarHeader` (não rola com o conteúdo) e
 * reaproveita toda a lógica do antigo `SeletorSubconta`: é **contexto de
 * workspace, não troca de sessão** — selecionar uma subconta só troca o
 * `[subcontaId]` da URL, preservando a seção atual.
 *
 * A lista já chega filtrada pela RLS (a pessoal do gestor + os clientes
 * acessíveis). Para o **cliente final** — que só enxerga a própria subconta —
 * exibe um rótulo estático, sem dropdown (RF-2.4).
 *
 * No estado **colapsado** (`collapsible="icon"`), o trigger encolhe para só o
 * avatar da conta ativa e o menu abre `side="right"` (RF-2.3).
 *
 * `temPessoal`/`clientesNoLimite` são **dicas de UI** calculadas no Server
 * Component (a partir das subcontas já carregadas) para mostrar/esconder os
 * atalhos de "criar conta" (RF-2.5). A barreira real continua na `action`
 * (`criarSubconta`) + no trigger do banco.
 */
export function AccountSwitcher({
  subcontas,
  subcontaAtivaId,
  isGestor = false,
  temPessoal = false,
  clientesNoLimite = false,
}: {
  subcontas: SubcontaAcessivel[]
  subcontaAtivaId: string
  isGestor?: boolean
  /** Gestor já tem conta pessoal? Esconde o atalho "Criar conta pessoal". */
  temPessoal?: boolean
  /** Gestor no teto de 3 clientes? Esconde o atalho "Criar conta de cliente". */
  clientesNoLimite?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile, state } = useSidebar()
  const colapsado = state === "collapsed" && !isMobile

  const [criandoPessoal, setCriandoPessoal] = React.useState(false)
  const [clienteModalOpen, setClienteModalOpen] = React.useState(false)
  const [renomearOpen, setRenomearOpen] = React.useState(false)

  const ativa =
    subcontas.find((s) => s.id === subcontaAtivaId) ?? subcontas[0] ?? null

  const trocar = React.useCallback(
    (novoId: string) => {
      if (novoId === subcontaAtivaId) return
      // Preserva a seção atual **só** quando já estamos num workspace
      // (`/[subcontaId]/seção`). Fora dele (ex.: `/conta`, `/painel`) o 1º
      // segmento não é uma subconta — sem isso, navegaríamos para `/{id}`, que
      // não tem página índice e cai no not-found. Nesse caso, vai para a seção
      // default da conta escolhida.
      const segmentos = pathname.split("/").filter(Boolean)
      const noWorkspace = subcontas.some((s) => s.id === segmentos[0])
      const resto = noWorkspace ? segmentos.slice(1) : []
      const secao = resto.length > 0 ? resto : ["controle-anual"]
      router.push(`/${[novoId, ...secao].join("/")}`)
    },
    [pathname, router, subcontaAtivaId, subcontas]
  )

  const criarPessoal = React.useCallback(async () => {
    setCriandoPessoal(true)
    try {
      // Default genérico (Spec 20 · D3) — nunca derivar do nome/tipo do perfil
      // ("Master"). Mantém o atalho de 1 clique; renomear vem depois.
      const { subconta } = await criarSubconta("pessoal", "Minhas finanças")
      toast.success("Conta pessoal criada.")
      router.push(`/${subconta.id}/controle-anual`)
    } catch (erro) {
      toast.error(
        erro instanceof Error
          ? erro.message
          : "Não foi possível criar a conta pessoal."
      )
      setCriandoPessoal(false)
    }
  }, [router])

  if (!ativa) return null

  const pessoais = subcontas.filter((s) => s.tipo === "pessoal")
  const clientes = subcontas.filter((s) => s.tipo === "cliente")
  // Gestor sempre tem dropdown (mesmo com só a conta pessoal) — precisa do
  // atalho para o painel. Cliente só ganha dropdown se tiver mais de uma conta.
  const mostrarDropdown = isGestor || subcontas.length > 1

  // Cliente final (uma conta só): rótulo estático, sem dropdown (RF-2.4).
  if (!mostrarDropdown) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="cursor-default hover:bg-transparent"
            tooltip={ativa.nome}
          >
            <ContaAvatar tipo={ativa.tipo} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{ativa.nome}</span>
              <span className="truncate text-xs text-muted-foreground capitalize">
                {ativa.tipo}
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // Atalhos de "criar conta": só fazem sentido para o gestor.
  const podeCriarPessoal = isGestor && !temPessoal
  const podeCriarCliente = isGestor && !clientesNoLimite
  const temAtalhos = podeCriarPessoal || podeCriarCliente

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              aria-label="Trocar de conta"
              tooltip={ativa.nome}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <ContaAvatar tipo={ativa.tipo} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{ativa.nome}</span>
                <span className="truncate text-xs text-muted-foreground capitalize">
                  {ativa.tipo}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg"
            align="start"
            side={colapsado ? "right" : "bottom"}
            sideOffset={4}
          >
            {isGestor && (
              <>
                <DropdownMenuItem asChild className="gap-2">
                  <Link href="/painel">
                    <LayoutDashboard className="size-4 text-muted-foreground" />
                    <span className="truncate">Painel de gestão</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {pessoais.length > 0 && (
              <>
                <DropdownMenuLabel className="text-muted-foreground">
                  Conta pessoal
                </DropdownMenuLabel>
                {pessoais.map((s) => (
                  <ItemSubconta
                    key={s.id}
                    subconta={s}
                    ativa={s.id === ativa.id}
                    onSelect={() => trocar(s.id)}
                  />
                ))}
              </>
            )}
            {clientes.length > 0 && (
              <>
                {pessoais.length > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="text-muted-foreground">
                  Clientes
                </DropdownMenuLabel>
                {clientes.map((s) => (
                  <ItemSubconta
                    key={s.id}
                    subconta={s}
                    ativa={s.id === ativa.id}
                    onSelect={() => trocar(s.id)}
                  />
                ))}
              </>
            )}
            {isGestor && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2"
                  onSelect={(e) => {
                    e.preventDefault()
                    setRenomearOpen(true)
                  }}
                >
                  <Pencil className="size-4 text-muted-foreground" />
                  <span className="truncate">Renomear conta</span>
                </DropdownMenuItem>
              </>
            )}
            {temAtalhos && (
              <>
                <DropdownMenuSeparator />
                {podeCriarPessoal && (
                  <DropdownMenuItem
                    className="gap-2"
                    disabled={criandoPessoal}
                    onSelect={(e) => {
                      e.preventDefault()
                      void criarPessoal()
                    }}
                  >
                    <Plus className="size-4 text-muted-foreground" />
                    <span className="truncate">
                      {criandoPessoal ? "Criando…" : "Criar conta pessoal"}
                    </span>
                  </DropdownMenuItem>
                )}
                {podeCriarCliente && (
                  <DropdownMenuItem
                    className="gap-2"
                    onSelect={(e) => {
                      e.preventDefault()
                      setClienteModalOpen(true)
                    }}
                  >
                    <Plus className="size-4 text-muted-foreground" />
                    <span className="truncate">Criar conta de cliente</span>
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      {/* Modal controlado: aberto pelo atalho do menu (fora do dropdown para
          não desmontar ao fechar). A action é a barreira real do limite. */}
      {podeCriarCliente && (
        <CriarClienteModal
          open={clienteModalOpen}
          onOpenChange={setClienteModalOpen}
        />
      )}

      {/* Renomear a conta ativa (Spec 20 · RF-3.2). Fora do dropdown para não
          desmontar ao fechar o menu. A action + RLS são a barreira real. */}
      {isGestor && (
        <RenomearContaDialog
          subcontaId={ativa.id}
          nomeAtual={ativa.nome}
          rotulo="Renomear conta"
          open={renomearOpen}
          onOpenChange={setRenomearOpen}
        />
      )}
    </SidebarMenu>
  )
}

function ContaAvatar({ tipo }: { tipo: TipoSubconta }) {
  const Icon = tipo === "pessoal" ? User : Users
  return (
    <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
      <Icon className="size-4" />
    </div>
  )
}

function ItemSubconta({
  subconta,
  ativa,
  onSelect,
}: {
  subconta: SubcontaAcessivel
  ativa: boolean
  onSelect: () => void
}) {
  return (
    <DropdownMenuItem onSelect={onSelect} className="gap-2">
      {subconta.tipo === "pessoal" ? (
        <User className="size-4 text-muted-foreground" />
      ) : (
        <Users className="size-4 text-muted-foreground" />
      )}
      <span className="truncate">{subconta.nome}</span>
      <Check
        className={cn("ml-auto size-4", ativa ? "opacity-100" : "opacity-0")}
      />
    </DropdownMenuItem>
  )
}
