"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  email: z.email("E-mail inválido"),
  phone: z
    .string()
    .min(10, "Telefone deve ter ao menos 10 dígitos")
    .optional()
    .or(z.literal("")),
  income: z.string({ error: "Selecione uma faixa de renda" }),
  goal: z.enum(["emergency", "invest", "debt", "retire"]),
  notes: z.string().max(300, "Máximo de 300 caracteres").optional(),
  terms: z.boolean().refine((v) => v === true, "Aceite os termos para continuar"),
  newsletter: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FormShowcasePage() {
  const [dark, setDark] = useState(false)
  const [submitted, setSubmitted] = useState<FormValues | null>(null)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      income: "",
      goal: undefined,
      notes: "",
      terms: false,
      newsletter: false,
    },
  })

  function onSubmit(values: FormValues) {
    setSubmitted(values)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">Form</h1>
            <Badge variant="secondary">react-hook-form + zod</Badge>
          </div>
          <p className="text-muted-foreground">
            Accessible form fields with validation, labels, descriptions and error messages.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDark((d) => !d)}>
          {dark ? "☀ Light" : "☾ Dark"}
        </Button>
      </div>

      {/* ── FULL DEMO ── */}
      <Section title="Live Demo — Noviq Onboarding">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="joao@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Telefone{" "}
                      <span className="text-muted-foreground font-normal">(opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(11) 91234-5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Income — Select */}
              <FormField
                control={form.control}
                name="income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Renda mensal</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full" aria-invalid={!!form.formState.errors.income}>
                        <SelectValue placeholder="Selecione uma faixa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lt3k">Até R$ 3.000</SelectItem>
                        <SelectItem value="3k-7k">R$ 3.000 – R$ 7.000</SelectItem>
                        <SelectItem value="7k-15k">R$ 7.000 – R$ 15.000</SelectItem>
                        <SelectItem value="gt15k">Acima de R$ 15.000</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.income && (
                      <p className="text-xs font-medium text-destructive">
                        {form.formState.errors.income.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>

            {/* Financial goal — RadioGroup */}
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Principal objetivo financeiro</FormLabel>
                  <FormDescription>Escolha o que mais se encaixa no seu momento atual.</FormDescription>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1"
                  >
                    {[
                      { value: "emergency", label: "Reserva de emergência" },
                      { value: "invest",    label: "Começar a investir" },
                      { value: "debt",      label: "Sair das dívidas" },
                      { value: "retire",    label: "Aposentadoria" },
                    ].map((opt) => (
                      <div key={opt.value}>
                        <RadioGroupItem
                          value={opt.value}
                          id={`goal-${opt.value}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`goal-${opt.value}`}
                          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-muted bg-muted p-3 text-center text-sm font-medium transition-colors hover:bg-accent peer-data-checked:border-primary peer-data-checked:bg-primary/5 peer-data-checked:text-primary"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Observações{" "}
                    <span className="text-muted-foreground font-normal">(opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Conte um pouco sobre sua situação financeira atual…"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Máximo 300 caracteres.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Newsletter switch */}
            <FormField
              control={form.control}
              name="newsletter"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Dicas financeiras por e-mail</FormLabel>
                    <FormDescription>
                      Receba conteúdos semanais sobre finanças pessoais.
                    </FormDescription>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormItem>
              )}
            />

            {/* Terms checkbox */}
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="terms" className="cursor-pointer">
                      Li e aceito os{" "}
                      <span className="text-primary underline underline-offset-2">
                        Termos de Uso
                      </span>{" "}
                      e a{" "}
                      <span className="text-primary underline underline-offset-2">
                        Política de Privacidade
                      </span>
                    </Label>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button type="submit">Iniciar diagnóstico</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  setSubmitted(null)
                }}
              >
                Limpar
              </Button>
            </div>
          </form>
        </Form>

        {submitted && (
          <div className="mt-6 rounded-lg border border-success/30 bg-success/5 p-4">
            <p className="text-sm font-semibold text-success mb-2">Formulário enviado ✓</p>
            <pre className="text-xs text-muted-foreground overflow-auto">
              {JSON.stringify(submitted, null, 2)}
            </pre>
          </div>
        )}
      </Section>

      {/* ── INDIVIDUAL FIELDS ── */}
      <Section title="Form Elements">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Input states */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Input — states</p>
            <div className="flex flex-col gap-2">
              <Input placeholder="Default input" />
              <Input placeholder="Disabled input" disabled />
              <Input placeholder="Invalid input" aria-invalid="true" />
            </div>
          </div>

          {/* Textarea states */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Textarea — states</p>
            <div className="flex flex-col gap-2">
              <Textarea placeholder="Default textarea" />
              <Textarea placeholder="Disabled textarea" disabled />
            </div>
          </div>

          {/* Select */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Select</p>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Opção A</SelectItem>
                <SelectItem value="b">Opção B</SelectItem>
                <SelectItem value="c">Opção C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Checkbox */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Checkbox</p>
            <div className="flex flex-col gap-3">
              {[
                { id: "cb1", label: "Unchecked", checked: false },
                { id: "cb2", label: "Checked", checked: true },
                { id: "cb3", label: "Disabled unchecked", disabled: true },
                { id: "cb4", label: "Disabled checked", checked: true, disabled: true },
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
          </div>

          {/* Switch */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Switch</p>
            <div className="flex flex-col gap-3">
              {[
                { id: "sw1", label: "Off", checked: false },
                { id: "sw2", label: "On", checked: true },
                { id: "sw3", label: "Disabled off", disabled: true },
                { id: "sw4", label: "Disabled on", checked: true, disabled: true },
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
          </div>

          {/* RadioGroup */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Radio Group</p>
            <RadioGroup defaultValue="b">
              {["a", "b", "c"].map((v) => (
                <div key={v} className="flex items-center gap-2">
                  <RadioGroupItem value={v} id={`rg-${v}`} />
                  <Label htmlFor={`rg-${v}`}>Opção {v.toUpperCase()}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </Section>

      {/* ── FIELD WITH DESCRIPTION & ERROR ── */}
      <Section title="Field Anatomy">
        <div className="max-w-sm space-y-6">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              With description
            </p>
            <Label htmlFor="demo-desc">E-mail</Label>
            <Input id="demo-desc" type="email" placeholder="seunome@email.com" />
            <p className="text-xs text-muted-foreground">
              Usaremos para enviar seu diagnóstico.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              With error state
            </p>
            <Label htmlFor="demo-err" className="text-destructive">E-mail</Label>
            <Input
              id="demo-err"
              type="email"
              placeholder="seunome@email.com"
              aria-invalid="true"
              defaultValue="invalid@"
            />
            <p className="text-xs font-medium text-destructive">
              E-mail inválido. Verifique o formato e tente novamente.
            </p>
          </div>
        </div>
      </Section>

      {/* ── USAGE ── */}
      <Section title="Usage">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-1">Import</p>
            <CodeBlock
              code={`import {
  Form, FormControl, FormDescription,
  FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Basic text field</p>
            <CodeBlock
              code={`const schema = z.object({ email: z.string().email() })

const form = useForm({ resolver: zodResolver(schema) })

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>E-mail</FormLabel>
          <FormControl>
            <Input type="email" {...field} />
          </FormControl>
          <FormDescription>We'll never share your email.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Select field (without FormControl)</p>
            <CodeBlock
              code={`<FormField
  control={form.control}
  name="category"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Categoria</FormLabel>
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Opção A</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Checkbox field</p>
            <CodeBlock
              code={`<FormField
  control={form.control}
  name="terms"
  render={({ field }) => (
    <FormItem className="flex items-start gap-3">
      <Checkbox
        id="terms"
        checked={field.value}
        onCheckedChange={field.onChange}
      />
      <div>
        <Label htmlFor="terms">Accept terms and conditions</Label>
        <FormMessage />
      </div>
    </FormItem>
  )}
/>`}
            />
          </div>
        </div>
      </Section>
    </div>
  )
}
