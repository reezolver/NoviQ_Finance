/**
 * Controle Mensal
 *
 * Página de detalhe do mês com 3 blocos (Renda, Fixas, Variáveis),
 * Saldo Final e Resumo 50-30-20.
 */

"use client"

import { useSearchParams } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MonthHeader } from "@/components/controle-mensal/MonthHeader"
import { BlocoFinanceiro, type BlocoData } from "@/components/controle-mensal/BlocoFinanceiro"
import { SaldoFinal, type ResumoData } from "@/components/controle-mensal/SaldoFinal"
import { Resumo503020 } from "@/components/controle-mensal/Resumo503020"

// ─── Dados Mockados ─────────────────────────────────────────────────────────────

// Dados mockados realistas para Janeiro 2026
const DADOS_JANEIRO_2026 = {
  renda: {
    titulo: "Renda",
    itens: [
      { nome: "Salário", planejado: 7500, realizado: 7500 },
      { nome: "Investimentos (rendimento)", planejado: 0, realizado: 50 },
      { nome: "Outras fontes", planejado: 0, realizado: 0 },
    ],
  },
  fixas: {
    titulo: "Despesas Fixas",
    itens: [
      { nome: "Aluguel", planejado: 1800, realizado: 1800 },
      { nome: "Internet", planejado: 120, realizado: 120 },
      { nome: "Gás", planejado: 80, realizado: 75 },
      { nome: "Seguro", planejado: 200, realizado: 200 },
      { nome: "Investimento (aporte)", planejado: 500, realizado: 500 },
    ],
  },
  variaveis: {
    titulo: "Despesas Variáveis",
    itens: [
      { nome: "Lazer", planejado: 400, realizado: 450 },
      { nome: "Transporte", planejado: 300, realizado: 280 },
      { nome: "Alimentação", planejado: 800, realizado: 850 },
      { nome: "Uber", planejado: 300, realizado: 320 },
    ],
  },
}

// Dados para os outros meses (simplificado)
const gerarDadosMes = (mes: number): {
  renda: BlocoData
  fixas: BlocoData
  variaveis: BlocoData
} => {
  // Variação aleatória pequena para cada mês
  const variacao = () => Math.random() * 200 - 100

  return {
    renda: {
      titulo: "Renda",
      itens: [
        { nome: "Salário", planejado: 7500, realizado: 7500 + variacao() },
        { nome: "Investimentos (rendimento)", planejado: 0, realizado: Math.max(0, variacao()) },
        { nome: "Outras fontes", planejado: 0, realizado: Math.max(0, variacao()) },
      ],
    },
    fixas: {
      titulo: "Despesas Fixas",
      itens: [
        { nome: "Aluguel", planejado: 1800, realizado: 1800 },
        { nome: "Internet", planejado: 120, realizado: 120 + Math.floor(variacao() / 10) },
        { nome: "Gás", planejado: 80, realizado: 80 + Math.floor(variacao() / 10) },
        { nome: "Seguro", planejado: 200, realizado: 200 },
        { nome: "Investimento (aporte)", planejado: 500, realizado: 500 },
      ],
    },
    variaveis: {
      titulo: "Despesas Variáveis",
      itens: [
        { nome: "Lazer", planejado: 400, realizado: 400 + variacao() },
        { nome: "Transporte", planejado: 300, realizado: 300 + variacao() },
        { nome: "Alimentação", planejado: 800, realizado: 800 + variacao() },
        { nome: "Uber", planejado: 300, realizado: 300 + variacao() },
      ],
    },
  }
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function ControleMensalPage() {
  const searchParams = useSearchParams()
  const mes = parseInt(searchParams.get("mes") || "1")
  const ano = 2026

  // Obter dados do mês
  const dadosMes = mes === 1 ? DADOS_JANEIRO_2026 : gerarDadosMes(mes)

  // Calcular totais para SaldoFinal
  const calcularTotais = (bloco: BlocoData) => {
    return {
      renda: bloco.titulo === "Renda"
        ? bloco.itens.reduce((sum, item) => sum + item.planejado, 0)
        : 0,
      fixas: bloco.titulo === "Despesas Fixas"
        ? bloco.itens.reduce((sum, item) => sum + item.planejado, 0)
        : 0,
      variaveis: bloco.titulo === "Despesas Variáveis"
        ? bloco.itens.reduce((sum, item) => sum + item.planejado, 0)
        : 0,
      investimento: bloco.titulo === "Despesas Fixas"
        ? bloco.itens.find((i) => i.nome === "Investimento (aporte)")?.planejado || 0
        : 0,
    }
  }

  const totaisPlanejado = {
    renda: dadosMes.renda.itens.reduce((sum, item) => sum + item.planejado, 0),
    fixas: dadosMes.fixas.itens.reduce((sum, item) => sum + item.planejado, 0),
    variaveis: dadosMes.variaveis.itens.reduce((sum, item) => sum + item.planejado, 0),
    investimento: dadosMes.fixas.itens.find((i) => i.nome === "Investimento (aporte)")?.planejado || 0,
  }

  const totaisRealizado = {
    renda: dadosMes.renda.itens.reduce((sum, item) => sum + item.realizado, 0),
    fixas: dadosMes.fixas.itens.reduce((sum, item) => sum + item.realizado, 0),
    variaveis: dadosMes.variaveis.itens.reduce((sum, item) => sum + item.realizado, 0),
    investimento: dadosMes.fixas.itens.find((i) => i.nome === "Investimento (aporte)")?.realizado || 0,
  }

  const saldosData: ResumoData = {
    planejado: totaisPlanejado,
    realizado: totaisRealizado,
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <MonthHeader ano={ano} />

      {/* 3 Blocos lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BlocoFinanceiro data={dadosMes.renda} />
        <BlocoFinanceiro data={dadosMes.fixas} />
        <BlocoFinanceiro data={dadosMes.variaveis} />
      </div>

      {/* Saldo Final */}
      <SaldoFinal data={saldosData} />

      {/* Resumo 50-30-20 */}
      <Resumo503020 data={saldosData} />

      {/* Botão flutuante */}
      <Button
        size="lg"
        className="fixed bottom-8 right-8 rounded-full w-14 h-14 shadow-lg z-50"
        aria-label="Adicionar lançamento"
      >
        <Plus className="size-6" />
      </Button>
    </div>
  )
}
