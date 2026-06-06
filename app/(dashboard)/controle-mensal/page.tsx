/**
 * Controle Mensal
 *
 * Página de detalhe do mês com 3 blocos (Renda, Fixas, Variáveis),
 * Saldo Final e Resumo 50-30-20.
 *
 * Dados carregados do Supabase.
 */

"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MonthHeader } from "@/components/controle-mensal/MonthHeader"
import { BlocoFinanceiro, type BlocoData, type ItemBloco } from "@/components/controle-mensal/BlocoFinanceiro"
import { SaldoFinal } from "@/components/controle-mensal/SaldoFinal"
import { Resumo503020 } from "@/components/controle-mensal/Resumo503020"
import { type ResumoData } from "@/types/financeiro"
import { ModalLancamento, type Lancamento } from "@/components/lancamento/ModalLancamento"
import { createClient } from "@/lib/supabase"
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LancamentoDB {
  id: string
  cliente_id: string
  tipo: string
  categoria: string
  valor: number
  data: string
  descricao?: string
  mes: number
  ano: number
}

// ─── Componentes ─────────────────────────────────────────────────────────────────

function ControleMensalContent() {
  const searchParams = useSearchParams()
  const mesParam = searchParams.get("mes") || "1"
  const mes = parseInt(mesParam)
  const ano = 2026

  // Estados
  const [modalAberto, setModalAberto] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lancamentos, setLancamentos] = useState<LancamentoDB[]>([])

  // Buscar lançamentos do mês/ano atual
  useEffect(() => {
    async function fetchLancamentos() {
      setLoading(true)
      setError(null)

      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setError("Usuário não autenticado.")
          setLoading(false)
          return
        }

        const { data: lancamentosData, error: fetchError } = await supabase
          .from('lancamentos')
          .select('*')
          .eq('cliente_id', user.id)
          .eq('mes', mes)
          .eq('ano', ano)
          .order('data', { ascending: true })

        if (fetchError) {
          throw fetchError
        }

        setLancamentos(lancamentosData || [])
      } catch (err) {
        console.error('Erro ao buscar lançamentos:', err)
        setError("Erro ao carregar lançamentos. Tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchLancamentos()
  }, [mes, ano])

  // Callback para salvar lançamento
  async function handleSalvarLancamento(lancamento: Lancamento) {
    // Recarregar lançamentos após salvar
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError("Usuário não autenticado.")
        return
      }

      const { data: lancamentosData, error: fetchError } = await supabase
        .from('lancamentos')
        .select('*')
        .eq('cliente_id', user.id)
        .eq('mes', mes)
        .eq('ano', ano)
        .order('data', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      setLancamentos(lancamentosData || [])
    } catch (err) {
      console.error('Erro ao recarregar lançamentos:', err)
      setError("Erro ao recarregar lançamentos. Tente novamente.")
    }
  }

  // Agrupar lançamentos por tipo e categoria
  function agruparLancamentos(tipoLancamento: string): BlocoData {
    const itensMap = new Map<string, ItemBloco>()

    lancamentos
      .filter(l => l.tipo === tipoLancamento)
      .forEach(lancamento => {
        const existing = itensMap.get(lancamento.categoria)

        if (existing) {
          // Somar ao valor existente (realizado)
          existing.realizado += lancamento.valor
        } else {
          // Criar novo item
          itensMap.set(lancamento.categoria, {
            nome: lancamento.categoria,
            planejado: 0, // Por enquanto, planejado = 0
            realizado: lancamento.valor,
          })
        }
      })

    const itens = Array.from(itensMap.values())

    return {
      titulo: tipoLancamento === 'receita'
        ? 'Renda'
        : tipoLancamento === 'fixa'
          ? 'Despesas Fixas'
          : 'Despesas Variáveis',
      itens,
    }
  }

  // Calcular totais para SaldoFinal
  const renda = agruparLancamentos('receita')
  const fixas = agruparLancamentos('fixa')
  const variaveis = agruparLancamentos('variavel')

  const totaisPlanejado = {
    renda: renda.itens.reduce((sum, item) => sum + item.planejado, 0),
    fixas: fixas.itens.reduce((sum, item) => sum + item.planejado, 0),
    variaveis: variaveis.itens.reduce((sum, item) => sum + item.planejado, 0),
    investimento: fixas.itens.find((i) => i.nome === "Investimento (aporte)")?.planejado || 0,
  }

  const totaisRealizado = {
    renda: renda.itens.reduce((sum, item) => sum + item.realizado, 0),
    fixas: fixas.itens.reduce((sum, item) => sum + item.realizado, 0),
    variaveis: variaveis.itens.reduce((sum, item) => sum + item.realizado, 0),
    investimento: fixas.itens.find((i) => i.nome === "Investimento (aporte)")?.realizado || 0,
  }

  const saldosData: ResumoData = {
    planejado: totaisPlanejado,
    realizado: totaisRealizado,
  }

  // Estado vazio
  const hasLancamentos = lancamentos.length > 0

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4" />
          <p className="text-muted-foreground">Carregando lançamentos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!hasLancamentos) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[50vh]">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhum lançamento registrado neste mês.
            Clique em + para adicionar seu primeiro lançamento.
          </AlertDescription>
        </Alert>

        <Button
          size="lg"
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 rounded-full w-14 h-14 shadow-lg z-50"
          aria-label="Adicionar lançamento"
          onClick={() => setModalAberto(true)}
        >
          <Plus className="size-6" />
        </Button>

        <ModalLancamento
          open={modalAberto}
          onOpenChange={setModalAberto}
          onSave={handleSalvarLancamento}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <MonthHeader ano={ano} />

      {/* 3 Blocos lado a lado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BlocoFinanceiro data={renda} />
        <BlocoFinanceiro data={fixas} />
        <BlocoFinanceiro data={variaveis} />
      </div>

      {/* Saldo Final */}
      <SaldoFinal data={saldosData} />

      {/* Resumo 50-30-20 */}
      <Resumo503020 data={saldosData} />

      {/* Botão flutuante */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 rounded-full w-14 h-14 shadow-lg z-50"
        aria-label="Adicionar lançamento"
        onClick={() => setModalAberto(true)}
      >
        <Plus className="size-6" />
      </Button>

      {/* Modal de Lançamento */}
      <ModalLancamento
        open={modalAberto}
        onOpenChange={setModalAberto}
        onSave={handleSalvarLancamento}
      />
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function ControleMensalPage() {
  return (
    <Suspense fallback={<div className="p-8">Carregando...</div>}>
      <ControleMensalContent />
    </Suspense>
  )
}
