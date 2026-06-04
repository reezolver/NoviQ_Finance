/**
 * Controle Mensal
 *
 * Página de detalhe do mês com 3 blocos (Renda, Fixas, Variáveis),
 * Saldo Final e Resumo 50-30-20.
 */

"use client"

import { Suspense } from "react"
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

// Dados fixos para os outros meses (sem Math.random)
const DADOS_MESES: Record<number, { renda: BlocoData; fixas: BlocoData; variaveis: BlocoData }> = {
  2: {
    // Fevereiro
    renda: {
      titulo: "Renda",
      itens: [
        { nome: "Salário", planejado: 7500, realizado: 7500 },
        { nome: "Investimentos (rendimento)", planejado: 0, realizado: 42 },
        { nome: "Outras fontes", planejado: 0, realizado: 0 },
      ],
    },
    fixas: {
      titulo: "Despesas Fixas",
      itens: [
        { nome: "Aluguel", planejado: 1800, realizado: 1800 },
        { nome: "Internet", planejado: 120, realizado: 118 },
        { nome: "Gás", planejado: 80, realizado: 82 },
        { nome: "Seguro", planejado: 200, realizado: 200 },
        { nome: "Investimento (aporte)", planejado: 500, realizado: 500 },
      ],
    },
    variaveis: {
      titulo: "Despesas Variáveis",
      itens: [
        { nome: "Lazer", planejado: 400, realizado: 380 },
        { nome: "Transporte", planejado: 300, realizado: 320 },
        { nome: "Alimentação", planejado: 800, realizado: 750 },
        { nome: "Uber", planejado: 300, realizado: 280 },
      ],
    },
  },
  3: {
    // Março
    renda: {
      titulo: "Renda",
      itens: [
        { nome: "Salário", planejado: 7500, realizado: 8200 },
        { nome: "Investimentos (rendimento)", planejado: 0, realizado: 55 },
        { nome: "Outras fontes", planejado: 0, realizado: 200 },
      ],
    },
    fixas: {
      titulo: "Despesas Fixas",
      itens: [
        { nome: "Aluguel", planejado: 1800, realizado: 1800 },
        { nome: "Internet", planejado: 120, realizado: 120 },
        { nome: "Gás", planejado: 80, realizado: 78 },
        { nome: "Seguro", planejado: 200, realizado: 200 },
        { nome: "Investimento (aporte)", planejado: 500, realizado: 500 },
      ],
    },
    variaveis: {
      titulo: "Despesas Variáveis",
      itens: [
        { nome: "Lazer", planejado: 400, realizado: 520 },
        { nome: "Transporte", planejado: 300, realizado: 290 },
        { nome: "Alimentação", planejado: 800, realizado: 910 },
        { nome: "Uber", planejado: 300, realizado: 350 },
      ],
    },
  },
  4: {
    // Abril
    renda: {
      titulo: "Renda",
      itens: [
        { nome: "Salário", planejado: 7500, realizado: 7500 },
        { nome: "Investimentos (rendimento)", planejado: 0, realizado: 48 },
        { nome: "Outras fontes", planejado: 0, realizado: 0 },
      ],
    },
    fixas: {
      titulo: "Despesas Fixas",
      itens: [
        { nome: "Aluguel", planejado: 1800, realizado: 1800 },
        { nome: "Internet", planejado: 120, realizado: 125 },
        { nome: "Gás", planejado: 80, realizado: 80 },
        { nome: "Seguro", planejado: 200, realizado: 200 },
        { nome: "Investimento (aporte)", planejado: 500, realizado: 500 },
      ],
    },
    variaveis: {
      titulo: "Despesas Variáveis",
      itens: [
        { nome: "Lazer", planejado: 400, realizado: 350 },
        { nome: "Transporte", planejado: 300, realizado: 310 },
        { nome: "Alimentação", planejado: 800, realizado: 780 },
        { nome: "Uber", planejado: 300, realizado: 290 },
      ],
    },
  },
  5: {
    // Maio
    renda: {
      titulo: "Renda",
      itens: [
        { nome: "Salário", planejado: 7500, realizado: 7500 },
        { nome: "Investimentos (rendimento)", planejado: 0, realizado: 52 },
        { nome: "Outras fontes", planejado: 0, realizado: 0 },
      ],
    },
    fixas: {
      titulo: "Despesas Fixas",
      itens: [
        { nome: "Aluguel", planejado: 1800, realizado: 1800 },
        { nome: "Internet", planejado: 120, realizado: 120 },
        { nome: "Gás", planejado: 80, realizado: 85 },
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
  },
  6: {
    // Junho
    renda: {
      titulo: "Renda",
      itens: [
        { nome: "Salário", planejado: 7500, realizado: 7500 },
        { nome: "Investimentos (rendimento)", planejado: 0, realizado: 60 },
        { nome: "Outras fontes", planejado: 0, realizado: 0 },
      ],
    },
    fixas: {
      titulo: "Despesas Fixas",
      itens: [
        { nome: "Aluguel", planejado: 1800, realizado: 1800 },
        { nome: "Internet", planejado: 120, realizado: 122 },
        { nome: "Gás", planejado: 80, realizado: 79 },
        { nome: "Seguro", planejado: 200, realizado: 200 },
        { nome: "Investimento (aporte)", planejado: 500, realizado: 500 },
      ],
    },
    variaveis: {
      titulo: "Despesas Variáveis",
      itens: [
        { nome: "Lazer", planejado: 400, realizado: 420 },
        { nome: "Transporte", planejado: 300, realizado: 290 },
        { nome: "Alimentação", planejado: 800, realizado: 820 },
        { nome: "Uber", planejado: 300, realizado: 310 },
      ],
    },
  },
  7: {
    // Julho
    renda: {
      titulo: "Renda",
      itens: [
        { nome: "Salário", planejado: 7500, realizado: 7500 },
        { nome: "Investimentos (rendimento)", planejado: 0, realizado: 65 },
        { nome: "Outras fontes", planejado: 0, realizado: 0 },
      ],
    },
    fixas: {
      titulo: "Despesas Fixas",
      itens: [
        { nome: "Aluguel", planejado: 1800, realizado: 1800 },
        { nome: "Internet", planejado: 120, realizado: 120 },
        { nome: "Gás", planejado: 80, realizado: 83 },
        { nome: "Seguro", planejado: 200, realizado: 200 },
        { nome: "Investimento (aporte)", planejado: 500, realizado: 500 },
      ],
    },
    variaveis: {
      titulo: "Despesas Variáveis",
      itens: [
        { nome: "Lazer", planejado: 400, realizado: 480 },
        { nome: "Transporte", planejado: 300, realizado: 300 },
        { nome: "Alimentação", planejado: 800, realizado: 900 },
        { nome: "Uber", planejado: 300, realizado: 330 },
      ],
    },
  },
  8: {
    // Agosto
    renda: {
      titulo: "Renda",
      itens: [
        { nome: "Salário", planejado: 7500, realizado: 7500 },
        { nome: "Investimentos (rendimento)", planejado: 0, realizado: 70 },
        { nome: "Outras fontes", planejado: 0, realizado: 0 },
      ],
    },
    fixas: {
      titulo: "Despesas Fixas",
      itens: [
        { nome: "Aluguel", planejado: 1800, realizado: 1800 },
        { nome: "Internet", planejado: 120, realizado: 118 },
        { nome: "Gás", planejado: 80, realizado: 80 },
        { nome: "Seguro", planejado: 200, realizado: 200 },
        { nome: "Investimento (aporte)", planejado: 500, realizado: 500 },
      ],
    },
    variaveis: {
      titulo: "Despesas Variáveis",
      itens: [
        { nome: "Lazer", planejado: 400, realizado: 360 },
        { nome: "Transporte", planejado: 300, realizado: 310 },
        { nome: "Alimentação", planejado: 800, realizado: 790 },
        { nome: "Uber", planejado: 300, realizado: 290 },
      ],
    },
  },
  9: {
    // Setembro
    renda: {
      titulo: "Renda",
      itens: [
        { nome: "Salário", planejado: 7500, realizado: 7500 },
        { nome: "Investimentos (rendimento)", planejado: 0, realizado: 75 },
        { nome: "Outras fontes", planejado: 0, realizado: 0 },
      ],
    },
    fixas: {
      titulo: "Despesas Fixas",
      itens: [
        { nome: "Aluguel", planejado: 1800, realizado: 1800 },
        { nome: "Internet", planejado: 120, realizado: 120 },
        { nome: "Gás", planejado: 80, realizado: 82 },
        { nome: "Seguro", planejado: 200, realizado: 200 },
        { nome: "Investimento (aporte)", planejado: 500, realizado: 500 },
      ],
    },
    variaveis: {
      titulo: "Despesas Variáveis",
      itens: [
        { nome: "Lazer", planejado: 400, realizado: 440 },
        { nome: "Transporte", planejado: 300, realizado: 320 },
        { nome: "Alimentação", planejado: 800, realizado: 880 },
        { nome: "Uber", planejado: 300, realizado: 350 },
      ],
    },
  },
  10: {
    // Outubro
    renda: {
      titulo: "Renda",
      itens: [
        { nome: "Salário", planejado: 7500, realizado: 7500 },
        { nome: "Investimentos (rendimento)", planejado: 0, realizado: 80 },
        { nome: "Outras fontes", planejado: 0, realizado: 0 },
      ],
    },
    fixas: {
      titulo: "Despesas Fixas",
      itens: [
        { nome: "Aluguel", planejado: 1800, realizado: 1800 },
        { nome: "Internet", planejado: 120, realizado: 125 },
        { nome: "Gás", planejado: 80, realizado: 78 },
        { nome: "Seguro", planejado: 200, realizado: 200 },
        { nome: "Investimento (aporte)", planejado: 500, realizado: 500 },
      ],
    },
    variaveis: {
      titulo: "Despesas Variáveis",
      itens: [
        { nome: "Lazer", planejado: 400, realizado: 410 },
        { nome: "Transporte", planejado: 300, realizado: 290 },
        { nome: "Alimentação", planejado: 800, realizado: 840 },
        { nome: "Uber", planejado: 300, realizado: 320 },
      ],
    },
  },
  11: {
    // Novembro
    renda: {
      titulo: "Renda",
      itens: [
        { nome: "Salário", planejado: 7500, realizado: 7500 },
        { nome: "Investimentos (rendimento)", planejado: 0, realizado: 85 },
        { nome: "Outras fontes", planejado: 0, realizado: 0 },
      ],
    },
    fixas: {
      titulo: "Despesas Fixas",
      itens: [
        { nome: "Aluguel", planejado: 1800, realizado: 1800 },
        { nome: "Internet", planejado: 120, realizado: 120 },
        { nome: "Gás", planejado: 80, realizado: 85 },
        { nome: "Seguro", planejado: 200, realizado: 200 },
        { nome: "Investimento (aporte)", planejado: 500, realizado: 500 },
      ],
    },
    variaveis: {
      titulo: "Despesas Variáveis",
      itens: [
        { nome: "Lazer", planejado: 400, realizado: 520 },
        { nome: "Transporte", planejado: 300, realizado: 330 },
        { nome: "Alimentação", planejado: 800, realizado: 920 },
        { nome: "Uber", planejado: 300, realizado: 380 },
      ],
    },
  },
  12: {
    // Dezembro
    renda: {
      titulo: "Renda",
      itens: [
        { nome: "Salário", planejado: 7500, realizado: 8500 },
        { nome: "Investimentos (rendimento)", planejado: 0, realizado: 120 },
        { nome: "Outras fontes", planejado: 0, realizado: 500 },
      ],
    },
    fixas: {
      titulo: "Despesas Fixas",
      itens: [
        { nome: "Aluguel", planejado: 1800, realizado: 1800 },
        { nome: "Internet", planejado: 120, realizado: 120 },
        { nome: "Gás", planejado: 80, realizado: 90 },
        { nome: "Seguro", planejado: 200, realizado: 200 },
        { nome: "Investimento (aporte)", planejado: 500, realizado: 500 },
      ],
    },
    variaveis: {
      titulo: "Despesas Variáveis",
      itens: [
        { nome: "Lazer", planejado: 400, realizado: 800 },
        { nome: "Transporte", planejado: 300, realizado: 400 },
        { nome: "Alimentação", planejado: 800, realizado: 1200 },
        { nome: "Uber", planejado: 300, realizado: 450 },
      ],
    },
  },
}

// ─── Componentes ─────────────────────────────────────────────────────────────────

function ControleMensalContent() {
  const searchParams = useSearchParams()
  const mes = parseInt(searchParams.get("mes") || "1")
  const ano = 2026

  // Obter dados do mês
  const dadosMes = mes === 1 ? DADOS_JANEIRO_2026 : DADOS_MESES[mes] || DADOS_JANEIRO_2026

  // Calcular totais para SaldoFinal
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

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function ControleMensalPage() {
  return (
    <Suspense fallback={<div className="p-8">Carregando...</div>}>
      <ControleMensalContent />
    </Suspense>
  )
}
