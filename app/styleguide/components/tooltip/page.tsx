"use client"

import { useEffect, useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarBadge,
} from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

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
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TooltipShowcasePage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Tooltip</h1>
            <Badge variant="secondary">radix-ui</Badge>
          </div>
          <p className="text-muted-foreground">
            A floating label that appears on hover or focus, providing contextual
            information about an element. Non-interactive by design — use{" "}
            <code className="text-xs bg-muted px-1 rounded">Popover</code> when you need
            clickable content inside.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDark((d) => !d)}>
          {dark ? "☀ Light" : "☾ Dark"}
        </Button>
      </div>

      {/* ── PLACEMENT ── */}
      <Section title="Placement">
        <Demo title="All four sides — hover each button">
          <div className="flex flex-wrap gap-3 justify-center py-4">
            {(["top", "right", "bottom", "left"] as const).map((side) => (
              <Tooltip key={side}>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="capitalize">
                    {side}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={side}>
                  Tooltip on {side}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </Demo>

        <div className="mt-4">
          <Demo title="Alignment within a side — start / center / end">
            <div className="flex flex-wrap gap-3 justify-center py-4">
              {(["start", "center", "end"] as const).map((align) => (
                <Tooltip key={align}>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="capitalize">
                      align: {align}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align={align}>
                    Aligned to {align}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </Demo>
        </div>
      </Section>

      {/* ── CONTENT ── */}
      <Section title="Content Variants">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <Demo title="Simple text">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>
                Diagnóstico financeiro gratuito
              </TooltipContent>
            </Tooltip>
          </Demo>

          <Demo title="With keyboard shortcut (kbd slot)">
            <div className="flex flex-wrap gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">Nova transação</Button>
                </TooltipTrigger>
                <TooltipContent>
                  Adicionar transação
                  <kbd className="ml-1.5 inline-flex h-5 items-center rounded border bg-background/20 px-1 font-mono text-[10px] font-medium">
                    ⌘N
                  </kbd>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">Exportar</Button>
                </TooltipTrigger>
                <TooltipContent>
                  Exportar relatório
                  <kbd className="ml-1.5 inline-flex h-5 items-center rounded border bg-background/20 px-1 font-mono text-[10px] font-medium">
                    ⌘E
                  </kbd>
                </TooltipContent>
              </Tooltip>
            </div>
          </Demo>

          <Demo title="Multi-line content">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">Score de crédito</Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-48 text-center">
                Seu score é calculado com base no seu histórico de pagamentos,
                dívidas e tempo de relacionamento com o banco.
              </TooltipContent>
            </Tooltip>
          </Demo>

          <Demo title="Custom background color">
            <div className="flex flex-wrap gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="default" size="sm">Primary</Button>
                </TooltipTrigger>
                <TooltipContent className="bg-primary text-primary-foreground [&_svg]:fill-primary">
                  Ação principal
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="destructive" size="sm">Danger</Button>
                </TooltipTrigger>
                <TooltipContent className="bg-destructive text-destructive-foreground [&_svg]:fill-destructive">
                  Ação irreversível — cuidado!
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-success text-success-foreground hover:bg-success/90"
                  >
                    Success
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-success text-success-foreground [&_svg]:fill-success">
                  Operação concluída
                </TooltipContent>
              </Tooltip>
            </div>
          </Demo>

        </div>
      </Section>

      {/* ── ON DIFFERENT TRIGGERS ── */}
      <Section title="Trigger Types">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <Demo title="Icon-only button">
            <p className="text-xs text-muted-foreground mb-3">
              Tooltips are essential on icon buttons that lack visible labels.
            </p>
            <div className="flex gap-2">
              {[
                { icon: "✏️", label: "Editar transação"    },
                { icon: "🗑️", label: "Excluir transação"   },
                { icon: "📋", label: "Duplicar transação"  },
                { icon: "📤", label: "Exportar transação"  },
              ].map(({ icon, label }) => (
                <Tooltip key={label}>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label={label}>
                      {icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </Demo>

          <Demo title="On a badge">
            <div className="flex flex-wrap gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="default" className="cursor-default">Pro</Badge>
                </TooltipTrigger>
                <TooltipContent>
                  Plano Pro — R$ 49/mês. Inclui relatórios avançados.
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="cursor-default">Trial</Badge>
                </TooltipTrigger>
                <TooltipContent>
                  Período de avaliação — 7 dias restantes
                </TooltipContent>
              </Tooltip>
            </div>
          </Demo>

          <Demo title="On an Avatar (member status)">
            <div className="flex gap-3">
              {[
                { initials: "JS", name: "João Silva",  role: "Consultor",  status: "online"  as const },
                { initials: "MS", name: "Maria Souza", role: "Analista",   status: "away"    as const },
                { initials: "PL", name: "Pedro Lima",  role: "Diretor",    status: "offline" as const },
              ].map((p) => {
                const statusMap = { online: "Online agora", away: "Ausente", offline: "Offline" }
                const colorMap  = { online: "bg-success",   away: "bg-warning", offline: "bg-muted-foreground" }
                return (
                  <Tooltip key={p.initials}>
                    <TooltipTrigger asChild>
                      <Avatar size="default" className="cursor-default">
                        <AvatarFallback className="bg-primary/15 text-primary text-xs">
                          {p.initials}
                        </AvatarFallback>
                        <AvatarBadge className={colorMap[p.status]} />
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-background/70">{p.role} — {statusMap[p.status]}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </Demo>

          <Demo title="On a disabled button" description="Use a wrapper span — disabled buttons don't fire pointer events.">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex cursor-not-allowed">
                  <Button disabled className="pointer-events-none">
                    Funcionalidade bloqueada
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Disponível apenas no plano Pro
              </TooltipContent>
            </Tooltip>
          </Demo>

        </div>
      </Section>

      {/* ── REAL-WORLD PATTERNS ── */}
      <Section title="Patterns">
        <div className="grid grid-cols-1 gap-4">

          {/* Info toolbar */}
          <Demo title="Icon toolbar with tooltips">
            <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1 w-fit">
              {[
                { icon: "📊", label: "Visão geral",    shortcut: "⌘1" },
                { icon: "💸", label: "Transações",     shortcut: "⌘2" },
                { icon: "📈", label: "Investimentos",  shortcut: "⌘3" },
                { icon: "🎯", label: "Metas",          shortcut: "⌘4" },
              ].map(({ icon, label, shortcut }) => (
                <Tooltip key={label}>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label={label}>
                      {icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {label}
                    <kbd className="ml-1.5 inline-flex h-5 items-center rounded border bg-background/20 px-1 font-mono text-[10px] font-medium">
                      {shortcut}
                    </kbd>
                  </TooltipContent>
                </Tooltip>
              ))}
              <Separator orientation="vertical" className="mx-1 h-5" />
              {[
                { icon: "⚙️", label: "Configurações", shortcut: "⌘," },
                { icon: "❓", label: "Ajuda",          shortcut: "⌘?"  },
              ].map(({ icon, label, shortcut }) => (
                <Tooltip key={label}>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label={label}>
                      {icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {label}
                    <kbd className="ml-1.5 inline-flex h-5 items-center rounded border bg-background/20 px-1 font-mono text-[10px] font-medium">
                      {shortcut}
                    </kbd>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </Demo>

          {/* Data table with info tooltips */}
          <Demo title="Data table — contextual info tooltips">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="border-b">
                  <tr>
                    {[
                      { label: "Ativo",     tip: null },
                      { label: "Tipo",      tip: null },
                      { label: "Valor",     tip: "Valor atual de mercado" },
                      { label: "Rent. 12m", tip: "Rentabilidade acumulada nos últimos 12 meses" },
                      { label: "Risco",     tip: "Classificação de risco: Baixo · Médio · Alto" },
                    ].map(({ label, tip }) => (
                      <th key={label} className="text-left py-2 pr-4 font-semibold text-xs">
                        {tip ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-1 cursor-default border-b border-dashed border-muted-foreground/50">
                                {label}
                                <span className="text-muted-foreground text-[10px]">ⓘ</span>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-40">{tip}</TooltipContent>
                          </Tooltip>
                        ) : label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Tesouro Selic", type: "RF",  value: "R$ 8.200", rent: "+0.87%",  risk: "Baixo",  riskColor: "text-success"     },
                    { name: "IVVB11",        type: "ETF", value: "R$ 5.100", rent: "+2.13%",  risk: "Médio",  riskColor: "text-warning"     },
                    { name: "PETR4",         type: "Ação",value: "R$ 1.800", rent: "-1.40%",  risk: "Alto",   riskColor: "text-destructive" },
                  ].map((row) => (
                    <tr key={row.name} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2 pr-4 font-medium">{row.name}</td>
                      <td className="py-2 pr-4">
                        <Badge variant="outline">{row.type}</Badge>
                      </td>
                      <td className="py-2 pr-4 font-mono tabular-nums">{row.value}</td>
                      <td className={`py-2 pr-4 font-mono tabular-nums font-medium ${row.rent.startsWith("+") ? "text-success" : "text-destructive"}`}>
                        {row.rent}
                      </td>
                      <td className={`py-2 font-medium ${row.riskColor}`}>
                        {row.risk}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Demo>

        </div>
      </Section>

      {/* ── USAGE ── */}
      <Section title="Usage">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-1">Setup — wrap app with TooltipProvider</p>
            <CodeBlock
              code={`// app/layout.tsx  (already added)
import { TooltipProvider } from "@/components/ui/tooltip"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Import</p>
            <CodeBlock
              code={`import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Basic</p>
            <CodeBlock
              code={`<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="outline">Hover me</Button>
  </TooltipTrigger>
  <TooltipContent>Diagnóstico financeiro gratuito</TooltipContent>
</Tooltip>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Placement</p>
            <CodeBlock
              code={`{/* side: "top" | "right" | "bottom" | "left" */}
<TooltipContent side="bottom" align="start">
  Texto do tooltip
</TooltipContent>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">With keyboard shortcut</p>
            <CodeBlock
              code={`<TooltipContent>
  Exportar relatório
  <kbd className="ml-1.5 inline-flex h-5 items-center rounded border
    bg-background/20 px-1 font-mono text-[10px] font-medium">
    ⌘E
  </kbd>
</TooltipContent>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">On a disabled button — requires span wrapper</p>
            <CodeBlock
              code={`{/* disabled elements don't fire pointer events, so wrap in a span */}
<Tooltip>
  <TooltipTrigger asChild>
    <span className="inline-flex cursor-not-allowed">
      <Button disabled className="pointer-events-none">Bloqueado</Button>
    </span>
  </TooltipTrigger>
  <TooltipContent>Disponível apenas no plano Pro</TooltipContent>
</Tooltip>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Custom delay (override provider default)</p>
            <CodeBlock
              code={`{/* Per-tooltip delay override */}
<Tooltip delayDuration={500}>
  <TooltipTrigger asChild>
    <Button>Hover — 500ms delay</Button>
  </TooltipTrigger>
  <TooltipContent>Aparece após 500ms</TooltipContent>
</Tooltip>

{/* Or set globally in TooltipProvider */}
<TooltipProvider delayDuration={300}>{children}</TooltipProvider>`}
            />
          </div>
        </div>
      </Section>

      {/* ── API ── */}
      <Section title="API">
        <div className="space-y-6">
          {[
            {
              component: "TooltipProvider",
              props: [
                { prop: "delayDuration",      type: "number",  def: "0",      desc: "Default hover delay in ms before tooltip opens. Can be overridden per Tooltip." },
                { prop: "skipDelayDuration",  type: "number",  def: "300",    desc: "How long after closing one tooltip before the delay restarts." },
                { prop: "disableHoverableContent", type: "boolean", def: "false", desc: "Prevents tooltip from staying open when moving cursor into the content." },
              ],
            },
            {
              component: "Tooltip (Root)",
              props: [
                { prop: "open",           type: "boolean",     def: "—",     desc: "Controlled open state." },
                { prop: "defaultOpen",    type: "boolean",     def: "false", desc: "Uncontrolled initial open state." },
                { prop: "onOpenChange",   type: "(o) => void", def: "—",     desc: "Fires when open state changes." },
                { prop: "delayDuration",  type: "number",      def: "—",     desc: "Per-tooltip delay override (takes precedence over provider)." },
              ],
            },
            {
              component: "TooltipContent",
              props: [
                { prop: "side",         type: '"top" | "right" | "bottom" | "left"', def: '"top"',    desc: "Preferred side of the trigger to render." },
                { prop: "align",        type: '"start" | "center" | "end"',          def: '"center"', desc: "Alignment along the side axis." },
                { prop: "sideOffset",   type: "number",  def: "0",  desc: "Distance in px from the trigger." },
                { prop: "className",    type: "string",  def: "—",  desc: "Override bg-foreground for custom background colors. Also override [&_svg]:fill-{color} for the arrow." },
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
            Radix renders the tooltip with <code className="text-xs bg-muted px-1 rounded">role="tooltip"</code> and
            connects it to the trigger via <code className="text-xs bg-muted px-1 rounded">aria-describedby</code> automatically.
          </li>
          <li>
            <kbd className="text-xs bg-muted px-1 rounded">Tab</kbd> into a focusable trigger opens the tooltip;
            <kbd className="text-xs bg-muted px-1 rounded"> Esc</kbd> closes it without moving focus.
          </li>
          <li>
            <strong className="text-foreground">Tooltips must not contain interactive content</strong> (links, buttons). Use{" "}
            <code className="text-xs bg-muted px-1 rounded">Popover</code> for that.
          </li>
          <li>
            Keyboard shortcuts displayed in tooltips are purely informational — the actual{" "}
            shortcut handling must be wired up separately in <code className="text-xs bg-muted px-1 rounded">useEffect</code>.
          </li>
          <li>
            For icon-only buttons, always add <code className="text-xs bg-muted px-1 rounded">aria-label</code> to the
            trigger button in addition to the tooltip — the tooltip text is not guaranteed to be announced
            (it depends on AT settings).
          </li>
          <li>
            Disabled buttons don't fire pointer events — wrap in a{" "}
            <code className="text-xs bg-muted px-1 rounded">{"<span>"}</code> and add{" "}
            <code className="text-xs bg-muted px-1 rounded">pointer-events-none</code> to the button.
          </li>
        </ul>
      </Section>
    </div>
  )
}
