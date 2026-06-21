"use client"

import { useEffect, useState } from "react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarBadge } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// ─── Data ─────────────────────────────────────────────────────────────────────

const transactions = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  date: `${String(28 - (i % 28)).padStart(2, "0")}/05/2026`,
  description: [
    "Supermercado",       "Salário",          "Aluguel",
    "Academia",           "Netflix",          "Tesouro Selic",
    "Farmácia",           "Restaurante",      "Uber",
    "Conta de luz",       "Plano de saúde",   "Freelance",
  ][i % 12],
  amount: [
    -432, +7500, -1800, -99.9, -39.9, -500, -89, -65, -18, -210, -350, +1200,
  ][i % 12],
  category: [
    "Alimentação", "Receita", "Moradia", "Saúde", "Lazer", "Investimento",
    "Saúde", "Alimentação", "Transporte", "Moradia", "Saúde", "Receita",
  ][i % 12],
}))

const notifications = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: [
    "Meta atingida!",
    "Despesa acima do orçamento",
    "Novo relatório disponível",
    "Lembrete de vencimento",
    "Diagnóstico atualizado",
  ][i % 5],
  body: [
    "Você atingiu 100% da sua reserva de emergência. 🎉",
    "Alimentação ultrapassou R$ 600 este mês.",
    "Seu relatório de maio está pronto para download.",
    "Cartão de crédito vence em 3 dias — R$ 1.240.",
    "Seu score de crédito subiu de 720 para 745.",
  ][i % 5],
  time: `${i + 1}h atrás`,
  read: i > 4,
  type: (["success", "warning", "info", "warning", "success"] as const)[i % 5],
}))

const tags = [
  "Alimentação", "Moradia", "Transporte", "Saúde", "Lazer",
  "Investimento", "Educação", "Vestuário", "Pets", "Viagem",
  "Assinaturas", "Seguros", "Combustível", "Farmácia", "Restaurante",
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold mb-6 pb-2 border-b">{title}</h2>
      {children}
    </section>
  )
}

function Demo({
  title,
  description,
  className,
  children,
}: {
  title: string
  description?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("rounded-lg border bg-card p-5", className)}>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {title}
      </p>
      {description && (
        <p className="text-xs text-muted-foreground mb-4">{description}</p>
      )}
      {children}
    </div>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto text-muted-foreground mt-3 leading-relaxed">
      <code>{code}</code>
    </pre>
  )
}

const notifColor = {
  success: "bg-success",
  warning: "bg-warning",
  info:    "bg-primary",
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScrollAreaShowcasePage() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">Scroll Area</h1>
            <Badge variant="secondary">radix-ui</Badge>
          </div>
          <p className="text-muted-foreground">
            A custom scrollable container with a styled, cross-browser scrollbar.
            Works vertically, horizontally, or both — add a{" "}
            <code className="text-xs bg-muted px-1 rounded">{"<ScrollBar>"}</code> for each
            axis you want to style.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDark((d) => !d)}>
          {dark ? "☀ Light" : "☾ Dark"}
        </Button>
      </div>

      {/* ── ORIENTATIONS ── */}
      <Section title="Orientations">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <Demo
            title='Vertical (default)'
            description="Set a fixed height — content taller than the container will scroll."
          >
            <ScrollArea className="h-48 rounded-lg border">
              <div className="p-3 space-y-1">
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} className="text-sm py-1 px-2 rounded hover:bg-muted">
                    Item {i + 1}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Demo>

          <Demo
            title='Horizontal'
            description="Set a fixed width and add orientation=&quot;horizontal&quot; ScrollBar."
          >
            <ScrollArea className="w-full rounded-lg border">
              <div className="flex gap-3 p-3">
                {Array.from({ length: 14 }, (_, i) => (
                  <div
                    key={i}
                    className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-lg border bg-muted text-xs font-medium"
                  >
                    Card {i + 1}
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </Demo>

          <Demo
            title="Both axes"
            description="Include ScrollBar for both orientations to scroll in all directions."
            className="sm:col-span-2"
          >
            <ScrollArea className="h-40 w-full rounded-lg border">
              <div className="inline-grid gap-2 p-3" style={{ gridTemplateColumns: "repeat(12, 6rem)" }}>
                {Array.from({ length: 60 }, (_, i) => (
                  <div
                    key={i}
                    className="h-10 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </Demo>

        </div>
      </Section>

      {/* ── FINANCIAL USE CASES ── */}
      <Section title="Financial Patterns">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Transaction history */}
          <Demo title="Transaction history (30 items)">
            <ScrollArea className="h-72 rounded-lg border">
              <div className="divide-y">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn(
                        "text-sm font-mono font-medium tabular-nums",
                        tx.amount > 0 ? "text-success" : "text-foreground"
                      )}>
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                      <Badge variant="outline" className="text-[10px] h-4">{tx.category}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Demo>

          {/* Notification feed */}
          <Demo title="Notification feed (20 items)">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">
                {notifications.filter((n) => !n.read).length} não lidas
              </p>
              <Button variant="ghost" size="xs">Marcar todas como lidas</Button>
            </div>
            <ScrollArea className="h-[264px] rounded-lg border">
              <div className="divide-y">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-start gap-3 px-3 py-2.5",
                      !n.read && "bg-primary/5"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        !n.read ? notifColor[n.type] : "bg-transparent"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{n.time}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Demo>

          {/* Horizontal tag picker */}
          <Demo
            title="Horizontal tag / category picker"
            className="sm:col-span-2"
          >
            <ScrollArea className="w-full rounded-lg">
              <div className="flex gap-2 pb-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="shrink-0 cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </Demo>

          {/* Sidebar nav */}
          <Demo title="Sidebar navigation list">
            <ScrollArea className="h-56 rounded-lg border">
              <div className="p-2 space-y-1">
                <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Principais
                </p>
                {["Visão geral","Transações","Orçamento","Metas","Investimentos"].map((item) => (
                  <button
                    key={item}
                    className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
                  >
                    {item}
                  </button>
                ))}
                <Separator className="my-2" />
                <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Relatórios
                </p>
                {["Mensal","Trimestral","Anual","Por categoria","Comparativo"].map((item) => (
                  <button
                    key={item}
                    className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
                  >
                    {item}
                  </button>
                ))}
                <Separator className="my-2" />
                <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Configurações
                </p>
                {["Perfil","Notificações","Segurança","Plano","Integrações","Suporte"].map((item) => (
                  <button
                    key={item}
                    className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Demo>

          {/* Member list with avatars */}
          <Demo title="Member list with avatars">
            <ScrollArea className="h-56 rounded-lg border">
              <div className="divide-y">
                {Array.from({ length: 12 }, (_, i) => {
                  const names  = ["João Silva","Maria Souza","Pedro Lima","Ana Costa","Carlos Neto","Beatriz Lima","Rafael Souza","Camila Santos","Lucas Ferreira","Julia Oliveira","André Costa","Fernanda Lima"]
                  const status = (["online","away","offline","online","online","offline","away","online","offline","online","away","offline"] as const)[i]
                  const statusColor = { online: "bg-success", away: "bg-warning", offline: "bg-muted-foreground" }
                  return (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                      <Avatar size="sm">
                        <AvatarFallback className="bg-primary/15 text-primary text-xs">
                          {names[i].split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                        <AvatarBadge className={statusColor[status]} />
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{names[i]}</p>
                      </div>
                      <Button variant="ghost" size="xs">Ver</Button>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </Demo>

        </div>
      </Section>

      {/* ── USAGE ── */}
      <Section title="Usage">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-1">Import</p>
            <CodeBlock code={`import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"`} />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Vertical (default — no explicit ScrollBar needed)</p>
            <CodeBlock
              code={`<ScrollArea className="h-64 rounded-lg border">
  {/* Content taller than 256px will scroll */}
  {items.map((item) => (
    <div key={item.id}>{item.name}</div>
  ))}
</ScrollArea>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Horizontal scrolling</p>
            <CodeBlock
              code={`<ScrollArea className="w-full rounded-lg">
  <div className="flex gap-3 p-3">
    {cards.map((card) => (
      <div key={card.id} className="w-40 shrink-0">…</div>
    ))}
  </div>
  {/* Must explicitly add the horizontal scrollbar */}
  <ScrollBar orientation="horizontal" />
</ScrollArea>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Both axes</p>
            <CodeBlock
              code={`<ScrollArea className="h-48 w-full rounded-lg border">
  <div className="w-[1200px]">…wide content…</div>
  <ScrollBar orientation="vertical" />
  <ScrollBar orientation="horizontal" />
</ScrollArea>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Custom scrollbar thumb color</p>
            <CodeBlock
              code={`{/* Override the default bg-border thumb */}
<ScrollArea className="h-64">
  {children}
  <ScrollBar
    className="[&_[data-slot=scroll-area-thumb]]:bg-primary/40"
  />
</ScrollArea>`}
            />
          </div>
        </div>
      </Section>

      {/* ── API ── */}
      <Section title="API">
        <div className="space-y-6">
          {[
            {
              component: "ScrollArea",
              props: [
                { prop: "className",  type: "string",  def: "—",  desc: "Controls container dimensions. Set h-N for vertical scroll, w-N for horizontal." },
                { prop: "type",       type: '"auto" | "always" | "scroll" | "hover"', def: '"hover"', desc: "When the scrollbar is visible. hover = on pointer over, scroll = while scrolling, always = always visible." },
                { prop: "scrollHideDelay", type: "number", def: "600", desc: "Delay in ms before the scrollbar hides after scrolling (for type='scroll' and 'hover')." },
              ],
            },
            {
              component: "ScrollBar",
              props: [
                { prop: "orientation", type: '"vertical" | "horizontal"', def: '"vertical"', desc: "Axis of the scrollbar. You must add one per axis." },
                { prop: "className",   type: "string",  def: "—", desc: "Use [&_[data-slot=scroll-area-thumb]]:bg-{color} to override the thumb color." },
              ],
            },
          ].map((section) => (
            <div key={section.component}>
              <p className="text-sm font-semibold mb-2">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{section.component}</code>
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-6 font-semibold text-xs">Prop</th>
                      <th className="text-left py-2 pr-6 font-semibold text-xs">Type</th>
                      <th className="text-left py-2 pr-6 font-semibold text-xs">Default</th>
                      <th className="text-left py-2 font-semibold text-xs">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    {section.props.map((row) => (
                      <tr key={row.prop} className="border-b last:border-0">
                        <td className="py-2 pr-6">
                          <code className="text-xs text-foreground bg-muted px-1 py-0.5 rounded">{row.prop}</code>
                        </td>
                        <td className="py-2 pr-6 text-xs font-mono">{row.type}</td>
                        <td className="py-2 pr-6 text-xs font-mono">{row.def}</td>
                        <td className="py-2 text-xs">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── ACCESSIBILITY ── */}
      <Section title="Accessibility">
        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li>
            The viewport is focusable and shows a focus ring — keyboard users can focus it and use{" "}
            <kbd className="text-xs bg-muted px-1 rounded">↑ ↓</kbd> /{" "}
            <kbd className="text-xs bg-muted px-1 rounded">↑ ↓</kbd>,{" "}
            <kbd className="text-xs bg-muted px-1 rounded">Page Up/Down</kbd>, and{" "}
            <kbd className="text-xs bg-muted px-1 rounded">Home/End</kbd> to scroll.
          </li>
          <li>
            For long lists, add <code className="text-xs bg-muted px-1 rounded">role=&quot;region&quot;</code> and{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-label</code> on the{" "}
            <code className="text-xs bg-muted px-1 rounded">ScrollArea</code> so screen readers announce
            the scrollable region.
          </li>
          <li>
            If items inside the scroll area are interactive (buttons, links), they remain naturally
            tab-focusable and will scroll into view when focused.
          </li>
          <li>
            Radix hides the custom scrollbar from the accessibility tree — native scrollbar semantics
            are preserved on the viewport element.
          </li>
          <li>
            Avoid setting <code className="text-xs bg-muted px-1 rounded">type=&quot;scroll&quot;</code> or{" "}
            <code className="text-xs bg-muted px-1 rounded">&quot;hover&quot;</code> for content where visibility
            of the scrollbar is important for discoverability — use{" "}
            <code className="text-xs bg-muted px-1 rounded">&quot;auto&quot;</code> or{" "}
            <code className="text-xs bg-muted px-1 rounded">&quot;always&quot;</code> instead.
          </li>
        </ul>
      </Section>
    </div>
  )
}
