"use client"

import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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
        <p className="text-xs text-muted-foreground mb-3">{description}</p>
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

export default function SelectShowcasePage() {
  const [dark, setDark] = useState(false)
  const [controlled, setControlled] = useState("")

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">Select</h1>
            <Badge variant="secondary">radix-ui</Badge>
          </div>
          <p className="text-muted-foreground">
            Accessible dropdown menu for selecting a single value from a list.
            Keyboard navigable, with support for groups, separators and search.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDark((d) => !d)}>
          {dark ? "☀ Light" : "☾ Dark"}
        </Button>
      </div>

      {/* ── STATES ── */}
      <Section title="States">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Demo title="Default — with placeholder">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Opção A</SelectItem>
                <SelectItem value="b">Opção B</SelectItem>
                <SelectItem value="c">Opção C</SelectItem>
              </SelectContent>
            </Select>
          </Demo>

          <Demo title="With a default value">
            <Select defaultValue="moderate">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservador</SelectItem>
                <SelectItem value="moderate">Moderado</SelectItem>
                <SelectItem value="aggressive">Arrojado</SelectItem>
              </SelectContent>
            </Select>
          </Demo>

          <Demo title="Disabled">
            <Select disabled>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Campo desabilitado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="x">Opção X</SelectItem>
              </SelectContent>
            </Select>
          </Demo>

          <Demo title="Invalid / error state" description="Uses aria-invalid to trigger the red border.">
            <div className="flex flex-col gap-1.5">
              <Select>
                <SelectTrigger className="w-full" aria-invalid="true">
                  <SelectValue placeholder="Selecione a faixa de renda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lt3k">Até R$ 3.000</SelectItem>
                  <SelectItem value="3k-7k">R$ 3.000 – R$ 7.000</SelectItem>
                  <SelectItem value="gt7k">Acima de R$ 7.000</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs font-medium text-destructive">
                Selecione uma faixa de renda para continuar.
              </p>
            </div>
          </Demo>
        </div>
      </Section>

      {/* ── SIZES ── */}
      <Section title="Sizes">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Demo title="Default (h-8)">
            <Select>
              <SelectTrigger size="default" className="w-full">
                <SelectValue placeholder="Tamanho padrão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Opção A</SelectItem>
                <SelectItem value="b">Opção B</SelectItem>
              </SelectContent>
            </Select>
          </Demo>

          <Demo title="Small (h-7)">
            <Select>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder="Tamanho pequeno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Opção A</SelectItem>
                <SelectItem value="b">Opção B</SelectItem>
              </SelectContent>
            </Select>
          </Demo>
        </div>
      </Section>

      {/* ── GROUPS & SEPARATORS ── */}
      <Section title="Groups, Labels & Separators">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Demo title="With groups and labels">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um objetivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Proteção</SelectLabel>
                  <SelectItem value="emergency">Reserva de emergência</SelectItem>
                  <SelectItem value="insurance">Seguro de vida</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Crescimento</SelectLabel>
                  <SelectItem value="invest">Começar a investir</SelectItem>
                  <SelectItem value="retire">Aposentadoria</SelectItem>
                  <SelectItem value="business">Abrir negócio</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Organização</SelectLabel>
                  <SelectItem value="debt">Sair das dívidas</SelectItem>
                  <SelectItem value="budget">Controle de gastos</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Demo>

          <Demo title="With separator — no group labels">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a renda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lt1k">Até R$ 1.000</SelectItem>
                <SelectItem value="1k-3k">R$ 1.000 – R$ 3.000</SelectItem>
                <SelectItem value="3k-7k">R$ 3.000 – R$ 7.000</SelectItem>
                <SelectSeparator />
                <SelectItem value="7k-15k">R$ 7.000 – R$ 15.000</SelectItem>
                <SelectItem value="gt15k">Acima de R$ 15.000</SelectItem>
              </SelectContent>
            </Select>
          </Demo>
        </div>
      </Section>

      {/* ── WITH DISABLED ITEMS ── */}
      <Section title="Disabled Items">
        <div className="max-w-sm">
          <Demo title="Some items disabled">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Básico — Grátis</SelectItem>
                <SelectItem value="pro">Pro — R$ 49/mês</SelectItem>
                <SelectItem value="enterprise" disabled>
                  Enterprise — Em breve
                </SelectItem>
              </SelectContent>
            </Select>
          </Demo>
        </div>
      </Section>

      {/* ── CONTROLLED ── */}
      <Section title="Controlled">
        <div className="max-w-sm space-y-3">
          <Demo
            title="Controlled value"
            description="Value is managed externally via useState."
          >
            <div className="flex flex-col gap-3">
              <Select value={controlled} onValueChange={setControlled}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Valor selecionado:{" "}
                  <span className="font-mono text-foreground">
                    {controlled || "(nenhum)"}
                  </span>
                </p>
                {controlled && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setControlled("")}
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </div>
          </Demo>
        </div>
      </Section>

      {/* ── FORM INTEGRATION ── */}
      <Section title="In a Form">
        <div className="max-w-sm">
          <Demo title="With Label + description + error">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="select-form">Perfil de risco</Label>
              <Select>
                <SelectTrigger id="select-form" className="w-full">
                  <SelectValue placeholder="Escolha seu perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservador</SelectItem>
                  <SelectItem value="moderate">Moderado</SelectItem>
                  <SelectItem value="aggressive">Arrojado</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Definiremos os melhores investimentos com base no seu perfil.
              </p>
            </div>
          </Demo>
        </div>

        <div className="mt-4 text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg border">
          <p className="font-medium text-foreground mb-1">Note: Select inside react-hook-form</p>
          <p>
            Because Select is not a native input, bind it with <code className="text-xs bg-muted px-1 rounded">onValueChange={"{field.onChange}"}</code> and <code className="text-xs bg-muted px-1 rounded">value={"{field.value}"}</code> instead of spreading <code className="text-xs bg-muted px-1 rounded">{"{...field}"}</code>.
            See the Form showcase for a complete working example.
          </p>
        </div>
      </Section>

      {/* ── USAGE ── */}
      <Section title="Usage">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-1">Import</p>
            <CodeBlock
              code={`import {
  Select, SelectContent, SelectGroup,
  SelectItem, SelectLabel, SelectSeparator,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Basic</p>
            <CodeBlock
              code={`<Select>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Selecione uma opção" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Opção A</SelectItem>
    <SelectItem value="b">Opção B</SelectItem>
  </SelectContent>
</Select>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">With groups</p>
            <CodeBlock
              code={`<SelectContent>
  <SelectGroup>
    <SelectLabel>Proteção</SelectLabel>
    <SelectItem value="emergency">Reserva de emergência</SelectItem>
    <SelectItem value="insurance">Seguro de vida</SelectItem>
  </SelectGroup>
  <SelectSeparator />
  <SelectGroup>
    <SelectLabel>Crescimento</SelectLabel>
    <SelectItem value="invest">Começar a investir</SelectItem>
  </SelectGroup>
</SelectContent>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Controlled</p>
            <CodeBlock
              code={`const [value, setValue] = useState("")

<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Selecione" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="monthly">Mensal</SelectItem>
    <SelectItem value="yearly">Anual</SelectItem>
  </SelectContent>
</Select>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">With react-hook-form</p>
            <CodeBlock
              code={`<FormField
  control={form.control}
  name="income"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Renda mensal</FormLabel>
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="lt3k">Até R$ 3.000</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>`}
            />
          </div>
        </div>
      </Section>

      {/* ── API TABLE ── */}
      <Section title="API">
        <div className="space-y-6">
          {[
            {
              component: "Select (Root)",
              props: [
                { prop: "value",          type: "string",    def: "—",        desc: "Controlled selected value" },
                { prop: "defaultValue",   type: "string",    def: "—",        desc: "Uncontrolled default value" },
                { prop: "onValueChange",  type: "(v) => void", def: "—",      desc: "Fires when user selects a new value" },
                { prop: "disabled",       type: "boolean",   def: "false",    desc: "Disables the entire select" },
                { prop: "open",           type: "boolean",   def: "—",        desc: "Controlled open state" },
                { prop: "onOpenChange",   type: "(o) => void", def: "—",      desc: "Fires when dropdown opens/closes" },
              ],
            },
            {
              component: "SelectTrigger",
              props: [
                { prop: "size",         type: '"default" | "sm"', def: '"default"', desc: 'h-8 (default) or h-7 (sm)' },
                { prop: "aria-invalid", type: "boolean",          def: "—",         desc: "Applies red border for error state" },
                { prop: "className",    type: "string",           def: "—",         desc: "Extra Tailwind classes (use w-full for full width)" },
              ],
            },
            {
              component: "SelectItem",
              props: [
                { prop: "value",    type: "string",  def: "—",     desc: "The value emitted on selection (required)" },
                { prop: "disabled", type: "boolean", def: "false", desc: "Prevents selection of this item" },
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
            Associate with a <code className="text-xs bg-muted px-1 rounded">{"<Label>"}</code> via{" "}
            <code className="text-xs bg-muted px-1 rounded">htmlFor</code> pointing to the{" "}
            <code className="text-xs bg-muted px-1 rounded">id</code> on{" "}
            <code className="text-xs bg-muted px-1 rounded">SelectTrigger</code>.
          </li>
          <li>
            Keyboard: <kbd className="text-xs bg-muted px-1 rounded">Space</kbd> /{" "}
            <kbd className="text-xs bg-muted px-1 rounded">Enter</kbd> opens the dropdown;{" "}
            <kbd className="text-xs bg-muted px-1 rounded">↑</kbd> <kbd className="text-xs bg-muted px-1 rounded">↓</kbd> navigate items;{" "}
            <kbd className="text-xs bg-muted px-1 rounded">Esc</kbd> closes.
          </li>
          <li>
            Type-ahead: pressing letter keys jumps to matching items.
          </li>
          <li>
            Add <code className="text-xs bg-muted px-1 rounded">aria-invalid="true"</code> to{" "}
            <code className="text-xs bg-muted px-1 rounded">SelectTrigger</code> to signal a validation error to screen readers.
          </li>
          <li>
            <code className="text-xs bg-muted px-1 rounded">SelectLabel</code> inside a{" "}
            <code className="text-xs bg-muted px-1 rounded">SelectGroup</code> sets an{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-label</code> for the group — screen readers announce it when entering the group.
          </li>
          <li>
            Disabled items are announced as unavailable and skipped by keyboard navigation.
          </li>
        </ul>
      </Section>
    </div>
  )
}
