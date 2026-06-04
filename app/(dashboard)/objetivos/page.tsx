/**
 * Objetivos
 *
 * Tela para visualizar e acompanhar metas financeiras.
 * Exibe cards com progresso, valores acumulados e status.
 */

"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { formatarMoeda } from "@/lib/calculations"
import {
  calcularProgressoObjetivo,
  calcularNecessarioMensal,
  calcularStatusObjetivo,
  calcularMesesRestantes,
  type Objetivo,
  type StatusObjetivo,
} from "@/types/financeiro"
import { toast } from "sonner"

// ─── Dados Mockados ─────────────────────────────────────────────────────────────

const OBJETIVOS_MOCKADOS: Objetivo[] = [
  {
    id: "1",
    nome: "Reserva de Emergência",
    valorAlvo: 20000,
    dataConclusao: "2026-12-01",
    valorAcumulado: 9000,
  },
  {
    id: "2",
    nome: "Viagem Europa",
    valorAlvo: 15000,
    dataConclusao: "2027-06-01",
    valorAcumulado: 3750,
  },
  {
    id: "3",
    nome: "Carro Novo",
    valorAlvo: 50000,
    dataConclusao: "2028-12-01",
    valorAcumulado: 8500,
  },
]

// ─── Componentes ───────────────────────────────────────────────────────────────────

function FormatarData(data: string): string {
  const [ano, mes] = data.split("-")
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
  return `${meses[parseInt(mes) - 1]} ${ano}`
}

function ObjetivoCard({ objetivo }: { objetivo: Objetivo }) {
  const progresso = calcularProgressoObjetivo(objetivo.valorAcumulado, objetivo.valorAlvo)
  const mesesRestantes = calcularMesesRestantes(objetivo.dataConclusao)
  const necessarioMensal = calcularNecessarioMensal(
    objetivo.valorAlvo,
    objetivo.valorAcumulado,
    mesesRestantes
  )
  const status = calcularStatusObjetivo(
    objetivo.valorAcumulado,
    objetivo.valorAlvo,
    objetivo.dataConclusao
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{objetivo.nome}</CardTitle>
          <Badge variant={status === "no_prazo" ? "default" : "destructive"}>
            {status === "no_prazo" ? "No prazo" : "Atrasado"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data de conclusão */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Prazo</span>
          <span className="font-medium">{FormatarData(objetivo.dataConclusao)}</span>
        </div>

        {/* Valores */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Valor alvo</span>
            <span className="font-medium">{formatarMoeda(objetivo.valorAlvo)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Acumulado</span>
            <span className="font-medium">{formatarMoeda(objetivo.valorAcumulado)}</span>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium tabular-nums">{progresso.toFixed(1)}%</span>
          </div>
          <Progress value={progresso} className="h-2" />
        </div>

        {/* Valor necessário/mês */}
        {necessarioMensal > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Necessário:{" "}
              <span className="font-semibold text-foreground">
                {formatarMoeda(necessarioMensal)}/mês
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ModalNovoObjetivo({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (objetivo: Omit<Objetivo, "id">) => void
}) {
  const [nome, setNome] = useState("")
  const [valorAlvo, setValorAlvo] = useState("")
  const [dataConclusao, setDataConclusao] = useState("")
  const [valorInicial, setValorInicial] = useState("")
  const [loading, setLoading] = useState(false)

  function handleClose() {
    setNome("")
    setValorAlvo("")
    setDataConclusao("")
    setValorInicial("")
    onOpenChange(false)
  }

  async function handleSalvar() {
    if (!nome || !valorAlvo || !dataConclusao) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    const valorAlvoNum = parseFloat(valorAlvo)
    const valorInicialNum = valorInicial ? parseFloat(valorInicial) : 0

    if (valorAlvoNum <= 0) {
      toast.error("Valor alvo deve ser maior que zero")
      return
    }

    setLoading(true)

    // Simular processamento
    await new Promise((r) => setTimeout(r, 500))

    onSave({
      nome,
      valorAlvo: valorAlvoNum,
      dataConclusao,
      valorAcumulado: valorInicialNum,
    })

    toast.success("Objetivo criado com sucesso!")
    handleClose()
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Objetivo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>
              Nome do objetivo <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Ex: Reserva de Emergência"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Valor alvo (R$) <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              placeholder="0,00"
              min="0"
              step="0.01"
              value={valorAlvo}
              onChange={(e) => setValorAlvo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Data de conclusão <span className="text-destructive">*</span>
            </Label>
            <Input
              type="date"
              value={dataConclusao}
              onChange={(e) => setDataConclusao(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="space-y-2">
            <Label>Valor inicial (opcional)</Label>
            <Input
              type="number"
              placeholder="0,00"
              min="0"
              step="0.01"
              value={valorInicial}
              onChange={(e) => setValorInicial(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ObjetivosPage() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>(OBJETIVOS_MOCKADOS)
  const [modalAberto, setModalAberto] = useState(false)

  function handleSalvarObjetivo(novoObjetivo: Omit<Objetivo, "id">) {
    const novo: Objetivo = {
      id: Date.now().toString(),
      ...novoObjetivo,
    }
    setObjetivos((prev) => [...prev, novo])
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Objetivos</h1>
          <p className="text-muted-foreground">
            Acompanhe suas metas financeiras
          </p>
        </div>
        <Button onClick={() => setModalAberto(true)}>
          <Plus className="size-4 mr-2" />
          Novo Objetivo
        </Button>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {objetivos.map((objetivo) => (
          <ObjetivoCard key={objetivo.id} objetivo={objetivo} />
        ))}
      </div>

      {/* Modal Novo Objetivo */}
      <ModalNovoObjetivo
        open={modalAberto}
        onOpenChange={setModalAberto}
        onSave={handleSalvarObjetivo}
      />
    </div>
  )
}
