"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Check,
  Copy,
  FileText,
  Search,
  Trash2,
  TriangleAlert,
} from "lucide-react"
import { toast } from "sonner"

import { descartarAnamnese } from "@/app/actions/anamneses"
import { formatarMoeda } from "@/lib/calculations"
import type { AnaliseAnamnese } from "@/lib/anamnese"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConverterAnamneseDialog } from "@/components/anamnese/ConverterAnamneseDialog"

/** Resumo de uma anamnese para o painel do gestor. */
export interface AnamneseResumo {
  id: string
  nome_lead: string
  email_lead: string | null
  status: "enviada" | "preenchida"
  token: string
  subconta_id: string | null
  created_at: string
  preenchida_at: string | null
  analise: AnaliseAnamnese | null
}

type FiltroStatus = "todas" | "enviada" | "preenchida"

function formatarData(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("pt-BR")
}

/**
 * Painel de anamneses do gestor (Spec 08 §3.1): lista a partir do que a RLS
 * devolve (`gestor_id = auth.uid()` — master não vê), com **busca por nome** e
 * filtro por status. Cada anamnese permite copiar o link, ver o diagnóstico,
 * converter em subconta ou descartar.
 */
export function AnamnesesPanel({ anamneses }: { anamneses: AnamneseResumo[] }) {
  const router = useRouter()
  const [busca, setBusca] = React.useState("")
  const [filtro, setFiltro] = React.useState<FiltroStatus>("todas")
  const [descartando, setDescartando] = React.useState<string | null>(null)
  const [copiado, setCopiado] = React.useState<string | null>(null)

  const filtradas = React.useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return anamneses.filter((a) => {
      const casaBusca = termo === "" || a.nome_lead.toLowerCase().includes(termo)
      const casaStatus = filtro === "todas" || a.status === filtro
      return casaBusca && casaStatus
    })
  }, [anamneses, busca, filtro])

  async function copiarLink(id: string, token: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/anamnese/${token}`)
      setCopiado(id)
      toast.success("Link copiado.")
      setTimeout(() => setCopiado((atual) => (atual === id ? null : atual)), 2000)
    } catch {
      toast.error("Não foi possível copiar o link.")
    }
  }

  async function descartar(id: string) {
    setDescartando(id)
    try {
      await descartarAnamnese(id)
      toast.success("Anamnese descartada.")
      router.refresh()
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível descartar.")
    } finally {
      setDescartando(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Anamneses ({anamneses.length})</CardTitle>
        <CardDescription>
          Acompanhe os leads, veja o diagnóstico e converta em cliente.
        </CardDescription>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filtro} onValueChange={(v) => setFiltro(v as FiltroStatus)}>
            <SelectTrigger className="sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="enviada">Enviadas</SelectItem>
              <SelectItem value="preenchida">Preenchidas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filtradas.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {anamneses.length === 0
              ? "Nenhuma anamnese ainda. Envie a primeira para captar um lead."
              : "Nenhuma anamnese encontrada com esse filtro."}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recebida</TableHead>
                <TableHead className="w-px text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtradas.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.nome_lead}</TableCell>
                  <TableCell>
                    {a.subconta_id ? (
                      <Badge variant="outline">Convertida</Badge>
                    ) : a.status === "preenchida" ? (
                      <Badge>Preenchida</Badge>
                    ) : (
                      <Badge variant="secondary">Enviada</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatarData(a.preenchida_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {a.status === "preenchida" && a.analise && (
                        <DiagnosticoDialog anamnese={a} />
                      )}

                      {a.subconta_id ? (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/${a.subconta_id}/controle-anual`}>
                            Entrar
                            <ArrowRight />
                          </Link>
                        </Button>
                      ) : a.status === "preenchida" ? (
                        <ConverterAnamneseDialog
                          anamneseId={a.id}
                          emailLead={a.email_lead}
                          trigger={
                            <Button size="sm">Converter</Button>
                          }
                        />
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copiarLink(a.id, a.token)}
                        >
                          {copiado === a.id ? <Check className="text-success" /> : <Copy />}
                          Link
                        </Button>
                      )}

                      {!a.subconta_id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground"
                          aria-label="Descartar anamnese"
                          disabled={descartando === a.id}
                          onClick={() => descartar(a.id)}
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

/** Dialog com o diagnóstico financeiro (analise) de uma anamnese preenchida. */
function DiagnosticoDialog({ anamnese }: { anamnese: AnamneseResumo }) {
  const a = anamnese.analise
  if (!a) return null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <FileText />
          Diagnóstico
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Diagnóstico — {anamnese.nome_lead}</DialogTitle>
          <DialogDescription>
            Panorama financeiro calculado a partir das respostas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Metrica titulo="Renda" valor={formatarMoeda(a.renda_total)} />
            <Metrica titulo="Despesas" valor={formatarMoeda(a.despesa_total)} />
            <Metrica
              titulo="Saldo"
              valor={formatarMoeda(a.saldo)}
              destaque={a.saldo >= 0 ? "success" : "destructive"}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Distribuição 50‑30‑20</p>
            <LinhaDist titulo="Fixas (ideal 50%)" linha={a.distribuicao.fixo} />
            <LinhaDist titulo="Variáveis (ideal 30%)" linha={a.distribuicao.variavel} />
            <LinhaDist titulo="Investimento (ideal 20%)" linha={a.distribuicao.investimento} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Metrica
              titulo="Reserva de emergência"
              valor={`${formatarMoeda(a.reserva.atual)} / ${formatarMoeda(a.reserva.meta)}`}
              sub={`${a.reserva.percentual.toFixed(0)}% da meta (6×)`}
            />
            <Metrica
              titulo="Patrimônio líquido"
              valor={formatarMoeda(a.patrimonio_liquido)}
              sub={`Dívidas: ${formatarMoeda(a.dividas_total)}`}
              destaque={a.patrimonio_liquido >= 0 ? "success" : "destructive"}
            />
          </div>

          {a.alertas.length > 0 && (
            <div className="space-y-2 rounded-lg border border-border p-3">
              <p className="flex items-center gap-2 text-sm font-medium">
                <TriangleAlert className="size-4 text-destructive" />
                Pontos de atenção
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {a.alertas.map((alerta, i) => (
                  <li key={i}>• {alerta}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Metrica({
  titulo,
  valor,
  sub,
  destaque,
}: {
  titulo: string
  valor: string
  sub?: string
  destaque?: "success" | "destructive"
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground">{titulo}</p>
      <p
        className={`text-sm font-semibold ${
          destaque === "success"
            ? "text-success"
            : destaque === "destructive"
              ? "text-destructive"
              : ""
        }`}
      >
        {valor}
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

function LinhaDist({
  titulo,
  linha,
}: {
  titulo: string
  linha: AnaliseAnamnese["distribuicao"]["fixo"]
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{titulo}</span>
      <span className="font-medium">
        {formatarMoeda(linha.real)}{" "}
        <span className="text-muted-foreground">({linha.percentual.toFixed(0)}%)</span>
      </span>
    </div>
  )
}
