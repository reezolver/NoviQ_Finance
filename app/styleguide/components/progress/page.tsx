"use client"

import { useEffect, useRef, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { ProgressBar } from "@/components/ProgressBar"
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

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto text-muted-foreground mt-3 leading-relaxed">
      <code>{code}</code>
    </pre>
  )
}

function LabeledProgress({
  label,
  value,
  sublabel,
  className,
  barClassName,
}: {
  label: string
  value: number
  sublabel?: string
  className?: string
  barClassName?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground tabular-nums">{value}%</span>
      </div>
      {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      <Progress value={value} className={cn("h-2", barClassName)} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProgressShowcasePage() {
  const [dark, setDark] = useState(false)
  const [liveValue, setLiveValue] = useState(40)
  const [animating, setAnimating] = useState(false)
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  useEffect(() => () => { if (rafRef.current) clearTimeout(rafRef.current) }, [])

  function runAnimation() {
    setAnimating(true)
    setLiveValue(0)
    let v = 0
    const step = () => {
      v = Math.min(v + 2, 100)
      setLiveValue(v)
      if (v < 100) {
        rafRef.current = setTimeout(step, 30)
      } else {
        setAnimating(false)
      }
    }
    rafRef.current = setTimeout(step, 30)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
            <Badge variant="secondary">radix-ui</Badge>
          </div>
          <p className="text-muted-foreground">
            Displays a progress bar indicating completion of a task or amount.
            Base component is a single thin track — extend via{" "}
            <code className="text-xs bg-muted px-1 rounded">className</code> or use the{" "}
            <code className="text-xs bg-muted px-1 rounded">ProgressBar</code> wrapper for variant + size props.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDark((d) => !d)}>
          {dark ? "☀ Light" : "☾ Dark"}
        </Button>
      </div>

      {/* ── VALUES ── */}
      <Section title="Values (base Progress)">
        <div className="flex flex-col gap-5">
          {[0, 25, 50, 75, 100].map((v) => (
            <div key={v} className="flex items-center gap-4">
              <span className="w-10 shrink-0 text-sm tabular-nums text-muted-foreground text-right">
                {v}%
              </span>
              <Progress value={v} className="h-2 flex-1" />
            </div>
          ))}
          <div className="flex items-center gap-4">
            <span className="w-10 shrink-0 text-sm text-muted-foreground text-right">—</span>
            <div className="flex-1">
              <Progress
                value={undefined}
                className="h-2 [&_[data-slot=progress-indicator]]:animate-pulse"
              />
            </div>
            <span className="text-xs text-muted-foreground">indeterminate / loading</span>
          </div>
        </div>
      </Section>

      {/* ── SIZES ── */}
      <Section title="Sizes (ProgressBar wrapper)">
        <div className="flex flex-col gap-5">
          {(["xs", "sm", "default", "lg"] as const).map((size) => (
            <div key={size} className="flex items-center gap-4">
              <span className="w-16 shrink-0 text-sm text-muted-foreground font-mono">{size}</span>
              <ProgressBar value={66} size={size} className="flex-1" />
            </div>
          ))}
        </div>
      </Section>

      {/* ── COLOR VARIANTS ── */}
      <Section title="Color Variants (ProgressBar wrapper)">
        <div className="flex flex-col gap-5">
          {(["default", "success", "warning", "destructive", "info"] as const).map((variant) => (
            <div key={variant} className="flex items-center gap-4">
              <span className="w-24 shrink-0 text-sm text-muted-foreground font-mono">{variant}</span>
              <ProgressBar value={70} variant={variant} size="default" className="flex-1" />
            </div>
          ))}
        </div>
      </Section>

      {/* ── INTERACTIVE ── */}
      <Section title="Interactive Demo">
        <div className="max-w-md space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={100}
              value={liveValue}
              onChange={(e) => setLiveValue(Number(e.target.value))}
              className="flex-1 accent-primary"
              aria-label="Progress value slider"
            />
            <span className="w-10 text-right tabular-nums text-sm font-medium">
              {liveValue}%
            </span>
          </div>
          <ProgressBar
            value={liveValue}
            size="default"
            variant={
              liveValue < 30 ? "destructive"
              : liveValue < 60 ? "warning"
              : liveValue < 90 ? "default"
              : "success"
            }
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={runAnimation} disabled={animating}>
              {animating ? "Animando…" : "Animar até 100%"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setLiveValue(0)}>
              Resetar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            A cor muda automaticamente com base no valor:
            vermelho &lt; 30%, amarelo &lt; 60%, azul &lt; 90%, verde ≥ 90%.
          </p>
        </div>
      </Section>

      {/* ── LABELED PATTERNS ── */}
      <Section title="Labeled Progress — Financial Context">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Goals */}
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <p className="text-sm font-semibold">Metas financeiras</p>
            <LabeledProgress
              label="Reserva de emergência"
              value={72}
              sublabel="R$ 10.800 de R$ 15.000"
              barClassName="[&_[data-slot=progress-indicator]]:bg-success"
            />
            <LabeledProgress
              label="Viagem Europa"
              value={38}
              sublabel="R$ 3.800 de R$ 10.000"
            />
            <LabeledProgress
              label="Entrada do apartamento"
              value={15}
              sublabel="R$ 15.000 de R$ 100.000"
              barClassName="[&_[data-slot=progress-indicator]]:bg-warning"
            />
          </div>

          {/* Budget */}
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <p className="text-sm font-semibold">Orçamento — Maio 2026</p>
            {[
              { label: "Alimentação", used: 432, total: 600  },
              { label: "Transporte",  used: 280, total: 300  },
              { label: "Lazer",       used: 180, total: 200  },
              { label: "Saúde",       used: 350, total: 300  },
            ].map((item) => {
              const pct = Math.min(Math.round((item.used / item.total) * 100), 100)
              const over = item.used > item.total
              return (
                <div key={item.label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className={cn(
                      "text-xs tabular-nums",
                      over ? "text-destructive font-semibold" : "text-muted-foreground"
                    )}>
                      R$ {item.used} / R$ {item.total}
                      {over && " ⚠"}
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className={cn(
                      "h-2",
                      over && "[&_[data-slot=progress-indicator]]:bg-destructive"
                    )}
                  />
                </div>
              )
            })}
          </div>

          {/* Onboarding steps */}
          <div className="rounded-lg border bg-card p-5 space-y-3 sm:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Conclusão do perfil</p>
              <Badge variant="secondary">3 de 5 etapas</Badge>
            </div>
            <ProgressBar value={60} variant="info" size="default" />
            <div className="grid grid-cols-5 gap-1 mt-1">
              {[
                { label: "Dados pessoais",  done: true  },
                { label: "Renda",           done: true  },
                { label: "Objetivos",       done: true  },
                { label: "Dívidas",         done: false },
                { label: "Investimentos",   done: false },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-1 text-center">
                  <div className={cn(
                    "size-6 rounded-full flex items-center justify-center text-xs font-semibold",
                    step.done
                      ? "bg-info text-white"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {step.done ? "✓" : i + 1}
                  </div>
                  <span className="text-[10px] leading-tight text-muted-foreground">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </Section>

      {/* ── USAGE ── */}
      <Section title="Usage">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-1">Import</p>
            <CodeBlock
              code={`// Base component (single prop: value)
import { Progress } from "@/components/ui/progress"

// Wrapper with variant + size props
import { ProgressBar } from "@/components/ProgressBar"`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Base Progress</p>
            <CodeBlock
              code={`{/* Default h-1 track, primary indicator */}
<Progress value={75} />

{/* Override height */}
<Progress value={75} className="h-2" />

{/* Override indicator color via child selector */}
<Progress
  value={75}
  className="h-2 [&_[data-slot=progress-indicator]]:bg-success"
/>

{/* Indeterminate — omit value or pass undefined */}
<Progress className="h-2" />`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">ProgressBar wrapper (variant + size)</p>
            <CodeBlock
              code={`<ProgressBar value={75} variant="success" size="default" />
<ProgressBar value={40} variant="warning" size="sm" />
<ProgressBar value={90} variant="destructive" size="lg" />

{/* Variants: "default" | "success" | "warning" | "destructive" | "info" */}
{/* Sizes:    "xs" | "sm" | "default" | "lg"                             */}`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Animated progress</p>
            <CodeBlock
              code={`const [value, setValue] = useState(0)

useEffect(() => {
  const timer = setTimeout(() => setValue(75), 300)
  return () => clearTimeout(timer)
}, [])

<Progress value={value} className="h-2 transition-all duration-700" />`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">With label + percentage</p>
            <CodeBlock
              code={`<div className="flex flex-col gap-1.5">
  <div className="flex justify-between text-sm">
    <span className="font-medium">Reserva de emergência</span>
    <span className="text-muted-foreground tabular-nums">{value}%</span>
  </div>
  <Progress value={value} className="h-2" />
  <p className="text-xs text-muted-foreground">R$ 10.800 de R$ 15.000</p>
</div>`}
            />
          </div>
        </div>
      </Section>

      {/* ── API TABLE ── */}
      <Section title="API">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-2">
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">Progress</code> (base)
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
                  {[
                    { prop: "value",     type: "number | null",  def: "—",    desc: "0–100. null or undefined = indeterminate state." },
                    { prop: "max",       type: "number",         def: "100",  desc: "Maximum value (Radix prop)." },
                    { prop: "className", type: "string",         def: "—",    desc: "Applied to the track root. Use to override h-1 and track bg." },
                  ].map((row) => (
                    <tr key={row.prop} className="border-b last:border-0">
                      <td className="py-2 pr-6"><code className="text-xs text-foreground bg-muted px-1 py-0.5 rounded">{row.prop}</code></td>
                      <td className="py-2 pr-6 text-xs font-mono">{row.type}</td>
                      <td className="py-2 pr-6 text-xs font-mono">{row.def}</td>
                      <td className="py-2 text-xs">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">ProgressBar</code> (wrapper)
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
                  {[
                    { prop: "variant", type: '"default" | "success" | "warning" | "destructive" | "info"', def: '"default"', desc: "Sets the indicator fill color." },
                    { prop: "size",    type: '"xs" | "sm" | "default" | "lg"',                            def: '"default"', desc: "Track height: 2px / 4px / 8px / 12px." },
                    { prop: "...props", type: "Progress props",                                           def: "—",         desc: "All Progress props (value, className, etc.)." },
                  ].map((row) => (
                    <tr key={row.prop} className="border-b last:border-0">
                      <td className="py-2 pr-6"><code className="text-xs text-foreground bg-muted px-1 py-0.5 rounded">{row.prop}</code></td>
                      <td className="py-2 pr-6 text-xs font-mono">{row.type}</td>
                      <td className="py-2 pr-6 text-xs font-mono">{row.def}</td>
                      <td className="py-2 text-xs">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Section>

      {/* ── ACCESSIBILITY ── */}
      <Section title="Accessibility">
        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li>
            Radix renders <code className="text-xs bg-muted px-1 rounded">role=&quot;progressbar&quot;</code>,{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-valuemin=&quot;0&quot;</code>,{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-valuemax</code>, and{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-valuenow</code> automatically from the{" "}
            <code className="text-xs bg-muted px-1 rounded">value</code> prop.
          </li>
          <li>
            Always provide an <code className="text-xs bg-muted px-1 rounded">aria-label</code> or{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-labelledby</code> so screen readers announce
            what the bar represents (e.g. &quot;Progresso de preenchimento do perfil&quot;).
          </li>
          <li>
            When <code className="text-xs bg-muted px-1 rounded">value</code> is{" "}
            <code className="text-xs bg-muted px-1 rounded">null</code> / undefined, Radix sets{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-valuetext=&quot;indeterminate&quot;</code> and removes{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-valuenow</code>.
          </li>
          <li>
            Color alone should not be the only indicator of meaning — pair color variants with
            percentage labels or descriptive text (especially for warning/destructive states).
          </li>
        </ul>
      </Section>
    </div>
  )
}
