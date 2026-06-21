"use client"

import { useEffect, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })

// Cada linha do orçamento mantém seu próprio estado — extraída em componente
// para que `useState` rode no topo de um componente (não dentro de um `.map`).
function BudgetRow({
  label,
  defaultVal,
  max,
  color,
}: {
  label: string
  defaultVal: number
  max: number
  color: string
}) {
  const [val, setVal] = useState([defaultVal])
  return (
    <div className="grid grid-cols-[120px_1fr_80px] items-center gap-4">
      <Label className="text-sm">{label}</Label>
      <Slider
        value={val}
        onValueChange={setVal}
        min={0}
        max={max}
        step={50}
        className={color}
      />
      <span className="text-right text-xs font-mono tabular-nums text-muted-foreground">
        {brl(val[0])}
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SliderShowcasePage() {
  const [dark, setDark] = useState(false)

  // Single sliders
  const [budget, setBudget]           = useState([1500])
  const [risk, setRisk]               = useState([6])
  const [savingsRate, setSavingsRate] = useState([20])

  // Range sliders
  const [incomeRange, setIncomeRange]   = useState([3000, 10000])
  const [ageRange, setAgeRange]         = useState([25, 45])
  const [investRange, setInvestRange]   = useState([500, 3000])

  // Vertical
  const [allocation, setAllocation] = useState([60])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  const riskLabel = (v: number) => {
    if (v <= 3)  return { label: "Conservador",  color: "text-success"     }
    if (v <= 6)  return { label: "Moderado",      color: "text-warning"     }
    return             { label: "Arrojado",       color: "text-destructive" }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">Slider</h1>
            <Badge variant="secondary">radix-ui</Badge>
          </div>
          <p className="text-muted-foreground">
            Range input for selecting a single value or a range between two values.
            Supports single and range (dual thumb) modes and vertical orientation.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDark((d) => !d)}>
          {dark ? "☀ Light" : "☾ Dark"}
        </Button>
      </div>

      {/* ── SINGLE VALUE ── */}
      <Section title="Single Value">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Demo title="Uncontrolled — defaultValue">
            <Slider defaultValue={[40]} />
          </Demo>

          <Demo title="Controlled — with live readout">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <Label>Valor</Label>
                <span className="font-mono tabular-nums">{savingsRate[0]}%</span>
              </div>
              <Slider
                value={savingsRate}
                onValueChange={setSavingsRate}
                min={0}
                max={100}
                step={1}
              />
            </div>
          </Demo>

          <Demo title="Disabled">
            <Slider defaultValue={[65]} disabled />
          </Demo>

          <Demo title="Custom step (step=5)">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <Label>Passo de 5</Label>
                <span className="font-mono tabular-nums">{budget[0]}%</span>
              </div>
              <Slider
                value={budget}
                onValueChange={setBudget}
                min={0}
                max={100}
                step={5}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                {[0, 25, 50, 75, 100].map((v) => (
                  <span key={v}>{v}</span>
                ))}
              </div>
            </div>
          </Demo>
        </div>
      </Section>

      {/* ── RANGE (DUAL THUMB) ── */}
      <Section title="Range (Dual Thumb)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Demo
            title="Income filter"
            description="Pass an array with two values for a range slider."
          >
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <Label>Faixa de renda</Label>
                <span className="font-mono tabular-nums text-xs">
                  {brl(incomeRange[0])} – {brl(incomeRange[1])}
                </span>
              </div>
              <Slider
                value={incomeRange}
                onValueChange={setIncomeRange}
                min={0}
                max={20000}
                step={500}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>R$ 0</span>
                <span>R$ 20k</span>
              </div>
            </div>
          </Demo>

          <Demo title="Age range filter">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <Label>Faixa etária</Label>
                <span className="font-mono tabular-nums text-xs">
                  {ageRange[0]} – {ageRange[1]} anos
                </span>
              </div>
              <Slider
                value={ageRange}
                onValueChange={setAgeRange}
                min={18}
                max={70}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>18</span>
                <span>70</span>
              </div>
            </div>
          </Demo>

          <Demo title="Investment range">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <Label>Aporte mensal</Label>
                <span className="font-mono tabular-nums text-xs">
                  {brl(investRange[0])} – {brl(investRange[1])}
                </span>
              </div>
              <Slider
                value={investRange}
                onValueChange={setInvestRange}
                min={0}
                max={5000}
                step={100}
              />
            </div>
          </Demo>

          <Demo title="Range — disabled">
            <Slider defaultValue={[20, 70]} disabled />
          </Demo>
        </div>
      </Section>

      {/* ── VERTICAL ── */}
      <Section title="Vertical Orientation">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Demo title='orientation="vertical"'>
            <div className="flex items-end gap-6 h-40 pl-2">
              {["Ações", "FIIs", "RF", "Cripto"].map((label, i) => {
                const values = [60, 45, 80, 20]
                return (
                  <div key={label} className="flex flex-col items-center gap-2 h-full">
                    <Slider
                      orientation="vertical"
                      defaultValue={[values[i]]}
                      className="h-full"
                    />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                )
              })}
            </div>
          </Demo>

          <Demo title="Vertical controlled — portfolio allocation">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <Label>Renda variável</Label>
                <span className="font-mono tabular-nums">{allocation[0]}%</span>
              </div>
              <div className="flex gap-6 h-36">
                <Slider
                  orientation="vertical"
                  value={allocation}
                  onValueChange={setAllocation}
                  className="h-full"
                />
                <div className="flex flex-col justify-between text-xs text-muted-foreground h-36">
                  <span>100%</span>
                  <span>50%</span>
                  <span>0%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-primary/10 p-2 text-center">
                  <p className="font-semibold text-primary">{allocation[0]}%</p>
                  <p className="text-xs text-muted-foreground">Renda variável</p>
                </div>
                <div className="rounded-md bg-muted p-2 text-center">
                  <p className="font-semibold">{100 - allocation[0]}%</p>
                  <p className="text-xs text-muted-foreground">Renda fixa</p>
                </div>
              </div>
            </div>
          </Demo>
        </div>
      </Section>

      {/* ── FINANCIAL USE CASES ── */}
      <Section title="Financial Context Examples">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Risk tolerance */}
          <Demo title="Risk tolerance (1–10)">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <Label>Tolerância ao risco</Label>
                <span className={cn("text-sm font-semibold tabular-nums", riskLabel(risk[0]).color)}>
                  {risk[0]}/10 — {riskLabel(risk[0]).label}
                </span>
              </div>
              <Slider
                value={risk}
                onValueChange={setRisk}
                min={1}
                max={10}
                step={1}
                className={cn(
                  risk[0] <= 3
                    ? "[&_[data-slot=slider-range]]:bg-success"
                    : risk[0] <= 6
                    ? "[&_[data-slot=slider-range]]:bg-warning"
                    : "[&_[data-slot=slider-range]]:bg-destructive"
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 — Conservador</span>
                <span>10 — Arrojado</span>
              </div>
            </div>
          </Demo>

          {/* Savings rate */}
          <Demo title="Savings rate goal">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-baseline">
                <Label>Meta de poupança</Label>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary tabular-nums">
                    {savingsRate[0]}%
                  </span>
                  <p className="text-xs text-muted-foreground">
                    ≈ {brl((7500 * savingsRate[0]) / 100)}/mês
                  </p>
                </div>
              </div>
              <Slider
                value={savingsRate}
                onValueChange={setSavingsRate}
                min={0}
                max={80}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span className={savingsRate[0] >= 20 ? "text-success font-medium" : ""}>
                  {savingsRate[0] >= 20 ? "✓ Meta atingida" : "Meta: 20%"}
                </span>
                <span>80%</span>
              </div>
            </div>
          </Demo>

          {/* Budget slider with color override */}
          <Demo title="Monthly budget allocation" className="sm:col-span-2">
            <div className="flex flex-col gap-4">
              {[
                { label: "Moradia",    defaultVal: 1800, max: 3000, color: "[&_[data-slot=slider-range]]:bg-chart-1" },
                { label: "Alimentação",defaultVal: 600,  max: 1500, color: "[&_[data-slot=slider-range]]:bg-chart-2" },
                { label: "Transporte", defaultVal: 300,  max: 800,  color: "[&_[data-slot=slider-range]]:bg-chart-3" },
                { label: "Lazer",      defaultVal: 200,  max: 600,  color: "[&_[data-slot=slider-range]]:bg-chart-4" },
              ].map((item) => (
                <BudgetRow key={item.label} {...item} />
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
            <CodeBlock code={`import { Slider } from "@/components/ui/slider"`} />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Single value (controlled)</p>
            <CodeBlock
              code={`const [value, setValue] = useState([50])

<Slider
  value={value}
  onValueChange={setValue}
  min={0}
  max={100}
  step={1}
/>

{/* Current value: {value[0]} */}`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Range slider (two thumbs)</p>
            <CodeBlock
              code={`const [range, setRange] = useState([2000, 8000])

<Slider
  value={range}
  onValueChange={setRange}
  min={0}
  max={20000}
  step={500}
/>

{/* {range[0]} – {range[1]} */}`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Vertical orientation</p>
            <CodeBlock
              code={`<div className="h-40">
  <Slider
    orientation="vertical"
    defaultValue={[60]}
    className="h-full"
  />
</div>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Custom track/range color via child selector</p>
            <CodeBlock
              code={`{/* Override the primary blue range fill */}
<Slider
  defaultValue={[70]}
  className="[&_[data-slot=slider-range]]:bg-success"
/>

{/* Thumb color */}
<Slider
  defaultValue={[40]}
  className="[&_[data-slot=slider-thumb]]:border-destructive"
/>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Uncontrolled with defaultValue</p>
            <CodeBlock
              code={`{/* No state needed — Radix manages it internally */}
<Slider defaultValue={[30]} min={0} max={100} step={5} />`}
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
                { prop: "value",           type: "number[]",                         def: "—",             desc: "Controlled value(s). Single=[50], Range=[20, 80]." },
                { prop: "defaultValue",    type: "number[]",                         def: "—",             desc: "Uncontrolled initial value." },
                { prop: "onValueChange",   type: "(v: number[]) => void",            def: "—",             desc: "Fires on every change (during drag)." },
                { prop: "onValueCommit",   type: "(v: number[]) => void",            def: "—",             desc: "Fires only on pointer release / key up." },
                { prop: "min",             type: "number",                           def: "0",             desc: "Minimum allowed value." },
                { prop: "max",             type: "number",                           def: "100",           desc: "Maximum allowed value." },
                { prop: "step",            type: "number",                           def: "1",             desc: "Increment between values." },
                { prop: "orientation",     type: '"horizontal" | "vertical"',        def: '"horizontal"',  desc: "Axis of the slider." },
                { prop: "disabled",        type: "boolean",                          def: "false",         desc: "Prevents interaction; renders at 50% opacity." },
                { prop: "minStepsBetweenThumbs", type: "number",                    def: "0",             desc: "Minimum steps required between two thumbs (range mode)." },
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
            Radix renders each thumb as <code className="text-xs bg-muted px-1 rounded">role=&quot;slider&quot;</code> with{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-valuemin</code>,{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-valuemax</code>, and{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-valuenow</code> automatically.
          </li>
          <li>
            Keyboard: <kbd className="text-xs bg-muted px-1 rounded">←</kbd>{" "}
            <kbd className="text-xs bg-muted px-1 rounded">→</kbd> (or <kbd className="text-xs bg-muted px-1 rounded">↑</kbd>{" "}
            <kbd className="text-xs bg-muted px-1 rounded">↓</kbd> vertical) move by <code className="text-xs bg-muted px-1 rounded">step</code>;{" "}
            <kbd className="text-xs bg-muted px-1 rounded">Page Up/Down</kbd> by 10× step;{" "}
            <kbd className="text-xs bg-muted px-1 rounded">Home</kbd> /{" "}
            <kbd className="text-xs bg-muted px-1 rounded">End</kbd> jump to min/max.
          </li>
          <li>
            Always pair with a <code className="text-xs bg-muted px-1 rounded">{"<Label>"}</code> and add{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-label</code> directly on the{" "}
            <code className="text-xs bg-muted px-1 rounded">Slider</code> if no visible label is present.
          </li>
          <li>
            For range sliders, provide meaningful labels per thumb via{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-label</code> on each{" "}
            <code className="text-xs bg-muted px-1 rounded">SliderPrimitive.Thumb</code> — the base component uses index-based rendering so both thumbs share the same accessible name unless customized.
          </li>
          <li>
            Use <code className="text-xs bg-muted px-1 rounded">onValueCommit</code> (fires on release) rather than{" "}
            <code className="text-xs bg-muted px-1 rounded">onValueChange</code> for expensive operations like API calls.
          </li>
        </ul>
      </Section>
    </div>
  )
}
