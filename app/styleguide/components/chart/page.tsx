"use client"

import { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// ─── Shared helpers ───────────────────────────────────────────────────────────

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

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })

// ─── Data & configs ───────────────────────────────────────────────────────────

const monthlyData = [
  { month: "Jan", income: 7500,  expenses: 3200, savings: 4300 },
  { month: "Fev", income: 7500,  expenses: 3500, savings: 4000 },
  { month: "Mar", income: 8200,  expenses: 3100, savings: 5100 },
  { month: "Abr", income: 7500,  expenses: 4100, savings: 3400 },
  { month: "Mai", income: 8700,  expenses: 3300, savings: 5400 },
  { month: "Jun", income: 7500,  expenses: 3600, savings: 3900 },
  { month: "Jul", income: 9100,  expenses: 3200, savings: 5900 },
  { month: "Ago", income: 7500,  expenses: 3400, savings: 4100 },
  { month: "Set", income: 7500,  expenses: 3700, savings: 3800 },
  { month: "Out", income: 8500,  expenses: 3300, savings: 5200 },
  { month: "Nov", income: 7500,  expenses: 3900, savings: 3600 },
  { month: "Dez", income: 12000, expenses: 5200, savings: 6800 },
]

const balanceConfig: ChartConfig = {
  income:   { label: "Receitas",   color: "var(--color-success)"     },
  expenses: { label: "Despesas",   color: "var(--color-destructive)" },
  savings:  { label: "Poupança",   color: "var(--color-primary)"     },
}

const portfolioData = [
  { month: "Jan", value: 25000 },
  { month: "Fev", value: 26200 },
  { month: "Mar", value: 28100 },
  { month: "Abr", value: 27400 },
  { month: "Mai", value: 29800 },
  { month: "Jun", value: 31200 },
  { month: "Jul", value: 33500 },
  { month: "Ago", value: 32100 },
  { month: "Set", value: 34600 },
  { month: "Out", value: 36900 },
  { month: "Nov", value: 35800 },
  { month: "Dez", value: 38700 },
]

const portfolioConfig: ChartConfig = {
  value: { label: "Patrimônio", color: "var(--color-primary)" },
}

const expenseCategories = [
  { name: "Moradia",      value: 1800, key: "moradia"      },
  { name: "Alimentação",  value: 650,  key: "alimentacao"  },
  { name: "Transporte",   value: 320,  key: "transporte"   },
  { name: "Saúde",        value: 350,  key: "saude"        },
  { name: "Lazer",        value: 280,  key: "lazer"        },
  { name: "Outros",       value: 200,  key: "outros"       },
]

const expenseConfig: ChartConfig = {
  moradia:     { label: "Moradia",      color: "var(--color-chart-1)" },
  alimentacao: { label: "Alimentação",  color: "var(--color-chart-2)" },
  transporte:  { label: "Transporte",   color: "var(--color-chart-3)" },
  saude:       { label: "Saúde",        color: "var(--color-chart-4)" },
  lazer:       { label: "Lazer",        color: "var(--color-chart-5)" },
  outros:      { label: "Outros",       color: "var(--color-muted-foreground)" },
}

const goalsData = [
  { name: "Reserva",     value: 72,  fill: "var(--color-success)"  },
  { name: "Viagem",      value: 38,  fill: "var(--color-primary)"  },
  { name: "Apto",        value: 15,  fill: "var(--color-warning)"  },
]

const goalsConfig: ChartConfig = {
  value: { label: "Progresso (%)" },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChartShowcasePage() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">Chart</h1>
            <Badge variant="secondary">recharts</Badge>
          </div>
          <p className="text-muted-foreground">
            Accessible, theme-aware charts via{" "}
            <code className="text-xs bg-muted px-1 rounded">ChartContainer</code> (wraps Recharts).
            Colors are driven by a <code className="text-xs bg-muted px-1 rounded">ChartConfig</code> that
            injects CSS custom properties per container.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDark((d) => !d)}>
          {dark ? "☀ Light" : "☾ Dark"}
        </Button>
      </div>

      {/* ── LINE CHART ── */}
      <Section title="Line Chart — Income vs Expenses vs Savings">
        <Card>
          <CardHeader>
            <CardTitle>Receitas, Despesas & Poupança</CardTitle>
            <CardDescription>Janeiro – Dezembro 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={balanceConfig} className="h-72 w-full">
              <LineChart data={monthlyData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        brl(typeof value === "number" ? value : 0)
                      }
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="var(--color-income)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="var(--color-expenses)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="var(--color-savings)"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 2"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </Section>

      {/* ── BAR CHART ── */}
      <Section title="Bar Chart — Monthly Income vs Expenses">
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
            <CardDescription>Comparativo mensal — 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                income:   { label: "Receitas",  color: "var(--color-success)"     },
                expenses: { label: "Despesas",  color: "var(--color-destructive)" },
              }}
              className="h-72 w-full"
            >
              <BarChart data={monthlyData} barGap={4} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        brl(typeof value === "number" ? value : 0)
                      }
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="income"   fill="var(--color-income)"   radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </Section>

      {/* ── AREA CHART ── */}
      <Section title="Area Chart — Portfolio Growth">
        <Card>
          <CardHeader>
            <CardTitle>Crescimento do Patrimônio</CardTitle>
            <CardDescription>Total investido — Janeiro a Dezembro 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={portfolioConfig} className="h-64 w-full">
              <AreaChart data={portfolioData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-value)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        brl(typeof value === "number" ? value : 0)
                      }
                      indicator="line"
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </Section>

      {/* ── PIE CHART ── */}
      <Section title="Pie Chart — Expense Breakdown">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Despesas</CardTitle>
            <CardDescription>Por categoria — Maio 2025</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ChartContainer config={expenseConfig} className="h-64 w-full max-w-sm">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        brl(typeof value === "number" ? value : 0)
                      }
                      hideLabel
                    />
                  }
                />
                <Pie
                  data={expenseCategories}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={96}
                  innerRadius={48}
                  paddingAngle={3}
                >
                  {expenseCategories.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={expenseConfig[entry.key]?.color ?? "var(--color-muted)"}
                    />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="key" />}
                />
              </PieChart>
            </ChartContainer>

            {/* Manual legend with values */}
            <div className="mt-4 w-full max-w-sm grid grid-cols-2 gap-1.5">
              {expenseCategories.map((item) => (
                <div key={item.key} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="size-2 rounded-sm shrink-0"
                      style={{ background: expenseConfig[item.key]?.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-mono font-medium tabular-nums">{brl(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ── RADIAL BAR CHART ── */}
      <Section title="Radial Bar Chart — Goal Completion">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {goalsData.map((goal) => (
            <Card key={goal.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{goal.name}</CardTitle>
                <CardDescription>Meta financeira</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={goalsConfig} className="mx-auto h-40 w-full max-w-40">
                  <RadialBarChart
                    innerRadius="60%"
                    outerRadius="80%"
                    startAngle={90}
                    endAngle={-270}
                    data={[{ ...goal, background: 100 }]}
                  >
                    <RadialBar
                      dataKey="background"
                      fill="var(--color-muted)"
                      background={false}
                      cornerRadius={4}
                    />
                    <RadialBar
                      dataKey="value"
                      fill={goal.fill}
                      cornerRadius={4}
                    />
                  </RadialBarChart>
                </ChartContainer>
                <div className="text-center -mt-2">
                  <span
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: goal.fill }}
                  >
                    {goal.value}%
                  </span>
                  <p className="text-xs text-muted-foreground">concluído</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* ── USAGE ── */}
      <Section title="Usage">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-1">Import</p>
            <CodeBlock
              code={`import { Area, AreaChart, Bar, BarChart, CartesianGrid,
  Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
  ChartLegend, ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">1. Define a ChartConfig</p>
            <CodeBlock
              code={`const chartConfig: ChartConfig = {
  income: {
    label: "Receitas",
    color: "var(--color-success)",  // any CSS color or token
  },
  expenses: {
    label: "Despesas",
    color: "var(--color-destructive)",
  },
}
// Each key becomes --color-{key} injected into the container's CSS scope.`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">2. Wrap with ChartContainer</p>
            <CodeBlock
              code={`<ChartContainer config={chartConfig} className="h-64 w-full">
  <LineChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <YAxis tickLine={false} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <ChartLegend content={<ChartLegendContent />} />
    <Line dataKey="income"   stroke="var(--color-income)"   strokeWidth={2} />
    <Line dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2} />
  </LineChart>
</ChartContainer>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Custom tooltip formatter</p>
            <CodeBlock
              code={`<ChartTooltip
  content={
    <ChartTooltipContent
      formatter={(value) =>
        value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      }
      indicator="line"   // "dot" | "line" | "dashed"
    />
  }
/>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Area chart with gradient fill</p>
            <CodeBlock
              code={`<defs>
  <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%"  stopColor="var(--color-value)" stopOpacity={0.25} />
    <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.02} />
  </linearGradient>
</defs>
<Area dataKey="value" stroke="var(--color-value)" fill="url(#fill)" />`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Theme-aware colors (light/dark per config)</p>
            <CodeBlock
              code={`const config: ChartConfig = {
  revenue: {
    label: "Receita",
    theme: {
      light: "#008CFF",   // used when no .dark class
      dark:  "#47B4FF",   // used when .dark class is present
    },
  },
}`}
            />
          </div>
        </div>
      </Section>

      {/* ── API ── */}
      <Section title="API">
        <div className="space-y-6">
          {[
            {
              component: "ChartContainer",
              props: [
                { prop: "config",             type: "ChartConfig",   def: "—",              desc: "Defines series labels and colors. Keys map to --color-{key} CSS props." },
                { prop: "className",          type: "string",        def: "aspect-video",   desc: "Override aspect ratio or set fixed height (e.g. className='h-64 w-full')." },
                { prop: "initialDimension",   type: "{ width, height }", def: "320×200",   desc: "SSR placeholder dimensions before client hydration." },
                { prop: "children",           type: "Recharts chart", def: "—",             desc: "Any Recharts chart component (LineChart, BarChart, etc.)." },
              ],
            },
            {
              component: "ChartTooltipContent",
              props: [
                { prop: "indicator",    type: '"dot" | "line" | "dashed"', def: '"dot"',  desc: "Shape of the color indicator in the tooltip." },
                { prop: "formatter",    type: "(value, name, ...) => ReactNode", def: "—", desc: "Custom value formatter. Return a string or ReactNode." },
                { prop: "hideLabel",    type: "boolean",  def: "false",  desc: "Hide the series label row in the tooltip." },
                { prop: "hideIndicator",type: "boolean",  def: "false",  desc: "Hide the color indicator dot/line." },
                { prop: "nameKey",      type: "string",   def: "—",      desc: "Key used to look up label from config (default: item.name)." },
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
            Recharts wraps charts in an <code className="text-xs bg-muted px-1 rounded">{"<svg>"}</code> with{" "}
            <code className="text-xs bg-muted px-1 rounded">role=&quot;img&quot;</code>. Add{" "}
            <code className="text-xs bg-muted px-1 rounded">{"<title>"}</code> and{" "}
            <code className="text-xs bg-muted px-1 rounded">{"<desc>"}</code> inside the chart for screen reader summaries.
          </li>
          <li>
            <code className="text-xs bg-muted px-1 rounded">ChartTooltipContent</code> renders the tooltip in a live region visible on hover/focus.
            Data values are also readable in the tooltip for keyboard users who trigger it via focus.
          </li>
          <li>
            Color alone should not encode meaning — pair color with labels in the legend and tooltip.
          </li>
          <li>
            Provide a data table fallback (e.g., in a visually hidden <code className="text-xs bg-muted px-1 rounded">{"<table>"}</code> below the chart) for complex datasets so screen reader users can access the data directly.
          </li>
          <li>
            Use the <code className="text-xs bg-muted px-1 rounded">theme</code> option in{" "}
            <code className="text-xs bg-muted px-1 rounded">ChartConfig</code> to provide distinct light/dark
            colors with sufficient contrast in both modes.
          </li>
        </ul>
      </Section>
    </div>
  )
}
