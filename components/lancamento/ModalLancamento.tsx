/**
 * ModalLancamento
 *
 * Modal para registrar lançamentos financeiros em menos de 10 segundos.
 * Suporta: Receita, Despesa Fixa, Despesa Variável e Objetivo.
 */

"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// ─── Types ─────────────────────────────────────────────────────────────────────

export type TipoLancamento = "receita" | "despesa_fixa" | "despesa_variavel" | "objetivo"

export interface Lancamento {
  id: string
  tipo: TipoLancamento
  categoria: string
  valor: number
  data: string
  descricao?: string
}

interface ModalLancamentoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (lancamento: Lancamento) => void
}

// ─── Constants ───────────────────────────────────────────────────────────────────

const CATEGORIAS_POR_TIPO: Record<TipoLancamento, string[]> = {
  receita: ["Salário", "Investimentos", "Outras"],
  despesa_fixa: ["Aluguel", "Internet", "Gás", "Seguro", "Investimento (aporte)"],
  despesa_variavel: ["Lazer", "Transporte", "Alimentação", "Uber", "Outros"],
  objetivo: [],
}

const LABELS_TIPO: Record<TipoLancamento, string> = {
  receita: "Receita",
  despesa_fixa: "Despesa Fixa",
  despesa_variavel: "Despesa Variável",
  objetivo: "Objetivo",
}

// ─── Helper ─────────────────────────────────────────────────────────────────────

function getHoje(): string {
  return new Date().toISOString().split("T")[0]
}

// ─── Component ───────────────────────────────────────────────────────────────────

export function ModalLancamento({ open, onOpenChange, onSave }: ModalLancamentoProps) {
  // Estado do formulário
  const [tipo, setTipo] = useState<TipoLancamento | "">("")
  const [categoria, setCategoria] = useState("")
  const [valor, setValor] = useState("")
  const [data, setData] = useState(getHoje())
  const [descricao, setDescricao] = useState("")

  // Estados de controle
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [erros, setErros] = useState<{
    tipo?: string
    categoria?: string
    valor?: string
  }>({})

  // Resetar formulário ao abrir
  useEffect(() => {
    if (open) {
      setTipo("")
      setCategoria("")
      setValor("")
      setData(getHoje())
      setDescricao("")
      setErros({})
    }
  }, [open])

  // Atualizar categorias quando tipo muda
  useEffect(() => {
    if (tipo) {
      setCategoria("")
    }
  }, [tipo])

  // Validar formulário
  function validar(): boolean {
    const novosErros: typeof erros = {}

    if (!tipo) {
      novosErros.tipo = "Tipo é obrigatório"
    }

    if (!categoria) {
      novosErros.categoria = "Categoria é obrigatória"
    }

    if (!valor || parseFloat(valor) <= 0) {
      novosErros.valor = "Valor deve ser maior que zero"
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  // Salvar lançamento
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validar()) {
      return
    }

    setIsSubmitting(true)

    // Simular processamento
    setTimeout(() => {
      const lancamento: Lancamento = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        tipo: tipo as TipoLancamento,
        categoria,
        valor: parseFloat(valor),
        data,
        descricao: descricao || undefined,
      }

      onSave(lancamento)

      // Reset e fechar
      setTipo("")
      setCategoria("")
      setValor("")
      setData(getHoje())
      setDescricao("")
      setErros({})
      setIsSubmitting(false)
      onOpenChange(false)

      // Toast de confirmação
      toast.success("Lançamento registrado!", {
        description: `${LABELS_TIPO[tipo as TipoLancamento]}: ${categoria} - R$ ${parseFloat(valor).toFixed(2)}`,
      })
    }, 500)
  }

  // Categorias disponíveis baseadas no tipo
  const categoriasDisponiveis = tipo ? CATEGORIAS_POR_TIPO[tipo] : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Lançamento</DialogTitle>
          <DialogDescription>
            Registre uma receita ou despesa em segundos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">
              Tipo <span className="text-destructive">*</span>
            </Label>
            <Select
              value={tipo}
              onValueChange={(value) => setTipo(value as TipoLancamento | "")}
            >
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectLabel>Receitas</SelectLabel>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectLabel>Despesas</SelectLabel>
                <SelectItem value="despesa_fixa">Despesa Fixa</SelectItem>
                <SelectItem value="despesa_variavel">Despesa Variável</SelectItem>
                <SelectLabel>Outros</SelectLabel>
                <SelectItem value="objetivo">Objetivo</SelectItem>
              </SelectContent>
            </Select>
            {erros.tipo && <p className="text-sm text-destructive">{erros.tipo}</p>}
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="categoria">
              Categoria <span className="text-destructive">*</span>
            </Label>
            <Select
              value={categoria}
              onValueChange={setCategoria}
              disabled={!tipo || categoriasDisponiveis.length === 0}
            >
              <SelectTrigger id="categoria">
                <SelectValue
                  placeholder={
                    !tipo
                      ? "Selecione o tipo primeiro"
                      : categoriasDisponiveis.length === 0
                        ? "Nenhuma categoria disponível"
                        : "Selecione a categoria"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categoriasDisponiveis.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {erros.categoria && (
              <p className="text-sm text-destructive">{erros.categoria}</p>
            )}
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="valor">
              Valor (R$) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="text-right"
            />
            {erros.valor && <p className="text-sm text-destructive">{erros.valor}</p>}
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              max={getHoje()}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              placeholder="Adicione uma descrição..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
            />
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
