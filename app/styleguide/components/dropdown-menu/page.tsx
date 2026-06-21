"use client"

import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarBadge,
} from "@/components/ui/avatar"
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

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto text-muted-foreground mt-3 leading-relaxed">
      <code>{code}</code>
    </pre>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DropdownMenuShowcasePage() {
  const [dark, setDark] = useState(false)
  const [period, setPeriod] = useState("monthly")
  const [notifications, setNotifications] = useState({ email: true, push: false, sms: false })
  const [lastAction, setLastAction] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">Dropdown Menu</h1>
            <Badge variant="secondary">radix-ui</Badge>
          </div>
          <p className="text-muted-foreground">
            Context-sensitive menu triggered by a button. Supports groups, labels, checkboxes,
            radio groups, keyboard shortcuts, destructive items, and nested submenus.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDark((d) => !d)}>
          {dark ? "☀ Light" : "☾ Dark"}
        </Button>
      </div>

      {/* ── BASIC ── */}
      <Section title="Variants">
        <div className="flex flex-wrap gap-3">

          {/* Basic with groups */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Basic Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem>Configurações</DropdownMenuItem>
                <DropdownMenuItem>Plano & Faturamento</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Suporte</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* With shortcuts */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">With Shortcuts</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  Nova transação
                  <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Nova meta
                  <DropdownMenuShortcut>⌘G</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Exportar relatório
                  <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Configurações
                <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                Excluir conta
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* With disabled items */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">With Disabled Items</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Exportar dados</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>CSV</DropdownMenuItem>
              <DropdownMenuItem>PDF</DropdownMenuItem>
              <DropdownMenuItem disabled>
                Excel
                <DropdownMenuShortcut>Em breve</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                API
                <DropdownMenuShortcut>Pro</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* With destructive */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">With Destructive</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuItem>Duplicar</DropdownMenuItem>
              <DropdownMenuItem>Arquivar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Excluir permanentemente</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </Section>

      {/* ── CHECKBOX + RADIO ── */}
      <Section title="Checkbox & Radio Items">
        <div className="flex flex-wrap gap-3">

          {/* Checkbox items */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Notificações
                <Badge variant="secondary" className="ml-1">
                  {Object.values(notifications).filter(Boolean).length}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52">
              <DropdownMenuLabel>Canais de notificação</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={notifications.email}
                onCheckedChange={(v) => setNotifications((n) => ({ ...n, email: v }))}
              >
                E-mail
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={notifications.push}
                onCheckedChange={(v) => setNotifications((n) => ({ ...n, push: v }))}
              >
                Push
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={notifications.sms}
                onCheckedChange={(v) => setNotifications((n) => ({ ...n, sms: v }))}
              >
                SMS
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Radio items */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Período:{" "}
                <span className="capitalize font-semibold">
                  {period === "weekly" ? "Semanal" : period === "monthly" ? "Mensal" : "Anual"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Período do relatório</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={period} onValueChange={setPeriod}>
                <DropdownMenuRadioItem value="weekly">Semanal</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="monthly">Mensal</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="yearly">Anual</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>

        {/* State readout */}
        <div className="mt-3 text-xs text-muted-foreground">
          Notificações:{" "}
          {Object.entries(notifications)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(", ") || "nenhuma"}{" "}
          · Período: <span className="font-mono text-foreground">{period}</span>
        </div>
      </Section>

      {/* ── SUBMENU ── */}
      <Section title="Submenu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Ações com submenu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52">
            <DropdownMenuItem>Editar transação</DropdownMenuItem>
            <DropdownMenuItem>Duplicar</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Mover para categoria</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuLabel>Categorias</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Alimentação</DropdownMenuItem>
                <DropdownMenuItem>Transporte</DropdownMenuItem>
                <DropdownMenuItem>Moradia</DropdownMenuItem>
                <DropdownMenuItem>Saúde</DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Outros</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>Lazer</DropdownMenuItem>
                    <DropdownMenuItem>Educação</DropdownMenuItem>
                    <DropdownMenuItem>Vestuário</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Exportar como</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>CSV</DropdownMenuItem>
                <DropdownMenuItem>PDF</DropdownMenuItem>
                <DropdownMenuItem>JSON</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Section>

      {/* ── REAL-WORLD PATTERNS ── */}
      <Section title="Patterns">

        {/* User account dropdown */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            User account dropdown
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary/15 text-primary text-xs">JS</AvatarFallback>
                  <AvatarBadge className="bg-success" />
                </Avatar>
                João Silva
                <span className="text-muted-foreground">▾</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="px-2 py-1.5">
                <p className="text-sm font-semibold">João Silva</p>
                <p className="text-xs text-muted-foreground">joao@email.com</p>
                <Badge variant="secondary" className="mt-1">Pro</Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <span>Meu perfil</span>
                  <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Configurações</span>
                  <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>Plano & Faturamento</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>Central de ajuda</DropdownMenuItem>
                <DropdownMenuItem>Novidades</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                Sair
                <DropdownMenuShortcut>⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table row actions */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Table row actions
          </p>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Transação</th>
                  <th className="text-left px-4 py-2 font-medium">Categoria</th>
                  <th className="text-right px-4 py-2 font-medium">Valor</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {[
                  { desc: "Supermercado",  cat: "Alimentação",   amt: "-R$ 432,50" },
                  { desc: "Tesouro Selic", cat: "Investimento",  amt: "-R$ 500,00" },
                  { desc: "Freelance",     cat: "Receita",       amt: "+R$ 1.200,00" },
                ].map((row, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 font-medium">{row.desc}</td>
                    <td className="px-4 py-2">
                      <Badge variant="outline">{row.cat}</Badge>
                    </td>
                    <td className={`px-4 py-2 text-right font-mono tabular-nums font-medium ${row.amt.startsWith("+") ? "text-success" : "text-foreground"}`}>
                      {row.amt}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Ações"
                          >
                            ···
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setLastAction(`Editar: ${row.desc}`)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setLastAction(`Duplicar: ${row.desc}`)}>
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Mover categoria</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem onClick={() => setLastAction(`Mover ${row.desc} → Alimentação`)}>Alimentação</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setLastAction(`Mover ${row.desc} → Transporte`)}>Transporte</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setLastAction(`Mover ${row.desc} → Moradia`)}>Moradia</DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setLastAction(`Excluir: ${row.desc}`)}
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {lastAction && (
            <p className="mt-2 text-xs text-muted-foreground">
              Última ação: <span className="font-mono text-foreground">{lastAction}</span>
            </p>
          )}
        </div>
      </Section>

      {/* ── USAGE ── */}
      <Section title="Usage">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-1">Import</p>
            <CodeBlock
              code={`import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuShortcut, DropdownMenuTrigger,
  // Optional:
  DropdownMenuCheckboxItem, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Basic</p>
            <CodeBlock
              code={`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Abrir menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Perfil</DropdownMenuItem>
    <DropdownMenuItem>Configurações</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">Sair</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">With checkbox items</p>
            <CodeBlock
              code={`const [checked, setChecked] = useState(true)

<DropdownMenuCheckboxItem
  checked={checked}
  onCheckedChange={setChecked}
>
  Notificações por e-mail
</DropdownMenuCheckboxItem>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">With radio group</p>
            <CodeBlock
              code={`<DropdownMenuRadioGroup value={period} onValueChange={setPeriod}>
  <DropdownMenuRadioItem value="weekly">Semanal</DropdownMenuRadioItem>
  <DropdownMenuRadioItem value="monthly">Mensal</DropdownMenuRadioItem>
  <DropdownMenuRadioItem value="yearly">Anual</DropdownMenuRadioItem>
</DropdownMenuRadioGroup>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">With submenu</p>
            <CodeBlock
              code={`<DropdownMenuSub>
  <DropdownMenuSubTrigger>Mover para</DropdownMenuSubTrigger>
  <DropdownMenuSubContent>
    <DropdownMenuItem>Alimentação</DropdownMenuItem>
    <DropdownMenuItem>Transporte</DropdownMenuItem>
  </DropdownMenuSubContent>
</DropdownMenuSub>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Align content to end of trigger</p>
            <CodeBlock
              code={`<DropdownMenuContent align="end">…</DropdownMenuContent>
{/* align: "start" (default) | "center" | "end" */}`}
            />
          </div>
        </div>
      </Section>

      {/* ── API ── */}
      <Section title="API">
        <div className="space-y-6">
          {[
            {
              component: "DropdownMenu (Root)",
              props: [
                { prop: "open",         type: "boolean",      def: "—",        desc: "Controlled open state." },
                { prop: "onOpenChange", type: "(o) => void",  def: "—",        desc: "Fires when open state changes." },
                { prop: "modal",        type: "boolean",      def: "true",     desc: "Whether to block background interaction." },
              ],
            },
            {
              component: "DropdownMenuContent",
              props: [
                { prop: "align",       type: '"start" | "center" | "end"', def: '"start"', desc: "Alignment of the menu relative to the trigger." },
                { prop: "sideOffset",  type: "number",   def: "4",       desc: "Gap in px between trigger and menu." },
                { prop: "className",   type: "string",   def: "—",       desc: "Override or extend menu styles. Use w-N to set fixed width." },
              ],
            },
            {
              component: "DropdownMenuItem",
              props: [
                { prop: "variant",   type: '"default" | "destructive"', def: '"default"', desc: "destructive applies red text and red focus background." },
                { prop: "inset",     type: "boolean",  def: "false",    desc: "Adds left padding to align with items that have icons." },
                { prop: "disabled",  type: "boolean",  def: "false",    desc: "Prevents interaction; renders at 50% opacity." },
                { prop: "onSelect",  type: "() => void", def: "—",      desc: "Fires when the item is selected (click or Enter/Space)." },
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
            Radix renders <code className="text-xs bg-muted px-1 rounded">role=&quot;menu&quot;</code> on the content and
            <code className="text-xs bg-muted px-1 rounded"> role=&quot;menuitem&quot;</code> (or <code className="text-xs bg-muted px-1 rounded">menuitemcheckbox</code> /{" "}
            <code className="text-xs bg-muted px-1 rounded">menuitemradio</code>) on each item automatically.
          </li>
          <li>
            Keyboard: <kbd className="text-xs bg-muted px-1 rounded">↑</kbd>{" "}
            <kbd className="text-xs bg-muted px-1 rounded">↓</kbd> navigate items;{" "}
            <kbd className="text-xs bg-muted px-1 rounded">Enter</kbd> /{" "}
            <kbd className="text-xs bg-muted px-1 rounded">Space</kbd> select;{" "}
            <kbd className="text-xs bg-muted px-1 rounded">Esc</kbd> closes;{" "}
            <kbd className="text-xs bg-muted px-1 rounded">→</kbd> opens a submenu;{" "}
            <kbd className="text-xs bg-muted px-1 rounded">←</kbd> closes it.
          </li>
          <li>
            Type-ahead: pressing a letter jumps to the first item starting with that character.
          </li>
          <li>
            Always use <code className="text-xs bg-muted px-1 rounded">asChild</code> on{" "}
            <code className="text-xs bg-muted px-1 rounded">DropdownMenuTrigger</code> when wrapping a semantic
            element like <code className="text-xs bg-muted px-1 rounded">{"<Button>"}</code> to avoid a nested{" "}
            <code className="text-xs bg-muted px-1 rounded">{"<button>"}</code>.
          </li>
          <li>
            For icon-only triggers (e.g., ··· button on a table row), add{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-label=&quot;Ações&quot;</code> so screen readers announce its purpose.
          </li>
          <li>
            <code className="text-xs bg-muted px-1 rounded">DropdownMenuShortcut</code> is visually decorative — the
            actual keyboard shortcuts must be implemented separately in <code className="text-xs bg-muted px-1 rounded">useEffect</code> or a global keydown handler.
          </li>
        </ul>
      </Section>
    </div>
  )
}
