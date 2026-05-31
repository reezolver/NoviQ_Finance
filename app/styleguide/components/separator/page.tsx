"use client"

import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

/** Horizontal separator with centered label text */
function LabeledSeparator({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Separator className="flex-1" />
      <span className="shrink-0 text-xs font-medium text-muted-foreground">
        {children}
      </span>
      <Separator className="flex-1" />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SeparatorShowcasePage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Separator</h1>
            <Badge variant="secondary">radix-ui</Badge>
          </div>
          <p className="text-muted-foreground">
            A thin visual divider between sections or inline content.
            Supports horizontal and vertical orientations.
            Decorative by default (hidden from screen readers).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDark((d) => !d)}>
          {dark ? "☀ Light" : "☾ Dark"}
        </Button>
      </div>

      {/* ── ORIENTATION ── */}
      <Section title="Orientation">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Demo title='Horizontal (default)' description='orientation="horizontal" — full width, 1px tall'>
            <div className="flex flex-col gap-4 text-sm">
              <p className="font-medium">Seção A</p>
              <Separator />
              <p className="font-medium">Seção B</p>
              <Separator />
              <p className="font-medium">Seção C</p>
            </div>
          </Demo>

          <Demo title='Vertical' description='orientation="vertical" — 1px wide, stretches to parent height'>
            <div className="flex h-16 items-center gap-4 text-sm">
              <span className="font-medium">Receitas</span>
              <Separator orientation="vertical" />
              <span className="font-medium">Despesas</span>
              <Separator orientation="vertical" />
              <span className="font-medium">Saldo</span>
            </div>
          </Demo>
        </div>
      </Section>

      {/* ── LABELED SEPARATOR ── */}
      <Section title="With Label Text">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Demo title='"OU" divider — login pattern'>
            <div className="flex flex-col gap-4">
              <Button className="w-full">Entrar com e-mail</Button>
              <LabeledSeparator>OU</LabeledSeparator>
              <Button variant="outline" className="w-full">
                Continuar com Google
              </Button>
            </div>
          </Demo>

          <Demo title="Section heading divider">
            <div className="flex flex-col gap-4 text-sm">
              <LabeledSeparator>Dados pessoais</LabeledSeparator>
              <p className="text-muted-foreground">Nome, CPF, data de nascimento.</p>
              <LabeledSeparator>Dados financeiros</LabeledSeparator>
              <p className="text-muted-foreground">Renda mensal, dívidas, investimentos.</p>
            </div>
          </Demo>
        </div>
      </Section>

      {/* ── REAL-WORLD PATTERNS ── */}
      <Section title="Patterns">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Profile header */}
          <Demo title="Inline info row — vertical separators">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="size-10 rounded-full bg-primary/15 flex items-center justify-center font-semibold text-primary text-sm">
                  JS
                </div>
                <div>
                  <p className="text-sm font-semibold">João Silva</p>
                  <p className="text-xs text-muted-foreground">joao@email.com</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3 text-sm">
                <div className="text-center">
                  <p className="font-semibold">R$ 7.500</p>
                  <p className="text-xs text-muted-foreground">Renda</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-center">
                  <p className="font-semibold">72%</p>
                  <p className="text-xs text-muted-foreground">Reserva</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-center">
                  <p className="font-semibold text-success">Ótimo</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>
            </div>
          </Demo>

          {/* Menu list */}
          <Demo title="Navigation menu — between groups">
            <nav className="flex flex-col text-sm">
              {[
                { label: "Visão geral", icon: "📊" },
                { label: "Transações", icon: "💸" },
                { label: "Investimentos", icon: "📈" },
              ].map((item, i) => (
                <div key={item.label}>
                  {i > 0 && <Separator className="my-0.5" />}
                  <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-muted transition-colors text-left">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                </div>
              ))}
              <Separator className="my-2" />
              {[
                { label: "Configurações", icon: "⚙️" },
                { label: "Suporte", icon: "💬" },
              ].map((item, i) => (
                <div key={item.label}>
                  {i > 0 && <Separator className="my-0.5" />}
                  <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-muted transition-colors text-left text-muted-foreground">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                </div>
              ))}
            </nav>
          </Demo>

          {/* Card section dividers */}
          <Demo title="Card with internal section dividers">
            <div className="rounded-xl border overflow-hidden">
              <div className="p-4">
                <p className="text-sm font-semibold">Diagnóstico financeiro</p>
                <p className="text-xs text-muted-foreground mt-0.5">Atualizado em 28/05/2026</p>
              </div>
              <Separator />
              <div className="p-4 flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Renda líquida</span>
                  <span className="font-medium">R$ 7.500,00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total de despesas</span>
                  <span className="font-medium text-destructive">R$ 3.042,00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Investimentos</span>
                  <span className="font-medium text-primary">R$ 1.500,00</span>
                </div>
              </div>
              <Separator />
              <div className="p-4 flex justify-between items-center">
                <span className="text-sm font-semibold">Saldo disponível</span>
                <span className="text-sm font-bold text-success">R$ 2.958,00</span>
              </div>
            </div>
          </Demo>

          {/* Color variants */}
          <Demo
            title="Custom colors via className"
            description="Override bg-border with any color token."
          >
            <div className="flex flex-col gap-4">
              {[
                { label: "Default (border)",    cls: "",                 },
                { label: "Primary",             cls: "bg-primary"        },
                { label: "Success",             cls: "bg-success"        },
                { label: "Warning",             cls: "bg-warning"        },
                { label: "Destructive",         cls: "bg-destructive"    },
                { label: "Muted (subtle)",      cls: "bg-muted-foreground/20" },
              ].map(({ label, cls }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 text-xs text-muted-foreground">{label}</span>
                  <Separator className={cn("flex-1", cls)} />
                </div>
              ))}
            </div>
          </Demo>

        </div>
      </Section>

      {/* ── USAGE ── */}
      <Section title="Usage">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-1">Import</p>
            <CodeBlock code={`import { Separator } from "@/components/ui/separator"`} />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Horizontal (default)</p>
            <CodeBlock
              code={`<div className="flex flex-col gap-4">
  <p>Seção A</p>
  <Separator />
  <p>Seção B</p>
</div>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Vertical — inline content</p>
            <CodeBlock
              code={`<div className="flex h-5 items-center gap-3 text-sm">
  <span>Receitas</span>
  <Separator orientation="vertical" />
  <span>Despesas</span>
  <Separator orientation="vertical" />
  <span>Saldo</span>
</div>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Labeled "OU" divider — reusable pattern</p>
            <CodeBlock
              code={`function LabeledSeparator({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <Separator className="flex-1" />
      <span className="text-xs font-medium text-muted-foreground">{children}</span>
      <Separator className="flex-1" />
    </div>
  )
}

// Usage:
<LabeledSeparator>OU</LabeledSeparator>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Semantic separator (screen reader announced)</p>
            <CodeBlock
              code={`{/* decorative={false} makes it role="separator" — announced by screen readers */}
<Separator decorative={false} aria-orientation="horizontal" />`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Custom color</p>
            <CodeBlock
              code={`<Separator className="bg-primary" />
<Separator className="bg-success" />
<Separator className="bg-muted-foreground/20" />`}
            />
          </div>
        </div>
      </Section>

      {/* ── API ── */}
      <Section title="API">
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
              {[
                { prop: "orientation", type: '"horizontal" | "vertical"', def: '"horizontal"', desc: "Direction of the separator line." },
                { prop: "decorative",  type: "boolean",  def: "true",   desc: 'true = hidden from a11y tree (role="none"); false = role="separator" announced by screen readers.' },
                { prop: "className",   type: "string",   def: "—",      desc: "Override bg-border, thickness, or add custom spacing." },
              ].map((row) => (
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
      </Section>

      {/* ── ACCESSIBILITY ── */}
      <Section title="Accessibility">
        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li>
            By default, <code className="text-xs bg-muted px-1 rounded">decorative=true</code> renders
            with <code className="text-xs bg-muted px-1 rounded">role="none"</code> — the element is invisible
            to screen readers (appropriate for purely visual chrome).
          </li>
          <li>
            Set <code className="text-xs bg-muted px-1 rounded">decorative={"{false}"}</code> when the separator
            carries structural meaning (e.g., separating two distinct sections of a document).
            Radix will then render <code className="text-xs bg-muted px-1 rounded">role="separator"</code>,
            which screen readers announce as a thematic break.
          </li>
          <li>
            For vertical separators used semantically, also add{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-orientation="vertical"</code> so
            assistive technology correctly identifies the direction.
          </li>
          <li>
            Ensure sufficient color contrast between the separator and its background — the default{" "}
            <code className="text-xs bg-muted px-1 rounded">bg-border</code> token meets this at standard
            design densities.
          </li>
        </ul>
      </Section>
    </div>
  )
}
