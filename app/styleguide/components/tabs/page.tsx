"use client"

import { useEffect, useState } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ProgressBar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
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

// ─── Sample data ──────────────────────────────────────────────────────────────

const investmentRows = [
  { name: "Tesouro Selic 2027",     type: "Renda fixa",  value: "R$ 8.200", change: "+0.87%",  positive: true  },
  { name: "IVVB11",                 type: "ETF",         value: "R$ 5.100", change: "+2.13%",  positive: true  },
  { name: "Fundo DI Premium",       type: "Renda fixa",  value: "R$ 3.450", change: "+0.71%",  positive: true  },
  { name: "PETR4",                  type: "Ação",        value: "R$ 1.800", change: "-1.40%",  positive: false },
]

const expenses = [
  { category: "Moradia",      amount: 1800, budget: 1800 },
  { category: "Alimentação",  amount: 432,  budget: 600  },
  { category: "Transporte",   amount: 280,  budget: 300  },
  { category: "Saúde",        amount: 350,  budget: 300  },
  { category: "Lazer",        amount: 180,  budget: 200  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TabsShowcasePage() {
  const [dark, setDark] = useState(false)
  const [controlled, setControlled] = useState("overview")

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">Tabs</h1>
            <Badge variant="secondary">radix-ui</Badge>
          </div>
          <p className="text-muted-foreground">
            Layered sections of content accessible via tab triggers.
            Supports two list variants (<code className="text-xs bg-muted px-1 rounded">default</code> /{" "}
            <code className="text-xs bg-muted px-1 rounded">line</code>) and two orientations
            (<code className="text-xs bg-muted px-1 rounded">horizontal</code> /{" "}
            <code className="text-xs bg-muted px-1 rounded">vertical</code>).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDark((d) => !d)}>
          {dark ? "☀ Light" : "☾ Dark"}
        </Button>
      </div>

      {/* ── LIST VARIANTS ── */}
      <Section title="List Variants">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Demo title="default — pill background">
            <Tabs defaultValue="a">
              <TabsList variant="default">
                <TabsTrigger value="a">Visão geral</TabsTrigger>
                <TabsTrigger value="b">Transações</TabsTrigger>
                <TabsTrigger value="c">Relatório</TabsTrigger>
              </TabsList>
              <TabsContent value="a" className="pt-4 text-sm text-muted-foreground">
                Conteúdo da aba Visão Geral.
              </TabsContent>
              <TabsContent value="b" className="pt-4 text-sm text-muted-foreground">
                Conteúdo da aba Transações.
              </TabsContent>
              <TabsContent value="c" className="pt-4 text-sm text-muted-foreground">
                Conteúdo da aba Relatório.
              </TabsContent>
            </Tabs>
          </Demo>

          <Demo title='line — underline indicator'>
            <Tabs defaultValue="a">
              <TabsList variant="line">
                <TabsTrigger value="a">Visão geral</TabsTrigger>
                <TabsTrigger value="b">Transações</TabsTrigger>
                <TabsTrigger value="c">Relatório</TabsTrigger>
              </TabsList>
              <TabsContent value="a" className="pt-4 text-sm text-muted-foreground">
                Conteúdo da aba Visão Geral.
              </TabsContent>
              <TabsContent value="b" className="pt-4 text-sm text-muted-foreground">
                Conteúdo da aba Transações.
              </TabsContent>
              <TabsContent value="c" className="pt-4 text-sm text-muted-foreground">
                Conteúdo da aba Relatório.
              </TabsContent>
            </Tabs>
          </Demo>
        </div>
      </Section>

      {/* ── ORIENTATIONS ── */}
      <Section title="Orientations">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Demo title="Horizontal (default)">
            <Tabs defaultValue="a" orientation="horizontal">
              <TabsList>
                <TabsTrigger value="a">Receitas</TabsTrigger>
                <TabsTrigger value="b">Despesas</TabsTrigger>
                <TabsTrigger value="c">Saldo</TabsTrigger>
              </TabsList>
              <TabsContent value="a" className="pt-4 text-sm text-success font-medium">
                Total receitas: R$ 8.700,00
              </TabsContent>
              <TabsContent value="b" className="pt-4 text-sm text-destructive font-medium">
                Total despesas: R$ 3.042,00
              </TabsContent>
              <TabsContent value="c" className="pt-4 text-sm text-primary font-medium">
                Saldo: R$ 5.658,00
              </TabsContent>
            </Tabs>
          </Demo>

          <Demo
            title="Vertical"
            description='orientation="vertical" on the Tabs root.'
          >
            <Tabs defaultValue="a" orientation="vertical" className="gap-4">
              <TabsList>
                <TabsTrigger value="a">Perfil</TabsTrigger>
                <TabsTrigger value="b">Segurança</TabsTrigger>
                <TabsTrigger value="c">Notificações</TabsTrigger>
              </TabsList>
              <div className="flex-1">
                <TabsContent value="a" className="text-sm text-muted-foreground">
                  Configurações de perfil e dados pessoais.
                </TabsContent>
                <TabsContent value="b" className="text-sm text-muted-foreground">
                  Senha, autenticação de dois fatores e sessões ativas.
                </TabsContent>
                <TabsContent value="c" className="text-sm text-muted-foreground">
                  E-mail, push e preferências de alerta.
                </TabsContent>
              </div>
            </Tabs>
          </Demo>

          <Demo
            title="Vertical + line variant"
            description='orientation="vertical" with variant="line" on TabsList.'
          >
            <Tabs defaultValue="a" orientation="vertical" className="gap-4">
              <TabsList variant="line">
                <TabsTrigger value="a">Dados pessoais</TabsTrigger>
                <TabsTrigger value="b">Endereço</TabsTrigger>
                <TabsTrigger value="c">Documentos</TabsTrigger>
              </TabsList>
              <div className="flex-1">
                <TabsContent value="a" className="text-sm text-muted-foreground">
                  Nome, CPF, data de nascimento e telefone.
                </TabsContent>
                <TabsContent value="b" className="text-sm text-muted-foreground">
                  CEP, cidade, estado e complemento.
                </TabsContent>
                <TabsContent value="c" className="text-sm text-muted-foreground">
                  RG, comprovante de renda e residência.
                </TabsContent>
              </div>
            </Tabs>
          </Demo>
        </div>
      </Section>

      {/* ── STATES ── */}
      <Section title="States">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Demo title="With disabled tab">
            <Tabs defaultValue="a">
              <TabsList>
                <TabsTrigger value="a">Disponível</TabsTrigger>
                <TabsTrigger value="b">Disponível</TabsTrigger>
                <TabsTrigger value="c" disabled>Em breve</TabsTrigger>
              </TabsList>
              <TabsContent value="a" className="pt-4 text-sm text-muted-foreground">
                Esta aba está disponível.
              </TabsContent>
              <TabsContent value="b" className="pt-4 text-sm text-muted-foreground">
                Esta aba também está disponível.
              </TabsContent>
            </Tabs>
          </Demo>

          <Demo title="Full-width triggers" description='Add w-full to TabsList.'>
            <Tabs defaultValue="monthly">
              <TabsList className="w-full">
                <TabsTrigger value="weekly">Semanal</TabsTrigger>
                <TabsTrigger value="monthly">Mensal</TabsTrigger>
                <TabsTrigger value="yearly">Anual</TabsTrigger>
              </TabsList>
              <TabsContent value="weekly" className="pt-4 text-sm text-muted-foreground">
                Resumo semanal das suas finanças.
              </TabsContent>
              <TabsContent value="monthly" className="pt-4 text-sm text-muted-foreground">
                Resumo mensal das suas finanças.
              </TabsContent>
              <TabsContent value="yearly" className="pt-4 text-sm text-muted-foreground">
                Resumo anual das suas finanças.
              </TabsContent>
            </Tabs>
          </Demo>
        </div>
      </Section>

      {/* ── CONTROLLED ── */}
      <Section title="Controlled">
        <div className="max-w-md space-y-3">
          <div className="flex items-center gap-2">
            {["overview", "investments", "expenses"].map((tab) => (
              <Button
                key={tab}
                size="xs"
                variant={controlled === tab ? "default" : "outline"}
                onClick={() => setControlled(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>
          <Tabs value={controlled} onValueChange={setControlled}>
            <TabsList variant="line">
              <TabsTrigger value="overview">Visão geral</TabsTrigger>
              <TabsTrigger value="investments">Investimentos</TabsTrigger>
              <TabsTrigger value="expenses">Despesas</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-4 text-sm text-muted-foreground">
              Aba ativa: <code className="text-foreground font-mono text-xs">{controlled}</code>
            </TabsContent>
            <TabsContent value="investments" className="pt-4 text-sm text-muted-foreground">
              Aba ativa: <code className="text-foreground font-mono text-xs">{controlled}</code>
            </TabsContent>
            <TabsContent value="expenses" className="pt-4 text-sm text-muted-foreground">
              Aba ativa: <code className="text-foreground font-mono text-xs">{controlled}</code>
            </TabsContent>
          </Tabs>
        </div>
      </Section>

      {/* ── REAL WORLD DEMO ── */}
      <Section title="Financial Dashboard — Live Demo">
        <Tabs defaultValue="investments">
          <TabsList variant="line" className="w-full justify-start">
            <TabsTrigger value="investments">Investimentos</TabsTrigger>
            <TabsTrigger value="expenses">Despesas</TabsTrigger>
            <TabsTrigger value="goals">Metas</TabsTrigger>
          </TabsList>

          {/* Investments tab */}
          <TabsContent value="investments" className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor atual</TableHead>
                  <TableHead className="text-right">Variação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investmentRows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {row.value}
                    </TableCell>
                    <TableCell className={`text-right font-mono tabular-nums font-medium ${row.positive ? "text-success" : "text-destructive"}`}>
                      {row.change}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Expenses tab */}
          <TabsContent value="expenses" className="pt-4">
            <div className="space-y-4">
              {expenses.map((item) => {
                const pct = Math.min(Math.round((item.amount / item.budget) * 100), 100)
                const over = item.amount > item.budget
                return (
                  <div key={item.category} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.category}</span>
                      <span className={`text-xs tabular-nums ${over ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                        R$ {item.amount} / R$ {item.budget}{over ? " ⚠" : ""}
                      </span>
                    </div>
                    <ProgressBar
                      value={pct}
                      size="sm"
                      variant={over ? "destructive" : pct > 80 ? "warning" : "default"}
                    />
                  </div>
                )
              })}
            </div>
          </TabsContent>

          {/* Goals tab */}
          <TabsContent value="goals" className="pt-4">
            <div className="space-y-4">
              {[
                { label: "Reserva de emergência", value: 72,  target: "R$ 15.000", current: "R$ 10.800", variant: "success"  },
                { label: "Viagem Europa",          value: 38,  target: "R$ 10.000", current: "R$ 3.800",  variant: "default"  },
                { label: "Entrada apartamento",    value: 15,  target: "R$ 100.000",current: "R$ 15.000", variant: "warning"  },
              ].map((goal) => (
                <div key={goal.label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{goal.label}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {goal.current} de {goal.target}
                    </span>
                  </div>
                  <ProgressBar
                    value={goal.value}
                    size="default"
                    variant={goal.variant as "success" | "default" | "warning"}
                  />
                  <p className="text-xs text-muted-foreground">{goal.value}% concluído</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Section>

      {/* ── USAGE ── */}
      <Section title="Usage">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-1">Import</p>
            <CodeBlock
              code={`import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Basic (uncontrolled)</p>
            <CodeBlock
              code={`<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Visão geral</TabsTrigger>
    <TabsTrigger value="transactions">Transações</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    Conteúdo da visão geral.
  </TabsContent>
  <TabsContent value="transactions">
    Conteúdo das transações.
  </TabsContent>
</Tabs>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Line variant</p>
            <CodeBlock
              code={`<TabsList variant="line">
  <TabsTrigger value="a">Tab A</TabsTrigger>
  <TabsTrigger value="b">Tab B</TabsTrigger>
</TabsList>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Vertical orientation</p>
            <CodeBlock
              code={`<Tabs defaultValue="profile" orientation="vertical" className="gap-6">
  <TabsList>
    <TabsTrigger value="profile">Perfil</TabsTrigger>
    <TabsTrigger value="security">Segurança</TabsTrigger>
  </TabsList>
  <div className="flex-1">
    <TabsContent value="profile">…</TabsContent>
    <TabsContent value="security">…</TabsContent>
  </div>
</Tabs>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Controlled</p>
            <CodeBlock
              code={`const [tab, setTab] = useState("overview")

<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="overview">Visão geral</TabsTrigger>
    <TabsTrigger value="investments">Investimentos</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">…</TabsContent>
  <TabsContent value="investments">…</TabsContent>
</Tabs>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Full-width + disabled</p>
            <CodeBlock
              code={`<TabsList className="w-full">
  <TabsTrigger value="a">Ativo</TabsTrigger>
  <TabsTrigger value="b" disabled>Em breve</TabsTrigger>
</TabsList>`}
            />
          </div>
        </div>
      </Section>

      {/* ── API ── */}
      <Section title="API">
        <div className="space-y-6">
          {[
            {
              component: "Tabs (Root)",
              props: [
                { prop: "defaultValue",  type: "string",         def: "—",             desc: "Uncontrolled initially active tab." },
                { prop: "value",         type: "string",         def: "—",             desc: "Controlled active tab value." },
                { prop: "onValueChange", type: "(v) => void",    def: "—",             desc: "Fires when the active tab changes." },
                { prop: "orientation",   type: '"horizontal" | "vertical"', def: '"horizontal"', desc: "Stacks tabs horizontally or vertically." },
              ],
            },
            {
              component: "TabsList",
              props: [
                { prop: "variant",    type: '"default" | "line"', def: '"default"', desc: "default = muted pill bg; line = underline indicator." },
                { prop: "className",  type: "string",             def: "—",         desc: "Use w-full to stretch triggers to full width." },
              ],
            },
            {
              component: "TabsTrigger",
              props: [
                { prop: "value",    type: "string",  def: "—",     desc: "Matches the TabsContent value to show." },
                { prop: "disabled", type: "boolean", def: "false", desc: "Prevents interaction; renders at 50% opacity." },
              ],
            },
            {
              component: "TabsContent",
              props: [
                { prop: "value",     type: "string",  def: "—",  desc: "Matches the TabsTrigger value that reveals it." },
                { prop: "forceMount", type: "boolean", def: "—", desc: "Keeps content in DOM even when not active." },
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
            Radix renders the <code className="text-xs bg-muted px-1 rounded">tablist</code>,{" "}
            <code className="text-xs bg-muted px-1 rounded">tab</code>, and{" "}
            <code className="text-xs bg-muted px-1 rounded">tabpanel</code> ARIA roles automatically.
          </li>
          <li>
            Keyboard: <kbd className="text-xs bg-muted px-1 rounded">←</kbd>{" "}
            <kbd className="text-xs bg-muted px-1 rounded">→</kbd> navigate between horizontal tabs;{" "}
            <kbd className="text-xs bg-muted px-1 rounded">↑</kbd>{" "}
            <kbd className="text-xs bg-muted px-1 rounded">↓</kbd> navigate vertical tabs.{" "}
            <kbd className="text-xs bg-muted px-1 rounded">Home</kbd> /{" "}
            <kbd className="text-xs bg-muted px-1 rounded">End</kbd> jump to first/last.
          </li>
          <li>
            Active tab has <code className="text-xs bg-muted px-1 rounded">aria-selected="true"</code>;
            inactive panels have <code className="text-xs bg-muted px-1 rounded">hidden</code> by default
            (use <code className="text-xs bg-muted px-1 rounded">forceMount</code> to keep them in DOM).
          </li>
          <li>
            Focus automatically moves to the selected <code className="text-xs bg-muted px-1 rounded">TabsTrigger</code>{" "}
            when using keyboard navigation (automatic activation mode by default).
          </li>
          <li>
            Disabled tabs announce as <code className="text-xs bg-muted px-1 rounded">aria-disabled="true"</code>{" "}
            and are skipped by arrow key navigation.
          </li>
        </ul>
      </Section>
    </div>
  )
}
