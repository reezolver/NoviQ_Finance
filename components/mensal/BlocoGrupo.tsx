"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatarMoeda, type GrupoCategoria } from "@/lib/calculations"
import { cn } from "@/lib/utils"

import { corTom, descreverDiferenca, semaforoLinha } from "./financeiro-ui"

/** Uma linha (categoria) dentro de um bloco. */
export interface LinhaBloco {
  /** Id da categoria. */
  id: string
  /** Nome exibido. */
  nome: string
  /** Planejado da categoria no mês. */
  planejado: number
  /** Realizado da categoria no mês. */
  realizado: number
  /** Diferença já assinada pela favorabilidade (positivo = bom). */
  diferenca: number
}

export interface BlocoGrupoProps {
  /** Título do bloco (ex.: "Renda", "Despesa Fixa"). */
  titulo: string
  /**
   * Grupo do bloco. Usado **só para escolher a palavra** da coluna Diferença
   * ("faltam" numa renda, "sobra" numa despesa) — a cor continua saindo da
   * comparação, não do grupo (Spec 28 · R2).
   */
  grupo: GrupoCategoria
  /**
   * Ícone do bloco, **já renderizado**.
   *
   * ⚠️ Precisa ser um elemento (`<Wallet />`), não o componente (`Wallet`).
   * Desde a Spec 35 este é um Client Component, e o React não consegue
   * serializar uma função de componente atravessando a fronteira
   * servidor→cliente — passar o componente cru quebra a página inteira.
   */
  icone: React.ReactNode
  /** Linhas de categoria já calculadas. */
  linhas: ReadonlyArray<LinhaBloco>
  /** Totais do bloco. */
  total: { planejado: number; realizado: number; diferenca: number }
}

/** Célula numérica padrão (mono, tabular, alinhada à direita). */
function CelulaValor({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <TableCell
      className={cn("text-right font-mono tabular-nums", className)}
    >
      {children}
    </TableCell>
  )
}

/**
 * Bloco de um grupo (Renda / Despesa Fixa / Despesa Variável) com a tabela
 * Planejado × Realizado × Diferença por categoria + total. Presentational —
 * todo cálculo chega pronto via props. Tokens do design system → dark + light.
 *
 * A Diferença chega **já assinada pela favorabilidade** (Spec 28): o bloco não
 * conhece o grupo, só pinta `+` de verde e `−` de vermelho.
 *
 * **Colapsável (Spec 35 · RF‑16):** com 4 blocos a tela do celular fica longa
 * demais toda aberta, então o padrão é **expandido no desktop e recolhido no
 * mobile** (PRD Q4). O **total continua visível no cabeçalho mesmo fechado** —
 * é exatamente isso que faz o recolhimento valer a pena: o cliente entra, lê os
 * totais e sai, sem precisar abrir tabela nenhuma.
 */
export function BlocoGrupo({
  titulo,
  grupo,
  icone,
  linhas,
  total,
}: BlocoGrupoProps) {
  const resumoTotal = descreverDiferenca(grupo, total.planejado, total.realizado)
  const isMobile = useIsMobile()
  // Estado **derivado**, sem efeito: enquanto o usuário não mexer, o padrão
  // acompanha o dispositivo (expandido no desktop, recolhido no mobile — PRD
  // Q4); no primeiro clique a escolha dele passa a mandar. Fazer isso com
  // `useEffect` + `setState` geraria render em cascata.
  const [escolhaDoUsuario, setEscolhaDoUsuario] = React.useState<boolean | null>(
    null
  )
  const aberto = escolhaDoUsuario ?? !isMobile
  const setAberto = setEscolhaDoUsuario

  return (
    <Collapsible asChild open={aberto} onOpenChange={setAberto}>
      <Card size="sm" className="gap-3">
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <CollapsibleTrigger
            className={cn(
              "-m-1 flex flex-1 items-center gap-2 rounded-md p-1 text-left",
              "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              // Alvo de toque ≥44px no mobile (R6).
              "min-h-11 md:min-h-0"
            )}
          >
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                aberto ? "" : "-rotate-90"
              )}
              aria-hidden
            />
            <CardTitle className="flex items-center gap-2 text-base">
              {icone}
              {titulo}
            </CardTitle>
          </CollapsibleTrigger>
          {/* Fora do trigger: continua legível com o bloco recolhido (R4). */}
          <span className={cn("text-sm font-semibold", corTom(resumoTotal.tom))}>
            {resumoTotal.texto}
          </span>
        </CardHeader>
        <CollapsibleContent asChild>
        <CardContent>
        {linhas.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Sem planejado nem lançamentos neste mês.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Planejado</TableHead>
                <TableHead className="text-right">Realizado</TableHead>
                <TableHead className="text-right">Diferença</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((linha) => (
                <TableRow key={linha.id}>
                  <TableCell className="font-medium">{linha.nome}</TableCell>
                  <CelulaValor className="text-muted-foreground">
                    {formatarMoeda(linha.planejado)}
                  </CelulaValor>
                  <CelulaValor>{formatarMoeda(linha.realizado)}</CelulaValor>
                  <CelulaValor
                    className={cn(
                      "font-medium",
                      corTom(semaforoLinha(grupo, linha.planejado, linha.realizado))
                    )}
                  >
                    {descreverDiferenca(grupo, linha.planejado, linha.realizado).texto}
                  </CelulaValor>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>Total</TableCell>
                <CelulaValor>{formatarMoeda(total.planejado)}</CelulaValor>
                <CelulaValor>{formatarMoeda(total.realizado)}</CelulaValor>
                <CelulaValor className={corTom(resumoTotal.tom)}>
                  {resumoTotal.texto}
                </CelulaValor>
              </TableRow>
            </TableFooter>
          </Table>
        )}
        </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
