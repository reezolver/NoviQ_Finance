"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// ─── Color swatch data ────────────────────────────────────────────────────────

const primaryScale = [
  { stop: 50,  css: "var(--primary-50)",  label: "50"  },
  { stop: 100, css: "var(--primary-100)", label: "100" },
  { stop: 200, css: "var(--primary-200)", label: "200" },
  { stop: 300, css: "var(--primary-300)", label: "300" },
  { stop: 400, css: "var(--primary-400)", label: "400" },
  { stop: 500, css: "var(--primary-500)", label: "500 — #008CFF", isMain: true },
  { stop: 600, css: "var(--primary-600)", label: "600" },
  { stop: 700, css: "var(--primary-700)", label: "700" },
  { stop: 800, css: "var(--primary-800)", label: "800" },
  { stop: 900, css: "var(--primary-900)", label: "900" },
]

const neutralScale = [
  { stop: 50,  css: "var(--neutral-50)",  label: "50"  },
  { stop: 100, css: "var(--neutral-100)", label: "100" },
  { stop: 200, css: "var(--neutral-200)", label: "200" },
  { stop: 300, css: "var(--neutral-300)", label: "300" },
  { stop: 400, css: "var(--neutral-400)", label: "400" },
  { stop: 500, css: "var(--neutral-500)", label: "500" },
  { stop: 600, css: "var(--neutral-600)", label: "600" },
  { stop: 700, css: "var(--neutral-700)", label: "700" },
  { stop: 800, css: "var(--neutral-800)", label: "800" },
  { stop: 900, css: "var(--neutral-900)", label: "900" },
]

const semanticColors = [
  { name: "Primary",     bg: "var(--primary)",     fg: "var(--primary-foreground)",     label: "#008CFF"  },
  { name: "Secondary",   bg: "var(--secondary)",   fg: "var(--secondary-foreground)",   label: "secondary" },
  { name: "Muted",       bg: "var(--muted)",       fg: "var(--muted-foreground)",        label: "muted"    },
  { name: "Accent",      bg: "var(--accent)",      fg: "var(--accent-foreground)",       label: "accent"   },
  { name: "Success",     bg: "var(--success)",     fg: "var(--success-foreground)",      label: "success"  },
  { name: "Warning",     bg: "var(--warning)",     fg: "var(--warning-foreground)",      label: "warning"  },
  { name: "Destructive", bg: "var(--destructive)", fg: "var(--destructive-foreground)",  label: "error"    },
  { name: "Info",        bg: "var(--info)",        fg: "var(--info-foreground)",         label: "info"     },
]

const chartColors = [
  { name: "Chart 1", css: "var(--chart-1)" },
  { name: "Chart 2", css: "var(--chart-2)" },
  { name: "Chart 3", css: "var(--chart-3)" },
  { name: "Chart 4", css: "var(--chart-4)" },
  { name: "Chart 5", css: "var(--chart-5)" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold mb-6 pb-2 border-b">{title}</h2>
      {children}
    </section>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        {title}
      </h3>
      {children}
    </div>
  )
}

function ColorSwatch({
  bg,
  label,
  isMain,
}: {
  bg: string
  label: string
  isMain?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-12 rounded-lg border border-black/5 shadow-sm"
        style={{ background: bg }}
      />
      <span className={`text-xs ${isMain ? "font-semibold text-primary" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StyleguidePage() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Design Tokens</h1>
          <p className="text-muted-foreground mt-1">
            Noviq Finance — Primary: <code className="text-primary font-mono">#008CFF</code> · Font: DM Sans
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDark((d) => !d)}
        >
          {dark ? "☀ Light Mode" : "☾ Dark Mode"}
        </Button>
      </div>

      {/* ── COLORS ── */}
      <Section title="Colors">
        <Subsection title="Primary Blue Scale">
          <div className="grid grid-cols-10 gap-2">
            {primaryScale.map((s) => (
              <ColorSwatch key={s.stop} bg={s.css} label={s.label} isMain={s.isMain} />
            ))}
          </div>
        </Subsection>

        <Subsection title="Neutral Grey Scale">
          <div className="grid grid-cols-10 gap-2">
            {neutralScale.map((s) => (
              <ColorSwatch key={s.stop} bg={s.css} label={s.label} />
            ))}
          </div>
        </Subsection>

        <Subsection title="Semantic Colors">
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {semanticColors.map((c) => (
              <div key={c.name} className="flex flex-col gap-1">
                <div
                  className="h-14 rounded-lg border border-black/5 shadow-sm flex items-end p-1.5"
                  style={{ background: c.bg }}
                >
                  <span className="text-[10px] font-medium leading-none" style={{ color: c.fg }}>
                    {c.label}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{c.name}</span>
              </div>
            ))}
          </div>
        </Subsection>

        <Subsection title="Chart Colors">
          <div className="flex gap-3">
            {chartColors.map((c) => (
              <div key={c.name} className="flex flex-col gap-1">
                <div
                  className="h-10 w-16 rounded-lg border border-black/5"
                  style={{ background: c.css }}
                />
                <span className="text-xs text-muted-foreground">{c.name}</span>
              </div>
            ))}
          </div>
        </Subsection>

        <Subsection title="UI Colors">
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "Background",    bg: "var(--background)",   border: true },
              { name: "Card",          bg: "var(--card)",          border: true },
              { name: "Popover",       bg: "var(--popover)",       border: true },
              { name: "Border",        bg: "var(--border)",        border: false },
              { name: "Input",         bg: "var(--input)",         border: false },
              { name: "Sidebar",       bg: "var(--sidebar)",       border: true },
            ].map((item) => (
              <div key={item.name} className="flex flex-col gap-1">
                <div
                  className="h-10 rounded-lg"
                  style={{
                    background: item.bg,
                    border: item.border ? "1px solid var(--border)" : `2px solid ${item.bg}`,
                  }}
                />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </Subsection>
      </Section>

      {/* ── TYPOGRAPHY ── */}
      <Section title="Typography">
        <Subsection title="DM Sans — Headings">
          <div className="flex flex-col gap-4">
            {[
              { size: "text-4xl", weight: "font-bold",     label: "Heading 1 — 36px Bold" },
              { size: "text-3xl", weight: "font-bold",     label: "Heading 2 — 30px Bold" },
              { size: "text-2xl", weight: "font-semibold", label: "Heading 3 — 24px SemiBold" },
              { size: "text-xl",  weight: "font-semibold", label: "Heading 4 — 20px SemiBold" },
              { size: "text-lg",  weight: "font-medium",   label: "Heading 5 — 18px Medium" },
              { size: "text-base",weight: "font-medium",   label: "Heading 6 — 16px Medium" },
            ].map((h) => (
              <div key={h.label} className="flex items-baseline gap-4">
                <span className={`${h.size} ${h.weight} min-w-0 flex-1`}>
                  Controle Total Das Suas Finanças
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{h.label}</span>
              </div>
            ))}
          </div>
        </Subsection>

        <Subsection title="DM Sans — Body">
          <div className="flex flex-col gap-3">
            {[
              { size: "text-base", weight: "font-normal",  label: "Body — 16px Regular" },
              { size: "text-base", weight: "font-medium",  label: "Body — 16px Medium" },
              { size: "text-sm",   weight: "font-normal",  label: "Small — 14px Regular" },
              { size: "text-sm",   weight: "font-medium",  label: "Small — 14px Medium" },
              { size: "text-xs",   weight: "font-normal",  label: "Caption — 12px Regular" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-4">
                <span className={`${b.size} ${b.weight} flex-1`}>
                  A plataforma financeira mais completa do Brasil para você alcançar a liberdade financeira.
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{b.label}</span>
              </div>
            ))}
          </div>
        </Subsection>

        <Subsection title="Text Colors">
          <div className="flex flex-col gap-2">
            <p className="text-foreground font-medium">Foreground — primary text color</p>
            <p className="text-muted-foreground">Muted Foreground — secondary text color</p>
            <p className="text-primary font-medium">Primary — brand blue #008CFF</p>
            <p className="text-destructive">Destructive — error / danger text</p>
            <p className="text-success font-medium">Success — positive feedback</p>
            <p className="text-warning font-medium">Warning — caution feedback</p>
          </div>
        </Subsection>
      </Section>

      {/* ── SPACING & BORDER RADIUS ── */}
      <Section title="Border Radius">
        <div className="flex flex-wrap gap-6 items-end">
          {[
            { label: "sm",   cls: "rounded-sm"  },
            { label: "md",   cls: "rounded-md"  },
            { label: "lg",   cls: "rounded-lg"  },
            { label: "xl",   cls: "rounded-xl"  },
            { label: "2xl",  cls: "rounded-2xl" },
            { label: "3xl",  cls: "rounded-3xl" },
            { label: "full", cls: "rounded-full" },
          ].map((r) => (
            <div key={r.label} className="flex flex-col items-center gap-2">
              <div
                className={`w-16 h-16 bg-primary/20 border-2 border-primary/40 ${r.cls}`}
              />
              <span className="text-xs text-muted-foreground">{r.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── SHADOWS ── */}
      <Section title="Shadows">
        <div className="flex flex-wrap gap-6 items-end">
          {[
            { label: "none",  cls: "shadow-none"  },
            { label: "sm",    cls: "shadow-sm"    },
            { label: "md",    cls: "shadow-md"    },
            { label: "lg",    cls: "shadow-lg"    },
            { label: "xl",    cls: "shadow-xl"    },
            { label: "2xl",   cls: "shadow-2xl"   },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <div
                className={`w-20 h-16 bg-card border border-border rounded-xl ${s.cls}`}
              />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── BUTTONS ── */}
      <Section title="Buttons">
        <Subsection title="Variants">
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </Subsection>

        <Subsection title="Sizes">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </Subsection>

        <Subsection title="States">
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Default</Button>
            <Button variant="default" disabled>Disabled</Button>
            <Button variant="outline" disabled>Disabled Outline</Button>
          </div>
        </Subsection>
      </Section>

      {/* ── BADGES ── */}
      <Section title="Badges">
        <div className="flex flex-wrap gap-3">
          <Badge variant="default">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="ghost">Ghost</Badge>
        </div>
      </Section>

      {/* ── ALERTS ── */}
      <Section title="Alerts">
        <div className="flex flex-col gap-3">
          <Alert>
            <AlertTitle>Informação</AlertTitle>
            <AlertDescription>
              Seu diagnóstico financeiro está disponível. Acesse agora para conferir.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              Encontramos inconsistências nos seus dados. Por favor, revise as informações.
            </AlertDescription>
          </Alert>
        </div>
      </Section>

      {/* ── CARDS ── */}
      <Section title="Cards">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico Financeiro</CardTitle>
              <CardDescription>Análise completa da sua situação atual</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Identifique seus gastos, receitas e oportunidades de melhora em 3 passos simples.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Iniciar diagnóstico</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metas de Investimento</CardTitle>
              <CardDescription>
                <Badge variant="default" className="mr-1">Ativo</Badge>
                3 metas em andamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span>Reserva de emergência</span>
                  <span className="font-medium text-success">72%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[72%] bg-success rounded-full" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">Ver todas as metas</Button>
            </CardFooter>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Card — Small</CardTitle>
              <CardDescription>Variante compacta para listas e dashboards</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use <code className="text-primary font-mono text-xs">size=&quot;sm&quot;</code> para uma versão mais compacta.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* ── INPUT ── */}
      <Section title="Input">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">E-mail</label>
            <Input type="email" placeholder="seunome@email.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Senha</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Desabilitado</label>
            <Input placeholder="Campo desabilitado" disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-destructive">Erro</label>
            <Input placeholder="Valor inválido" aria-invalid="true" />
          </div>
        </div>
      </Section>

      {/* ── RADIO GROUP ── */}
      <Section title="Radio Group">
        <div className="flex flex-col gap-3 max-w-xs">
          <RadioGroup defaultValue="monthly">
            {[
              { value: "monthly",   label: "Mensal" },
              { value: "quarterly", label: "Trimestral" },
              { value: "yearly",    label: "Anual" },
            ].map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <RadioGroupItem value={opt.value} id={`radio-${opt.value}`} />
                <label
                  htmlFor={`radio-${opt.value}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {opt.label}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </Section>
    </div>
  )
}
