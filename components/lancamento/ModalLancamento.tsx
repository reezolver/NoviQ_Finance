'use client'

import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface Lancamento {
  id: string
  tipo: string
  categoria: string
  valor: number
  data: string
  descricao?: string
}

const CATEGORIAS: Record<string, string[]> = {
  receita: ["Salário", "Investimentos", "Outras"],
  fixa: ["Aluguel", "Internet", "Gás", "Seguro", "Investimento (aporte)"],
  variavel: ["Lazer", "Transporte", "Alimentação", "Uber", "Outros"],
  objetivo: [],
}

interface ModalLancamentoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (lancamento: Lancamento) => void
}

export function ModalLancamento({
  open,
  onOpenChange,
  onSave,
}: ModalLancamentoProps) {
  const hoje = new Date().toISOString().split("T")[0]
  const [tipo, setTipo] = useState("")
  const [categoria, setCategoria] = useState("")
  const [valor, setValor] = useState("")
  const [data, setData] = useState(hoje)
  const [descricao, setDescricao] = useState("")
  const [loading, setLoading] = useState(false)

  function handleTipoChange(value: string) {
    setTipo(value)
    setCategoria("")
  }

  function handleClose() {
    setTipo("")
    setCategoria("")
    setValor("")
    setData(hoje)
    setDescricao("")
    onOpenChange(false)
  }

  async function handleSalvar() {
    if (!tipo || !categoria || !valor) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 500))
    onSave({
      id: Date.now().toString(),
      tipo,
      categoria,
      valor: parseFloat(valor),
      data,
      descricao,
    })
    toast.success("Lançamento registrado!")
    handleClose()
    setLoading(false)
  }

  const categorias = CATEGORIAS[tipo] || []

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Lançamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={handleTipoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="fixa">Despesa Fixa</SelectItem>
                <SelectItem value="variavel">Despesa Variável</SelectItem>
                <SelectItem value="objetivo">Objetivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria} disabled={!tipo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label>Data</Label>
            <Input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição (opcional)</Label>
            <Input
              placeholder="Ex: Mercado do mês"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            disabled={!tipo || !categoria || !valor || loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
