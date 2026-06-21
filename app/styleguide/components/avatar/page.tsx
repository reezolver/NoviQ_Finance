"use client"

import { useEffect, useState } from "react"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// ─── Sample data ──────────────────────────────────────────────────────────────

const people = [
  { initials: "JS", name: "João Silva",    role: "Consultor",        status: "online"  as const, color: "bg-primary/15 text-primary"   },
  { initials: "MS", name: "Maria Souza",   role: "Analista",         status: "away"    as const, color: "bg-success/15 text-success"   },
  { initials: "PL", name: "Pedro Lima",    role: "Diretor",          status: "offline" as const, color: "bg-warning/15 text-warning"   },
  { initials: "AC", name: "Ana Costa",     role: "Especialista",     status: "online"  as const, color: "bg-info/15 text-info"         },
  { initials: "CN", name: "Carlos Neto",   role: "Assessor",         status: "offline" as const, color: "bg-destructive/15 text-destructive" },
]

const statusColor = {
  online:  "bg-success",
  away:    "bg-warning",
  offline: "bg-muted-foreground",
}

const statusLabel = {
  online:  "Online",
  away:    "Ausente",
  offline: "Offline",
}

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
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AvatarShowcasePage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Avatar</h1>
            <Badge variant="secondary">radix-ui</Badge>
          </div>
          <p className="text-muted-foreground">
            User profile picture with image, initials fallback, status badge, and group stacking.
            Ships with <code className="text-xs bg-muted px-1 rounded">AvatarBadge</code>,{" "}
            <code className="text-xs bg-muted px-1 rounded">AvatarGroup</code>, and{" "}
            <code className="text-xs bg-muted px-1 rounded">AvatarGroupCount</code>.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDark((d) => !d)}>
          {dark ? "☀ Light" : "☾ Dark"}
        </Button>
      </div>

      {/* ── SIZES ── */}
      <Section title="Sizes">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["sm", "default", "lg"] as const).map((size) => (
            <Demo key={size} title={`size="${size}"`}>
              <div className="flex flex-col items-center gap-3">
                {/* With image */}
                <div className="flex items-end gap-3">
                  <Avatar size={size}>
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="Avatar with image"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  {/* Fallback only */}
                  <Avatar size={size}>
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  {/* Broken image → fallback */}
                  <Avatar size={size}>
                    <AvatarImage src="/does-not-exist.png" alt="Broken" />
                    <AvatarFallback>MS</AvatarFallback>
                  </Avatar>
                </div>
                <p className="text-xs text-muted-foreground">
                  {size === "sm" ? "24px" : size === "default" ? "32px" : "40px"}
                </p>
              </div>
            </Demo>
          ))}
        </div>
      </Section>

      {/* ── FALLBACK COLORS ── */}
      <Section title="Fallback Color Variants">
        <p className="text-sm text-muted-foreground mb-4">
          Override <code className="text-xs bg-muted px-1 rounded">AvatarFallback</code>&apos;s
          default <code className="text-xs bg-muted px-1 rounded">bg-muted</code> via className.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          {people.map((p) => (
            <div key={p.initials} className="flex flex-col items-center gap-1.5">
              <Avatar size="lg">
                <AvatarFallback className={p.color}>
                  {p.initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{p.initials}</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-1.5">
            <Avatar size="lg">
              <AvatarFallback className="bg-gradient-to-br from-primary to-info text-white">
                NV
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">Gradient</span>
          </div>
        </div>
      </Section>

      {/* ── STATUS BADGE ── */}
      <Section title="AvatarBadge — Status Indicator">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Demo title="Sizes with status badge">
            <div className="flex items-end gap-6">
              {(["sm", "default", "lg"] as const).map((size) => (
                <div key={size} className="flex flex-col items-center gap-2">
                  <Avatar size={size}>
                    <AvatarFallback className="bg-primary/15 text-primary">JS</AvatarFallback>
                    <AvatarBadge className="bg-success" />
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{size}</span>
                </div>
              ))}
            </div>
          </Demo>

          <Demo title="Status variants (online / away / offline)">
            <div className="flex items-center gap-4">
              {(["online", "away", "offline"] as const).map((status) => (
                <div key={status} className="flex flex-col items-center gap-2">
                  <Avatar size="lg">
                    <AvatarFallback>JS</AvatarFallback>
                    <AvatarBadge className={statusColor[status]} />
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{statusLabel[status]}</span>
                </div>
              ))}
            </div>
          </Demo>
        </div>
      </Section>

      {/* ── AVATAR GROUP ── */}
      <Section title="AvatarGroup">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Demo title="size=sm">
            <AvatarGroup>
              {people.slice(0, 4).map((p) => (
                <Avatar key={p.initials} size="sm">
                  <AvatarFallback className={p.color}>{p.initials}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
          </Demo>

          <Demo title="size=default">
            <AvatarGroup>
              {people.slice(0, 4).map((p) => (
                <Avatar key={p.initials} size="default">
                  <AvatarFallback className={p.color}>{p.initials}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
          </Demo>

          <Demo title="size=lg">
            <AvatarGroup>
              {people.slice(0, 4).map((p) => (
                <Avatar key={p.initials} size="lg">
                  <AvatarFallback className={p.color}>{p.initials}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
          </Demo>
        </div>

        <div className="mt-4">
          <Demo title="With AvatarGroupCount overflow indicator">
            <div className="flex flex-col gap-4">
              {(["sm", "default", "lg"] as const).map((size) => (
                <div key={size} className="flex items-center gap-3">
                  <span className="w-16 text-xs text-muted-foreground font-mono shrink-0">
                    {size}
                  </span>
                  <AvatarGroup>
                    {people.slice(0, 3).map((p) => (
                      <Avatar key={p.initials} size={size}>
                        <AvatarFallback className={p.color}>{p.initials}</AvatarFallback>
                      </Avatar>
                    ))}
                    <AvatarGroupCount>+7</AvatarGroupCount>
                  </AvatarGroup>
                </div>
              ))}
            </div>
          </Demo>
        </div>
      </Section>

      {/* ── REAL-WORLD PATTERNS ── */}
      <Section title="Patterns">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Profile header */}
          <Demo title="Profile header" className="sm:col-span-2">
            <div className="flex items-start gap-4">
              <Avatar size="lg">
                <AvatarFallback className="bg-primary/15 text-primary text-base font-semibold">
                  JS
                </AvatarFallback>
                <AvatarBadge className="bg-success" />
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-base font-semibold">João Silva</p>
                  <Badge variant="secondary">Pro</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">joao@email.com</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>Cliente desde Jan 2025</span>
                  <Separator orientation="vertical" className="h-3" />
                  <span className="text-success font-medium">● Online</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">Editar perfil</Button>
            </div>
          </Demo>

          {/* Member list */}
          <Demo title="Member list">
            <ul className="flex flex-col divide-y">
              {people.map((p) => (
                <li key={p.initials} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                  <Avatar size="default">
                    <AvatarFallback className={p.color}>{p.initials}</AvatarFallback>
                    <AvatarBadge className={statusColor[p.status]} />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.role}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {statusLabel[p.status]}
                  </span>
                </li>
              ))}
            </ul>
          </Demo>

          {/* Team overview card */}
          <Demo title="Team overview — group + count">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold">Equipe Noviq Finance</p>
                <p className="text-xs text-muted-foreground mt-0.5">12 membros ativos</p>
              </div>
              <AvatarGroup>
                {people.map((p) => (
                  <Avatar key={p.initials} size="default">
                    <AvatarFallback className={p.color}>{p.initials}</AvatarFallback>
                  </Avatar>
                ))}
                <AvatarGroupCount>+7</AvatarGroupCount>
              </AvatarGroup>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-success inline-block" />
                  <span className="text-muted-foreground">2 online</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-warning inline-block" />
                  <span className="text-muted-foreground">1 ausente</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-muted-foreground inline-block" />
                  <span className="text-muted-foreground">2 offline</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-fit">
                Ver todos os membros
              </Button>
            </div>
          </Demo>

          {/* Comment / activity feed */}
          <Demo title="Activity feed" className="sm:col-span-2">
            <ul className="flex flex-col gap-4">
              {[
                { person: people[0], time: "2min atrás",   action: "adicionou uma nova meta: Viagem Europa" },
                { person: people[1], time: "15min atrás",  action: "atualizou o orçamento de Alimentação para R$ 650" },
                { person: people[2], time: "1h atrás",     action: "concluiu o diagnóstico financeiro" },
              ].map(({ person, time, action }) => (
                <li key={person.initials} className="flex items-start gap-3">
                  <Avatar size="sm">
                    <AvatarFallback className={person.color}>{person.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-sm">
                    <span className="font-medium">{person.name}</span>{" "}
                    <span className="text-muted-foreground">{action}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{time}</span>
                </li>
              ))}
            </ul>
          </Demo>

        </div>
      </Section>

      {/* ── USAGE ── */}
      <Section title="Usage">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-1">Import</p>
            <CodeBlock
              code={`import {
  Avatar, AvatarBadge, AvatarFallback,
  AvatarGroup, AvatarGroupCount, AvatarImage,
} from "@/components/ui/avatar"`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">With image + fallback</p>
            <CodeBlock
              code={`<Avatar>
  <AvatarImage src="/photo.jpg" alt="João Silva" />
  <AvatarFallback>JS</AvatarFallback>
</Avatar>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Sizes — sm / default / lg</p>
            <CodeBlock
              code={`<Avatar size="sm">…</Avatar>   {/* 24px */}
<Avatar size="default">…</Avatar> {/* 32px (default) */}
<Avatar size="lg">…</Avatar>      {/* 40px */}`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Status badge</p>
            <CodeBlock
              code={`<Avatar size="lg">
  <AvatarFallback>JS</AvatarFallback>
  {/* default bg-primary; override with className */}
  <AvatarBadge className="bg-success" />   {/* online  */}
  <AvatarBadge className="bg-warning" />   {/* away    */}
  <AvatarBadge className="bg-muted-foreground" /> {/* offline */}
</Avatar>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Custom fallback color</p>
            <CodeBlock
              code={`<Avatar>
  <AvatarFallback className="bg-primary/15 text-primary">JS</AvatarFallback>
</Avatar>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Avatar group with overflow count</p>
            <CodeBlock
              code={`<AvatarGroup>
  <Avatar><AvatarFallback>A</AvatarFallback></Avatar>
  <Avatar><AvatarFallback>B</AvatarFallback></Avatar>
  <Avatar><AvatarFallback>C</AvatarFallback></Avatar>
  <AvatarGroupCount>+7</AvatarGroupCount>
</AvatarGroup>`}
            />
          </div>
        </div>
      </Section>

      {/* ── API ── */}
      <Section title="API">
        <div className="space-y-6">
          {[
            {
              component: "Avatar",
              props: [
                { prop: "size",      type: '"sm" | "default" | "lg"', def: '"default"', desc: "24px / 32px / 40px. All sub-components respond via group-data selectors." },
                { prop: "className", type: "string",                  def: "—",         desc: "Applied to the root circle element." },
              ],
            },
            {
              component: "AvatarImage",
              props: [
                { prop: "src",       type: "string",  def: "—", desc: "Image URL. Falls back to AvatarFallback when the image fails to load." },
                { prop: "alt",       type: "string",  def: "—", desc: "Alt text for screen readers. Required for accessible images." },
              ],
            },
            {
              component: "AvatarFallback",
              props: [
                { prop: "className", type: "string", def: "—", desc: "Override bg-muted/text-muted-foreground for custom initials colors." },
                { prop: "delayMs",   type: "number", def: "—", desc: "Delay before fallback shows (avoids flash during image load)." },
              ],
            },
            {
              component: "AvatarBadge",
              props: [
                { prop: "className", type: "string", def: "—", desc: "Override bg-primary for status dot color. Use bg-success / bg-warning / bg-muted-foreground." },
              ],
            },
            {
              component: "AvatarGroupCount",
              props: [
                { prop: "children",  type: "string | number", def: "—", desc: 'The overflow label, e.g. "+7".' },
                { prop: "className", type: "string",           def: "—", desc: "Inherits size from the parent AvatarGroup automatically." },
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
            Always provide <code className="text-xs bg-muted px-1 rounded">alt</code> text on{" "}
            <code className="text-xs bg-muted px-1 rounded">AvatarImage</code>. Use the person&apos;s name,
            e.g. <code className="text-xs bg-muted px-1 rounded">alt=&quot;João Silva&quot;</code>.
          </li>
          <li>
            <code className="text-xs bg-muted px-1 rounded">AvatarFallback</code> shows only after the image
            fails or the <code className="text-xs bg-muted px-1 rounded">delayMs</code> has elapsed — this prevents
            a flash of initials during a fast image load.
          </li>
          <li>
            <code className="text-xs bg-muted px-1 rounded">AvatarBadge</code> is purely decorative — add a
            visually hidden label (e.g. <code className="text-xs bg-muted px-1 rounded">sr-only</code>) or a
            tooltip if the status is meaningful to the user.
          </li>
          <li>
            <code className="text-xs bg-muted px-1 rounded">AvatarGroup</code> has no built-in label; wrap it
            with an <code className="text-xs bg-muted px-1 rounded">aria-label</code> on the parent element
            (e.g. &quot;5 team members&quot;).
          </li>
          <li>
            Initials in <code className="text-xs bg-muted px-1 rounded">AvatarFallback</code> are read aloud
            as text by screen readers. Use real names or recognizable abbreviations.
          </li>
        </ul>
      </Section>
    </div>
  )
}
