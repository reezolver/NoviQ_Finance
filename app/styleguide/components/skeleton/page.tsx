"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarBadge } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ProgressBar } from "@/components/ProgressBar"
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

function LoadToggle({
  loaded,
  onToggle,
}: {
  loaded: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        Estado
      </span>
      <Button size="xs" variant="outline" onClick={onToggle}>
        {loaded ? "← Mostrar skeleton" : "Mostrar conteúdo →"}
      </Button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SkeletonShowcasePage() {
  const [dark, setDark] = useState(false)

  // Independent loaded states per pattern
  const [profileLoaded,    setProfileLoaded]    = useState(false)
  const [cardLoaded,       setCardLoaded]       = useState(false)
  const [tableLoaded,      setTableLoaded]      = useState(false)
  const [listLoaded,       setListLoaded]       = useState(false)
  const [dashboardLoaded,  setDashboardLoaded]  = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">Skeleton</h1>
            <Badge variant="secondary">animate-pulse</Badge>
          </div>
          <p className="text-muted-foreground">
            A pulsing placeholder that mirrors your real layout while content loads.
            It&apos;s a single <code className="text-xs bg-muted px-1 rounded">div</code> with{" "}
            <code className="text-xs bg-muted px-1 rounded">animate-pulse bg-muted</code> — shape it
            entirely with <code className="text-xs bg-muted px-1 rounded">className</code>.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDark((d) => !d)}>
          {dark ? "☀ Light" : "☾ Dark"}
        </Button>
      </div>

      {/* ── PRIMITIVES ── */}
      <Section title="Primitive Shapes">
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <div className="flex flex-col gap-3">
            {/* Text lines */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Text lines</p>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <Separator />
            {/* Circle / avatar */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Circle (avatar)</p>
              <div className="flex items-end gap-3">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="size-12 rounded-full" />
              </div>
            </div>
            <Separator />
            {/* Rectangles / images */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Rectangles (images, cards)</p>
              <div className="flex flex-wrap gap-3 items-end">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-16 w-24 rounded-lg" />
                <Skeleton className="h-32 w-48 rounded-xl" />
                <Skeleton className="aspect-video w-40 rounded-xl" />
              </div>
            </div>
            <Separator />
            {/* Buttons / pills */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Buttons & pills</p>
              <div className="flex flex-wrap gap-3 items-center">
                <Skeleton className="h-7 w-20 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-md" />
                <Skeleton className="h-9 w-36 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── PROFILE HEADER ── */}
      <Section title="Profile Header">
        <LoadToggle loaded={profileLoaded} onToggle={() => setProfileLoaded((v) => !v)} />
        <div className="rounded-lg border bg-card p-5">
          {!profileLoaded ? (
            /* ── SKELETON ── */
            <div className="flex items-start gap-4">
              <Skeleton className="size-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-4 w-40" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-8 w-24 rounded-md shrink-0" />
            </div>
          ) : (
            /* ── LOADED ── */
            <div className="flex items-start gap-4">
              <Avatar size="lg">
                <AvatarFallback className="bg-primary/15 text-primary text-base font-semibold">JS</AvatarFallback>
                <AvatarBadge className="bg-success" />
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold">João Silva</p>
                  <Badge variant="secondary">Pro</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">joao@email.com</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>Cliente desde Jan 2025</span>
                  <Separator orientation="vertical" className="h-3" />
                  <span className="text-success">● Online</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">Editar perfil</Button>
            </div>
          )}
        </div>
      </Section>

      {/* ── CARD ── */}
      <Section title="Card">
        <LoadToggle loaded={cardLoaded} onToggle={() => setCardLoaded((v) => !v)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i}>
              {!cardLoaded ? (
                /* ── SKELETON ── */
                <div className="rounded-xl border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-36" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="size-8 rounded-md" />
                  </div>
                  <Skeleton className="h-px w-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3.5 w-10" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-28 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                </div>
              ) : (
                /* ── LOADED ── */
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-heading text-base font-medium">
                          {i === 1 ? "Reserva de emergência" : "Viagem Europa"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {i === 1 ? "Meta: R$ 15.000" : "Meta: R$ 10.000"}
                        </div>
                      </div>
                      <Badge variant="default">{i === 1 ? "72%" : "38%"}</Badge>
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-3">
                    <p className="text-sm text-muted-foreground">
                      {i === 1
                        ? "Você está quase lá! Continue poupando R$ 800/mês para atingir a meta."
                        : "Aporte R$ 500/mês para chegar à meta em 12 meses."}
                    </p>
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progresso</span>
                        <span className="font-medium">{i === 1 ? "72%" : "38%"}</span>
                      </div>
                      <ProgressBar
                        value={i === 1 ? 72 : 38}
                        variant={i === 1 ? "success" : "default"}
                        size="sm"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm">Ver detalhes</Button>
                    <Button variant="outline" size="sm" className="ml-2">Editar meta</Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ── TABLE ── */}
      <Section title="Table Rows">
        <LoadToggle loaded={tableLoaded} onToggle={() => setTableLoaded((v) => !v)} />
        <div className="rounded-xl border overflow-hidden">
          {/* Fixed header */}
          <div className="grid grid-cols-[1fr_100px_110px_80px] gap-0 border-b bg-muted/50 px-4 py-2 text-xs font-semibold text-muted-foreground">
            <span>Transação</span>
            <span>Categoria</span>
            <span className="text-right">Valor</span>
            <span />
          </div>
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-3">
                {!tableLoaded ? (
                  /* ── SKELETON ROW ── */
                  <div className="grid grid-cols-[1fr_100px_110px_80px] items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-7 rounded-md shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-4 w-20 ml-auto" />
                    <div className="flex gap-1 justify-end">
                      <Skeleton className="size-6 rounded-md" />
                      <Skeleton className="size-6 rounded-md" />
                    </div>
                  </div>
                ) : (
                  /* ── LOADED ROW ── */
                  <div className="grid grid-cols-[1fr_100px_110px_80px] items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-md bg-primary/10 flex items-center justify-center text-sm">
                        {["🛒","💰","🏠","🚌","💊"][i]}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-tight">
                          {["Supermercado","Salário","Aluguel","Ônibus","Farmácia"][i]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {["27/05","01/05","05/05","23/05","20/05"][i]}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs w-fit">
                      {["Alimentação","Receita","Moradia","Transporte","Saúde"][i]}
                    </Badge>
                    <span className={cn(
                      "text-sm font-mono tabular-nums text-right",
                      i === 1 ? "text-success" : "text-foreground"
                    )}>
                      {i === 1 ? "+R$ 7.500" : ["-R$ 432","-R$ 1.800","-R$ 12","-R$ 89"][i === 0 ? 0 : i - 2] ?? "-R$ 49"}
                    </span>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon-sm">✏️</Button>
                      <Button variant="ghost" size="icon-sm">🗑️</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── LIST ── */}
      <Section title="Activity List">
        <LoadToggle loaded={listLoaded} onToggle={() => setListLoaded((v) => !v)} />
        <div className="rounded-xl border divide-y">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4">
              {!listLoaded ? (
                /* ── SKELETON ── */
                <>
                  <Skeleton className="size-8 rounded-full shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-3 w-16 shrink-0" />
                </>
              ) : (
                /* ── LOADED ── */
                <>
                  <Avatar size="sm">
                    <AvatarFallback className="bg-primary/15 text-primary text-xs">
                      {["JS","MS","PL","AC"][i]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-sm">
                    <span className="font-medium">
                      {["João Silva","Maria Souza","Pedro Lima","Ana Costa"][i]}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {[
                        "adicionou uma nova meta: Viagem Europa",
                        "atualizou o orçamento de Alimentação",
                        "concluiu o diagnóstico financeiro",
                        "atingiu 100% da reserva de emergência 🎉",
                      ][i]}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {["2min","15min","1h","3h"][i]} atrás
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ── DASHBOARD STATS ── */}
      <Section title="Dashboard Stats">
        <LoadToggle loaded={dashboardLoaded} onToggle={() => setDashboardLoaded((v) => !v)} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Saldo",      value: "R$ 5.658", delta: "+8%",   color: "text-success"  },
            { label: "Receitas",   value: "R$ 8.700", delta: "+16%",  color: "text-success"  },
            { label: "Despesas",   value: "R$ 3.042", delta: "-4%",   color: "text-success"  },
            { label: "Poupança",   value: "R$ 1.500", delta: "+5%",   color: "text-success"  },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl border bg-card p-4">
              {!dashboardLoaded ? (
                /* ── SKELETON ── */
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-7 w-28" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ) : (
                /* ── LOADED ── */
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-xl font-bold tabular-nums">{stat.value}</p>
                  <p className={cn("text-xs font-medium mt-0.5", stat.color)}>{stat.delta} este mês</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ── USAGE ── */}
      <Section title="Usage">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-1">Import</p>
            <CodeBlock code={`import { Skeleton } from "@/components/ui/skeleton"`} />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Primitive shapes</p>
            <CodeBlock
              code={`{/* Text line */}
<Skeleton className="h-4 w-64" />

{/* Circle avatar */}
<Skeleton className="size-10 rounded-full" />

{/* Square image */}
<Skeleton className="h-40 w-full rounded-xl" />

{/* Button */}
<Skeleton className="h-8 w-24 rounded-md" />

{/* Badge / pill */}
<Skeleton className="h-5 w-16 rounded-full" />`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Conditionally show skeleton or real content</p>
            <CodeBlock
              code={`const [isLoading, setIsLoading] = useState(true)

{isLoading ? (
  <div className="flex items-center gap-3">
    <Skeleton className="size-10 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
) : (
  <div className="flex items-center gap-3">
    <Avatar>…</Avatar>
    <div>
      <p className="font-medium">{user.name}</p>
      <p className="text-sm text-muted-foreground">{user.email}</p>
    </div>
  </div>
)}`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Mimic paragraph text with decreasing widths</p>
            <CodeBlock
              code={`<div className="space-y-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-5/6" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Table row skeleton</p>
            <CodeBlock
              code={`{Array.from({ length: 5 }).map((_, i) => (
  <div key={i} className="flex items-center gap-4 py-3 border-b">
    <Skeleton className="size-8 rounded-md" />
    <Skeleton className="h-4 flex-1 max-w-xs" />
    <Skeleton className="h-5 w-20 rounded-full" />
    <Skeleton className="h-4 w-24 ml-auto" />
  </div>
))}`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Disable animation (e.g. for reduced motion)</p>
            <CodeBlock
              code={`{/* Remove pulse; use a flat muted block */}
<Skeleton className="h-4 w-64 animate-none opacity-60" />`}
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
                { prop: "className",  type: "string",  def: "—",     desc: "Controls shape: h-N (height), w-N (width), rounded-* (corners). Everything else inherits animate-pulse bg-muted." },
                { prop: "...props",   type: "React.ComponentProps<\"div\">",  def: "—", desc: "All native div attributes — aria-label, aria-hidden, etc." },
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
            Skeleton has no implicit ARIA role — screen readers skip it by default if it contains no text.
            Add <code className="text-xs bg-muted px-1 rounded">aria-hidden=&quot;true&quot;</code> explicitly to ensure
            it is completely invisible to assistive technology.
          </li>
          <li>
            Wrap the skeleton region in a container with{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-busy=&quot;true&quot;</code> and{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-label=&quot;Carregando...&quot;</code> so screen readers
            announce loading state.
          </li>
          <li>
            When content loads, remove <code className="text-xs bg-muted px-1 rounded">aria-busy</code> and swap
            in the real content — screen readers will then read the new content naturally.
          </li>
          <li>
            Respect <code className="text-xs bg-muted px-1 rounded">prefers-reduced-motion</code> — Tailwind
            applies <code className="text-xs bg-muted px-1 rounded">motion-safe:animate-pulse</code> by default in
            some setups. If your users have reduced motion enabled, consider{" "}
            <code className="text-xs bg-muted px-1 rounded">className=&quot;motion-safe:animate-pulse&quot;</code> instead.
          </li>
        </ul>
      </Section>
    </div>
  )
}
