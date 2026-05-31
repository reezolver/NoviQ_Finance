"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

// ─── Data ─────────────────────────────────────────────────────────────────────

const transactions = [
  { id: "1", date: "28/05/2026", description: "Salário",           category: "Receita",   amount: 7500.0,  type: "income"   as const },
  { id: "2", date: "27/05/2026", description: "Aluguel",           category: "Moradia",   amount: -1800.0, type: "expense"  as const },
  { id: "3", date: "26/05/2026", description: "Supermercado",      category: "Alimentação", amount: -432.5, type: "expense" as const },
  { id: "4", date: "25/05/2026", description: "Tesouro Direto",    category: "Investimento", amount: -500.0, type: "invest" as const },
  { id: "5", date: "24/05/2026", description: "Freelance",         category: "Receita",   amount: 1200.0,  type: "income"   as const },
  { id: "6", date: "23/05/2026", description: "Academia",          category: "Saúde",     amount: -99.9,   type: "expense"  as const },
  { id: "7", date: "22/05/2026", description: "Fundo de renda fixa", category: "Investimento", amount: -1000.0, type: "invest" as const },
]

const members = [
  { name: "João Silva",    email: "joao@email.com",     plan: "Pro",        status: "active",    since: "Jan 2025" },
  { name: "Maria Souza",  email: "maria@email.com",     plan: "Básico",     status: "active",    since: "Mar 2025" },
  { name: "Pedro Lima",   email: "pedro@email.com",     plan: "Enterprise", status: "active",    since: "Nov 2024" },
  { name: "Ana Costa",    email: "ana@email.com",       plan: "Pro",        status: "inactive",  since: "Feb 2025" },
  { name: "Carlos Neto",  email: "carlos@email.com",    plan: "Básico",     status: "trial",     since: "Mai 2026" },
]

type SortDir = "asc" | "desc" | null

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

function AmountCell({ amount, type }: { amount: number; type: "income" | "expense" | "invest" }) {
  const colors = {
    income:  "text-success",
    expense: "text-destructive",
    invest:  "text-primary",
  }
  const prefix = amount > 0 ? "+" : ""
  return (
    <span className={cn("font-mono font-medium tabular-nums", colors[type])}>
      {prefix}
      {amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    active:   { label: "Ativo",     variant: "default"     },
    inactive: { label: "Inativo",   variant: "destructive" },
    trial:    { label: "Trial",     variant: "secondary"   },
  }
  const { label, variant } = map[status] ?? { label: status, variant: "outline" as const }
  return <Badge variant={variant}>{label}</Badge>
}

function SortIcon({ dir }: { dir: SortDir }) {
  if (!dir) return <span className="ml-1 text-muted-foreground/40">↕</span>
  return <span className="ml-1">{dir === "asc" ? "↑" : "↓"}</span>
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TableShowcasePage() {
  const [dark, setDark] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [amountSort, setAmountSort] = useState<SortDir>(null)
  const [dateSort, setDateSort]     = useState<SortDir>("desc")

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleAll = () =>
    setSelected((prev) =>
      prev.size === transactions.length ? new Set() : new Set(transactions.map((t) => t.id))
    )

  const sortedTx = [...transactions].sort((a, b) => {
    if (amountSort) {
      return amountSort === "asc" ? a.amount - b.amount : b.amount - a.amount
    }
    if (dateSort) {
      const parse = (d: string) => d.split("/").reverse().join("")
      return dateSort === "asc"
        ? parse(a.date).localeCompare(parse(b.date))
        : parse(b.date).localeCompare(parse(a.date))
    }
    return 0
  })

  const cycleSort = (
    current: SortDir,
    set: (v: SortDir) => void,
    clearOther: () => void
  ) => {
    clearOther()
    set(current === null ? "asc" : current === "asc" ? "desc" : null)
  }

  const totalIncome  = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)
  const net = totalIncome + totalExpense

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">Table</h1>
            <Badge variant="secondary">HTML table</Badge>
          </div>
          <p className="text-muted-foreground">
            Semantic HTML table wrapped in a horizontal scroll container.
            Supports row hover, selection, footer totals, sorting and captions.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDark((d) => !d)}>
          {dark ? "☀ Light" : "☾ Dark"}
        </Button>
      </div>

      {/* ── BASIC ── */}
      <Section title="Basic">
        <Table>
          <TableCaption>Resumo das despesas por categoria — Maio 2026</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead>Transações</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { category: "Moradia",     count: 2,  total: -1900 },
              { category: "Alimentação", count: 8,  total: -834  },
              { category: "Transporte",  count: 5,  total: -320  },
              { category: "Saúde",       count: 3,  total: -349.9 },
              { category: "Lazer",       count: 4,  total: -280  },
            ].map((row) => (
              <TableRow key={row.category}>
                <TableCell className="font-medium">{row.category}</TableCell>
                <TableCell>{row.count}</TableCell>
                <TableCell className="text-right font-mono tabular-nums text-destructive">
                  {row.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell>22</TableCell>
              <TableCell className="text-right font-mono tabular-nums text-destructive">
                {(-3683.9).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Section>

      {/* ── WITH BADGES ── */}
      <Section title="With Badges & Status">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Desde</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.email}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell className="text-muted-foreground">{m.email}</TableCell>
                <TableCell>
                  <Badge variant={m.plan === "Enterprise" ? "default" : "outline"}>
                    {m.plan}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={m.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">{m.since}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="xs">Editar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      {/* ── SELECTABLE ROWS + SORT ── */}
      <Section title="Selectable Rows & Sortable Columns">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selected.size > 0
              ? `${selected.size} linha${selected.size > 1 ? "s" : ""} selecionada${selected.size > 1 ? "s" : ""}`
              : "Nenhuma linha selecionada"}
          </p>
          {selected.size > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setSelected(new Set())}
            >
              Limpar seleção
            </Button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox
                  checked={selected.size === transactions.length}
                  onCheckedChange={toggleAll}
                  aria-label="Selecionar todas"
                />
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() =>
                  cycleSort(dateSort, setDateSort, () => setAmountSort(null))
                }
              >
                Data <SortIcon dir={dateSort} />
              </TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead
                className="text-right cursor-pointer select-none"
                onClick={() =>
                  cycleSort(amountSort, setAmountSort, () => setDateSort(null))
                }
              >
                Valor <SortIcon dir={amountSort} />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTx.map((tx) => (
              <TableRow
                key={tx.id}
                data-state={selected.has(tx.id) ? "selected" : undefined}
                onClick={() => toggleRow(tx.id)}
                className="cursor-pointer"
              >
                <TableCell>
                  <Checkbox
                    checked={selected.has(tx.id)}
                    onCheckedChange={() => toggleRow(tx.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Selecionar ${tx.description}`}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                <TableCell className="font-medium">{tx.description}</TableCell>
                <TableCell>
                  <Badge variant="outline">{tx.category}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <AmountCell amount={tx.amount} type={tx.type} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} />
              <TableCell className="text-right text-muted-foreground">Receitas</TableCell>
              <TableCell className="text-right">
                <span className="font-mono font-medium tabular-nums text-success">
                  +{totalIncome.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} />
              <TableCell className="text-right text-muted-foreground">Despesas</TableCell>
              <TableCell className="text-right">
                <span className="font-mono font-medium tabular-nums text-destructive">
                  {totalExpense.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} />
              <TableCell className="text-right font-semibold">Saldo</TableCell>
              <TableCell className="text-right">
                <span className={cn(
                  "font-mono font-semibold tabular-nums",
                  net >= 0 ? "text-success" : "text-destructive"
                )}>
                  {net >= 0 ? "+" : ""}
                  {net.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Section>

      {/* ── EMPTY STATE ── */}
      <Section title="Empty State">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                Nenhuma transação encontrada.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Section>

      {/* ── USAGE ── */}
      <Section title="Usage">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-1">Import</p>
            <CodeBlock
              code={`import {
  Table, TableBody, TableCaption, TableCell,
  TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Basic with footer</p>
            <CodeBlock
              code={`<Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>INV-001</TableCell>
      <TableCell className="text-right">R$ 250,00</TableCell>
    </TableRow>
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell>Total</TableCell>
      <TableCell className="text-right">R$ 250,00</TableCell>
    </TableRow>
  </TableFooter>
</Table>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Row selection with checkbox</p>
            <CodeBlock
              code={`const [selected, setSelected] = useState(new Set<string>())

<TableRow
  data-state={selected.has(row.id) ? "selected" : undefined}
  onClick={() => toggle(row.id)}
  className="cursor-pointer"
>
  <TableCell>
    <Checkbox
      checked={selected.has(row.id)}
      onClick={(e) => e.stopPropagation()}  // prevent double-toggle
    />
  </TableCell>
  …
</TableRow>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Sortable column header</p>
            <CodeBlock
              code={`const [sort, setSort] = useState<"asc" | "desc" | null>(null)

<TableHead
  className="cursor-pointer select-none"
  onClick={() => setSort(s => s === "asc" ? "desc" : s === "desc" ? null : "asc")}
>
  Valor {sort === "asc" ? "↑" : sort === "desc" ? "↓" : "↕"}
</TableHead>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Empty state</p>
            <CodeBlock
              code={`<TableBody>
  {rows.length === 0 ? (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
        Nenhum resultado encontrado.
      </TableCell>
    </TableRow>
  ) : (
    rows.map((row) => <TableRow key={row.id}>…</TableRow>)
  )}
</TableBody>`}
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
                <th className="text-left py-2 pr-6 font-semibold text-xs">Component</th>
                <th className="text-left py-2 pr-6 font-semibold text-xs">Element</th>
                <th className="text-left py-2 font-semibold text-xs">Notes</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                { comp: "Table",         el: "<table>",   note: "Wrapped in overflow-x-auto container. Accepts all <table> props." },
                { comp: "TableHeader",   el: "<thead>",   note: "Adds border-b to all child rows." },
                { comp: "TableBody",     el: "<tbody>",   note: "Removes border from the last row." },
                { comp: "TableFooter",   el: "<tfoot>",   note: "bg-muted/50 + border-t for totals styling." },
                { comp: "TableRow",      el: "<tr>",      note: "Hover bg-muted/50. data-[state=selected]:bg-muted for selection highlight." },
                { comp: "TableHead",     el: "<th>",      note: "h-10, px-2, font-medium. Use text-right for numeric columns." },
                { comp: "TableCell",     el: "<td>",      note: "p-2, align-middle. Use colSpan for empty states." },
                { comp: "TableCaption",  el: "<caption>", note: "caption-bottom position, text-muted-foreground." },
              ].map((row) => (
                <tr key={row.comp} className="border-b last:border-0">
                  <td className="py-2 pr-6">
                    <code className="text-xs text-foreground bg-muted px-1 py-0.5 rounded">{row.comp}</code>
                  </td>
                  <td className="py-2 pr-6 font-mono text-xs">{row.el}</td>
                  <td className="py-2 text-xs">{row.note}</td>
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
            Always use <code className="text-xs bg-muted px-1 rounded">{"<TableHeader>"}</code> with{" "}
            <code className="text-xs bg-muted px-1 rounded">{"<TableHead>"}</code> cells — they render as{" "}
            <code className="text-xs bg-muted px-1 rounded">{"<th>"}</code> which screen readers use to announce column names per cell.
          </li>
          <li>
            For sortable columns, add{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-sort="ascending"</code> /{" "}
            <code className="text-xs bg-muted px-1 rounded">"descending"</code> /{" "}
            <code className="text-xs bg-muted px-1 rounded">"none"</code> to the{" "}
            <code className="text-xs bg-muted px-1 rounded">TableHead</code> element.
          </li>
          <li>
            Row selection checkboxes should have{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-label</code> describing what is selected.
            The "select all" checkbox should also describe its action.
          </li>
          <li>
            <code className="text-xs bg-muted px-1 rounded">TableCaption</code> renders as{" "}
            <code className="text-xs bg-muted px-1 rounded">{"<caption>"}</code> — it is associated with the table and announced by screen readers before the data.
          </li>
          <li>
            For data-only tables with no interactive elements, add{" "}
            <code className="text-xs bg-muted px-1 rounded">role="table"</code> explicitly if you need ARIA landmark semantics in non-table HTML structures.
          </li>
        </ul>
      </Section>
    </div>
  )
}
