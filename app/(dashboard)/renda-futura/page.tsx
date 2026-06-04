/**
 * Renda Futura
 *
 * Tela do simulador de aposentadoria.
 * Calcula projeção de juros compostos com aportes mensais e exibe renda passiva futura.
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatarMoeda, type ProjetoJurosCompostos } from "@/lib/calculations"

// ─── Estado e Tipos ───────────────────────────────────────────────────────────────

interface SimuladorInputs {
  idadeAtual: number
  aporteMensal: number
  taxaAnual: number
  idadeAlvo: number
}

const VALORES_INICIAIS: SimuladorInputs = {
  idadeAtual: 24,
  aporteMensal: 600,
  taxaAnual: 10,
  idadeAlvo: 65,
}

// ─── Componentes ───────────────────────────────────────────────────────────────────

function ResultadoCard({
  titulo,
  valor,
  descricao,
}: {
  titulo: string
  valor: string
  descricao?: string
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{titulo}</p>
      <p className="text-2xl font-bold">{valor}</p>
      {descricao && <p className="text-xs text-muted-foreground">{descricao}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RendaFuturaPage() {
  const [inputs, setInputs] = useState<SimuladorInputs>(VALORES_INICIAIS)
  const [projeto, setProjeto] = useState<ProjetoJurosCompostos | null>(null)
  const [calculoKey, setCalculoKey] = useState(0)

  // Calcular automaticamente ao carregar a página
  useEffect(() => {
    handleSimular()
  }, [])

  function handleSimular() {
    const anos = inputs.idadeAlvo - inputs.idadeAtual

    if (anos <= 0) {
      setProjeto(null)
      return
    }

    // Importar função dinamicamente para evitar problemas de SSR
    import("@/lib/calculations").then(({ calcularJurosCompostos }) => {
      const resultado = calcularJurosCompostos(
        0, // sem capital inicial por padrão
        inputs.aporteMensal,
        inputs.taxaAnual,
        anos,
        inputs.idadeAtual
      )
      setProjeto(resultado)
      setCalculoKey(calculoKey + 1)
    })
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Renda Futura</h1>
        <p className="text-muted-foreground">Simulador de aposentadoria</p>
      </div>

      {/* Cards lado a lado: Inputs | Resultado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card de Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Idade Atual */}
            <div className="space-y-2">
              <Label>Idade atual</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={inputs.idadeAtual}
                onChange={(e) =>
                  setInputs({ ...inputs, idadeAtual: Number(e.target.value) })
                }
              />
            </div>

            {/* Aporte Mensal */}
            <div className="space-y-2">
              <Label>Aporte mensal (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={inputs.aporteMensal}
                onChange={(e) =>
                  setInputs({ ...inputs, aporteMensal: Number(e.target.value) })
                }
              />
            </div>

            {/* Taxa Anual */}
            <div className="space-y-2">
              <Label>Taxa anual (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={inputs.taxaAnual}
                onChange={(e) =>
                  setInputs({ ...inputs, taxaAnual: Number(e.target.value) })
                }
              />
            </div>

            {/* Idade Alvo */}
            <div className="space-y-2">
              <Label>Idade alvo</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={inputs.idadeAlvo}
                onChange={(e) =>
                  setInputs({ ...inputs, idadeAlvo: Number(e.target.value) })
                }
              />
            </div>

            {/* Botão Simular */}
            <Button onClick={handleSimular} className="w-full">
              Simular
            </Button>
          </CardContent>
        </Card>

        {/* Card de Resultado */}
        <Card>
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {projeto ? (
              <>
                {/* Patrimônio Acumulado */}
                <ResultadoCard
                  titulo="Patrimônio acumulado"
                  valor={formatarMoeda(projeto.patrimonioFinal)}
                  descricao={`aos ${inputs.idadeAlvo} anos`}
                />

                {/* Renda Passiva Mensal */}
                <ResultadoCard
                  titulo="Renda passiva mensal"
                  valor={formatarMoeda(projeto.rendaPassivaMensal)}
                  descricao="renda mensal estimada"
                />

                {/* Total Aportado */}
                <ResultadoCard
                  titulo="Total aportado"
                  valor={formatarMoeda(projeto.totalAportado)}
                />

                {/* Rendimento Total */}
                <ResultadoCard
                  titulo="Rendimento total"
                  valor={formatarMoeda(projeto.rendimentoTotal)}
                  descricao="juros compostos"
                />
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                Preencha os parâmetros e clique em "Simular" para ver o resultado.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Projeção Ano a Ano */}
      {projeto && (
        <Card>
          <CardHeader>
            <CardTitle>Projeção ano a ano</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Idade</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Patrimônio Acumulado</TableHead>
                  <TableHead>Aporte no Ano</TableHead>
                  <TableHead>Rendimento no Ano</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projeto.projecaoAnual.map((linha) => (
                  <TableRow key={`${linha.ano}-${linha.idade}`}>
                    <TableCell className="font-medium">{linha.idade}</TableCell>
                    <TableCell>{linha.ano}</TableCell>
                    <TableCell>{formatarMoeda(linha.patrimonioAcumulado)}</TableCell>
                    <TableCell>{formatarMoeda(linha.aporteNoAno)}</TableCell>
                    <TableCell className="text-success">
                      +{formatarMoeda(linha.rendimentoNoAno)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
