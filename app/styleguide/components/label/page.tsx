"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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

export default function LabelShowcasePage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Label</h1>
            <Badge variant="secondary">radix-ui</Badge>
          </div>
          <p className="text-muted-foreground">
            Renders an accessible <code className="text-xs bg-muted px-1 py-0.5 rounded">&lt;label&gt;</code> element
            associated with a form control via <code className="text-xs bg-muted px-1 py-0.5 rounded">htmlFor</code>.
            Automatically inherits disabled state from its peer.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDark((d) => !d)}>
          {dark ? "☀ Light" : "☾ Dark"}
        </Button>
      </div>

      {/* ── STATES ── */}
      <Section title="States">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Demo title="Default">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="l-default">E-mail</Label>
              <Input id="l-default" type="email" placeholder="seunome@email.com" />
            </div>
          </Demo>

          <Demo
            title="Disabled"
            description="Label becomes muted when the peer input is disabled."
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="l-disabled">E-mail</Label>
              <Input id="l-disabled" type="email" placeholder="seunome@email.com" disabled />
            </div>
          </Demo>

          <Demo title="Required">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="l-required" className="gap-1">
                Nome completo
                <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <Input id="l-required" placeholder="João Silva" required />
            </div>
          </Demo>

          <Demo
            title="Error"
            description="Apply text-destructive to highlight a validation error."
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="l-error" className="text-destructive">
                E-mail
              </Label>
              <Input
                id="l-error"
                type="email"
                defaultValue="invalido@"
                aria-invalid="true"
              />
              <p className="text-xs font-medium text-destructive">
                Formato de e-mail inválido.
              </p>
            </div>
          </Demo>
        </div>
      </Section>

      {/* ── WITH FORM ELEMENTS ── */}
      <Section title="Paired with Form Elements">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Demo title="Label + Input">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-input">Renda mensal</Label>
              <Input id="p-input" placeholder="R$ 5.000,00" />
              <p className="text-xs text-muted-foreground">
                Informe sua renda líquida mensal.
              </p>
            </div>
          </Demo>

          <Demo title="Label + Textarea">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-textarea">Observações</Label>
              <Textarea id="p-textarea" placeholder="Descreva sua situação financeira…" />
            </div>
          </Demo>

          <Demo title="Label + Checkbox">
            <div className="flex flex-col gap-3">
              {[
                { id: "ch-1", label: "Tenho dívidas ativas" },
                { id: "ch-2", label: "Possuo investimentos", checked: true },
                { id: "ch-3", label: "Opção desabilitada", disabled: true },
              ].map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox
                    id={item.id}
                    defaultChecked={item.checked}
                    disabled={item.disabled}
                  />
                  <Label htmlFor={item.id}>{item.label}</Label>
                </div>
              ))}
            </div>
          </Demo>

          <Demo title="Label + Switch">
            <div className="flex flex-col gap-3">
              {[
                { id: "sw-1", label: "Receber e-mails semanais" },
                { id: "sw-2", label: "Alertas de vencimento", checked: true },
                { id: "sw-3", label: "Modo avançado (desabilitado)", disabled: true },
              ].map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <Switch
                    id={item.id}
                    defaultChecked={item.checked}
                    disabled={item.disabled}
                  />
                  <Label htmlFor={item.id}>{item.label}</Label>
                </div>
              ))}
            </div>
          </Demo>

          <Demo title="Label + Radio Group">
            <div className="flex flex-col gap-1.5">
              <Label className="mb-1">Perfil de investidor</Label>
              <RadioGroup defaultValue="moderate">
                {[
                  { value: "conservative", label: "Conservador" },
                  { value: "moderate",     label: "Moderado" },
                  { value: "aggressive",   label: "Arrojado" },
                ].map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <RadioGroupItem value={opt.value} id={`rg-${opt.value}`} />
                    <Label htmlFor={`rg-${opt.value}`}>{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </Demo>

          <Demo
            title="Inline Label (no htmlFor)"
            description="Use as a visual text label without an associated control."
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label>Pontuação de crédito</Label>
                <span className="text-sm font-semibold text-success">Excelente</span>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label>Nível de endividamento</Label>
                <span className="text-sm font-semibold text-warning">Moderado</span>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label>Reserva de emergência</Label>
                <span className="text-sm font-semibold text-destructive">Ausente</span>
              </div>
            </div>
          </Demo>
        </div>
      </Section>

      {/* ── CARD-STYLE RADIO ── */}
      <Section title="Card-style Label (radio selector pattern)">
        <p className="text-sm text-muted-foreground mb-4">
          Labels can wrap Radix radio items to create clickable card selectors.
          The <code className="text-xs bg-muted px-1 py-0.5 rounded">peer-data-checked</code> variant
          activates the selected style.
        </p>
        <RadioGroup defaultValue="invest" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: "emergency", icon: "🛡", label: "Reserva" },
            { value: "invest",    icon: "📈", label: "Investir" },
            { value: "debt",      icon: "💳", label: "Dívidas" },
            { value: "retire",    icon: "🏡", label: "Aposentaria" },
          ].map((opt) => (
            <div key={opt.value}>
              <RadioGroupItem
                value={opt.value}
                id={`card-${opt.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`card-${opt.value}`}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-muted bg-muted p-4 text-center text-sm font-medium transition-all",
                  "hover:border-primary/40 hover:bg-primary/5",
                  "peer-data-checked:border-primary peer-data-checked:bg-primary/5 peer-data-checked:text-primary"
                )}
              >
                <span className="text-2xl">{opt.icon}</span>
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </Section>

      {/* ── TYPOGRAPHY ── */}
      <Section title="Typography Variations">
        <div className="flex flex-col gap-3">
          {[
            { label: "Default",   cls: "",                              note: "text-sm font-medium (default)" },
            { label: "Large",     cls: "text-base font-semibold",       note: "text-base font-semibold" },
            { label: "Small",     cls: "text-xs",                       note: "text-xs" },
            { label: "Muted",     cls: "text-muted-foreground",         note: "text-muted-foreground" },
            { label: "Primary",   cls: "text-primary",                  note: "text-primary" },
            { label: "Uppercase", cls: "text-xs uppercase tracking-wider font-semibold", note: "uppercase tracking-wider" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-6">
              <Label className={cn("w-32 shrink-0", item.cls)}>{item.label}</Label>
              <code className="text-xs text-muted-foreground">{item.note}</code>
            </div>
          ))}
        </div>
      </Section>

      {/* ── USAGE ── */}
      <Section title="Usage">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-1">Import</p>
            <CodeBlock code={`import { Label } from "@/components/ui/label"`} />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Basic — associate with an input via htmlFor</p>
            <CodeBlock
              code={`<Label htmlFor="email">E-mail</Label>
<Input id="email" type="email" />`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Required indicator</p>
            <CodeBlock
              code={`<Label htmlFor="name">
  Nome completo
  <span className="text-destructive" aria-hidden="true">*</span>
</Label>
<Input id="name" required />`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Error state</p>
            <CodeBlock
              code={`<Label htmlFor="email" className="text-destructive">E-mail</Label>
<Input id="email" type="email" aria-invalid="true" />
<p className="text-xs font-medium text-destructive">Formato inválido.</p>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Card-style radio selector</p>
            <CodeBlock
              code={`<RadioGroupItem value="invest" id="opt-invest" className="peer sr-only" />
<Label
  htmlFor="opt-invest"
  className="cursor-pointer rounded-xl border-2 border-muted p-4 \
peer-data-checked:border-primary peer-data-checked:text-primary"
>
  Investir
</Label>`}
            />
          </div>
        </div>
      </Section>

      {/* ── PROPS ── */}
      <Section title="Props">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-6 font-semibold">Prop</th>
                <th className="text-left py-2 pr-6 font-semibold">Type</th>
                <th className="text-left py-2 pr-6 font-semibold">Default</th>
                <th className="text-left py-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                { prop: "htmlFor",   type: "string",            def: "—",      desc: "ID of the associated form control" },
                { prop: "className", type: "string",            def: "—",      desc: "Additional Tailwind classes" },
                { prop: "children",  type: "React.ReactNode",   def: "—",      desc: "Label text or content" },
                { prop: "...props",  type: "LabelHTMLAttributes",def: "—",     desc: "All native <label> HTML attributes" },
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
            Always associate a label with a control using <code className="text-xs bg-muted px-1 rounded">htmlFor</code> +
            matching <code className="text-xs bg-muted px-1 rounded">id</code> — this is announced by screen readers.
          </li>
          <li>
            When wrapping a control (e.g. Checkbox) directly inside <code className="text-xs bg-muted px-1 rounded">{"<Label>"}</code>,
            the <code className="text-xs bg-muted px-1 rounded">htmlFor</code> / <code className="text-xs bg-muted px-1 rounded">id</code> pair is still preferred for explicit association.
          </li>
          <li>
            For required fields, add <code className="text-xs bg-muted px-1 rounded">{"aria-hidden=\"true\""}</code> to the
            asterisk <code className="text-xs bg-muted px-1 rounded">*</code> span, and add
            <code className="text-xs bg-muted px-1 rounded"> required</code> or <code className="text-xs bg-muted px-1 rounded">aria-required="true"</code> to the input.
          </li>
          <li>
            The label automatically dims (<code className="text-xs bg-muted px-1 rounded">opacity-50</code>) when its peer input is
            <code className="text-xs bg-muted px-1 rounded"> disabled</code>, via
            <code className="text-xs bg-muted px-1 rounded"> peer-disabled:opacity-50</code>.
          </li>
          <li>
            Clicking the label focuses and activates the associated control — no extra JS needed.
          </li>
        </ul>
      </Section>
    </div>
  )
}
