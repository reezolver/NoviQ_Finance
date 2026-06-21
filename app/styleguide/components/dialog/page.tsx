"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

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

export default function DialogShowcasePage() {
  const [dark, setDark] = useState(false)
  const [controlledOpen, setControlledOpen] = useState(false)
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">Dialog</h1>
            <Badge variant="secondary">radix-ui</Badge>
          </div>
          <p className="text-muted-foreground">
            A modal window that interrupts the user to focus on a specific task or information.
            Traps focus, blocks interaction with the page, and is dismissible via{" "}
            <kbd className="text-xs bg-muted px-1 rounded">Esc</kbd> or the close button.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDark((d) => !d)}>
          {dark ? "☀ Light" : "☾ Dark"}
        </Button>
      </div>

      {/* ── VARIANTS ── */}
      <Section title="Variants">
        <div className="flex flex-wrap gap-3">

          {/* Basic */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Basic Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Diagnóstico financeiro</DialogTitle>
                <DialogDescription>
                  Seu diagnóstico está pronto! Identificamos 3 oportunidades de melhoria no
                  seu perfil financeiro.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton>
                <Button>Ver resultados</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* No close button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">No X button</Button>
            </DialogTrigger>
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>Sessão expirando</DialogTitle>
                <DialogDescription>
                  Sua sessão expira em 2 minutos. Deseja permanecer conectado?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Sair</Button>
                </DialogClose>
                <Button>Continuar sessão</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Destructive confirm */}
          <Dialog onOpenChange={() => setDeleteConfirmed(false)}>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete Dialog</Button>
            </DialogTrigger>
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>Excluir conta</DialogTitle>
                <DialogDescription>
                  Esta ação é permanente. Todos os seus dados financeiros, histórico e metas
                  serão removidos e não poderão ser recuperados.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteConfirmed(true)}
                  >
                    Sim, excluir conta
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {deleteConfirmed && (
            <span className="self-center text-xs text-destructive font-medium">
              ✓ Ação confirmada
            </span>
          )}

          {/* No footer */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">No Footer</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dica financeira do dia</DialogTitle>
                <DialogDescription>
                  Separe ao menos 10% da sua renda mensalmente antes de pagar qualquer conta.
                  Essa estratégia, chamada de &quot;pagar a si mesmo primeiro&quot;, é o fundamento de
                  qualquer plano financeiro sólido.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

        </div>
      </Section>

      {/* ── SIZES ── */}
      <Section title="Sizes">
        <p className="text-sm text-muted-foreground mb-4">
          Override the default <code className="text-xs bg-muted px-1 rounded">sm:max-w-sm</code> width
          by passing a <code className="text-xs bg-muted px-1 rounded">className</code> to{" "}
          <code className="text-xs bg-muted px-1 rounded">DialogContent</code>.
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Small (default)", cls: "" },
            { label: "Medium",  cls: "sm:max-w-md" },
            { label: "Large",   cls: "sm:max-w-lg" },
            { label: "XL",      cls: "sm:max-w-xl" },
            { label: "Full width", cls: "sm:max-w-3xl" },
          ].map((item) => (
            <Dialog key={item.label}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">{item.label}</Button>
              </DialogTrigger>
              <DialogContent className={item.cls}>
                <DialogHeader>
                  <DialogTitle>{item.label}</DialogTitle>
                  <DialogDescription>
                    {item.cls
                      ? `This dialog uses className="${item.cls}" on DialogContent.`
                      : "This is the default size — sm:max-w-sm (384px on desktop)."}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter showCloseButton />
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </Section>

      {/* ── WITH FORM ── */}
      <Section title="With a Form">
        <div className="flex flex-wrap gap-3">

          {/* Simple form */}
          <Dialog>
            <DialogTrigger asChild>
              <Button>Editar perfil</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Editar perfil</DialogTitle>
                <DialogDescription>
                  Atualize seus dados pessoais. Clique em salvar quando terminar.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="d-name">Nome completo</Label>
                  <Input id="d-name" defaultValue="João Silva" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="d-email">E-mail</Label>
                  <Input id="d-email" type="email" defaultValue="joao@email.com" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="d-phone">Telefone</Label>
                  <Input id="d-phone" type="tel" defaultValue="(11) 91234-5678" />
                </div>
              </div>
              <DialogFooter showCloseButton>
                <Button type="submit">Salvar alterações</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Feedback / textarea */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Enviar feedback</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Enviar feedback</DialogTitle>
                <DialogDescription>
                  Sua opinião nos ajuda a melhorar a Noviq Finance.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="d-feedback">Mensagem</Label>
                <Textarea
                  id="d-feedback"
                  placeholder="O que você gostaria de ver na plataforma?"
                />
              </div>
              <DialogFooter showCloseButton>
                <Button>Enviar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </Section>

      {/* ── CONTROLLED ── */}
      <Section title="Controlled">
        <div className="flex flex-col gap-3 max-w-sm">
          <p className="text-sm text-muted-foreground">
            Manage open state externally with <code className="text-xs bg-muted px-1 rounded">open</code> and{" "}
            <code className="text-xs bg-muted px-1 rounded">onOpenChange</code>.
          </p>
          <div className="flex items-center gap-3">
            <Button onClick={() => setControlledOpen(true)}>
              Abrir programaticamente
            </Button>
            <span className="text-sm text-muted-foreground">
              Estado:{" "}
              <span className="font-mono text-foreground">
                {controlledOpen ? "open" : "closed"}
              </span>
            </span>
          </div>
          <Dialog open={controlledOpen} onOpenChange={setControlledOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Controlado externamente</DialogTitle>
                <DialogDescription>
                  Este dialog foi aberto via <code className="text-xs bg-muted px-1 rounded">setControlledOpen(true)</code>.
                  O estado é gerenciado fora do componente.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setControlledOpen(false)}>Fechar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Section>

      {/* ── SCROLLABLE CONTENT ── */}
      <Section title="Scrollable Content">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Termos e Condições</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Termos de Uso — Noviq Finance</DialogTitle>
              <DialogDescription>
                Leia atentamente antes de continuar.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-64 overflow-y-auto text-sm text-muted-foreground space-y-3 pr-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <p key={i}>
                  <strong className="text-foreground">Cláusula {i + 1}.</strong>{" "}
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl
                  vel ultricies lacinia, nisl nisl aliquam nisl, nec aliquam nisl nisl sit
                  amet nisl. Pellentesque habitant morbi tristique senectus et netus et
                  malesuada fames ac turpis egestas.
                </p>
              ))}
            </div>
            <DialogFooter showCloseButton>
              <Button>Aceito os termos</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      {/* ── USAGE ── */}
      <Section title="Usage">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-1">Import</p>
            <CodeBlock
              code={`import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Basic</p>
            <CodeBlock
              code={`<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título do dialog</DialogTitle>
      <DialogDescription>Descrição opcional.</DialogDescription>
    </DialogHeader>
    <DialogFooter showCloseButton>
      <Button>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Destructive confirm — no accidental Esc dismiss</p>
            <CodeBlock
              code={`<Dialog>
  <DialogTrigger asChild>
    <Button variant="destructive">Excluir</Button>
  </DialogTrigger>
  <DialogContent showCloseButton={false}>
    <DialogHeader>
      <DialogTitle>Confirmar exclusão</DialogTitle>
      <DialogDescription>Esta ação é irreversível.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancelar</Button>
      </DialogClose>
      <Button variant="destructive">Excluir</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Controlled</p>
            <CodeBlock
              code={`const [open, setOpen] = useState(false)

// Open it from anywhere:
<Button onClick={() => setOpen(true)}>Abrir</Button>

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Controlado</DialogTitle>
    </DialogHeader>
    <DialogFooter>
      <Button onClick={() => setOpen(false)}>Fechar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Custom width</p>
            <CodeBlock
              code={`{/* Default: sm:max-w-sm (384px) */}
<DialogContent className="sm:max-w-lg">…</DialogContent>

{/* Full-width on all screens */}
<DialogContent className="max-w-full sm:max-w-3xl">…</DialogContent>`}
            />
          </div>
        </div>
      </Section>

      {/* ── API TABLE ── */}
      <Section title="API">
        <div className="space-y-6">
          {[
            {
              component: "Dialog (Root)",
              props: [
                { prop: "open",           type: "boolean",      def: "—",      desc: "Controlled open state" },
                { prop: "defaultOpen",    type: "boolean",      def: "false",  desc: "Uncontrolled initial state" },
                { prop: "onOpenChange",   type: "(o) => void",  def: "—",      desc: "Fires when open state changes" },
                { prop: "modal",          type: "boolean",      def: "true",   desc: "Whether to block background interaction" },
              ],
            },
            {
              component: "DialogContent",
              props: [
                { prop: "showCloseButton", type: "boolean",  def: "true",   desc: "Shows the × icon button at top-right" },
                { prop: "className",       type: "string",   def: "—",      desc: "Use to override default sm:max-w-sm width" },
              ],
            },
            {
              component: "DialogFooter",
              props: [
                { prop: "showCloseButton", type: "boolean",  def: "false",  desc: "Appends a built-in 'Close' button to the footer" },
                { prop: "className",       type: "string",   def: "—",      desc: "Override footer styles" },
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
            <strong className="text-foreground">Focus trap:</strong> when open, keyboard focus is
            locked inside the dialog. Focus returns to the trigger on close.
          </li>
          <li>
            <kbd className="text-xs bg-muted px-1 rounded">Esc</kbd> closes the dialog by default.
            Set <code className="text-xs bg-muted px-1 rounded">onEscapeKeyDown</code> on{" "}
            <code className="text-xs bg-muted px-1 rounded">DialogContent</code> to override.
          </li>
          <li>
            <strong className="text-foreground">Always include <code className="text-xs bg-muted px-1 rounded">DialogTitle</code></strong> —
            it sets the <code className="text-xs bg-muted px-1 rounded">aria-labelledby</code> on the dialog, which screen readers announce when it opens.
          </li>
          <li>
            <code className="text-xs bg-muted px-1 rounded">DialogDescription</code> sets{" "}
            <code className="text-xs bg-muted px-1 rounded">aria-describedby</code>. If you hide it visually,
            use <code className="text-xs bg-muted px-1 rounded">className=&quot;sr-only&quot;</code> to keep it for screen readers.
          </li>
          <li>
            <strong className="text-foreground">Clicking the overlay</strong> closes the dialog.
            Prevent it with <code className="text-xs bg-muted px-1 rounded">onPointerDownOutside={"{(e) => e.preventDefault()}"}</code>.
          </li>
          <li>
            For destructive actions: remove the X close button and require explicit &quot;Cancel&quot; / &quot;Confirm&quot;
            choices to prevent accidental dismissal.
          </li>
        </ul>
      </Section>
    </div>
  )
}
