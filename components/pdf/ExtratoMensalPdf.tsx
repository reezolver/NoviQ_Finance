import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

import { formatarMoeda } from "@/lib/calculations"
import type { ExtratoMensal } from "@/lib/extrato"
import { PDF_COLORS, corValor, sinal } from "./theme"

/**
 * Template do **extrato mensal em PDF** (Spec 11) — o educador baixa e envia ao
 * cliente no WhatsApp. Renderizado no servidor pelo Route Handler de export
 * (`@react-pdf/renderer`, sem browser headless).
 *
 * Recebe o extrato já montado por `montarExtratoMensal` — os mesmos números da
 * tela mensal (Spec 04). Sem cálculo aqui: só layout.
 */

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: PDF_COLORS.text,
    lineHeight: 1.4,
  },
  // Cabeçalho
  header: {
    borderBottomWidth: 2,
    borderBottomColor: PDF_COLORS.primary,
    paddingBottom: 12,
    marginBottom: 18,
  },
  brand: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: PDF_COLORS.primary,
  },
  title: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 8 },
  subtitle: { fontSize: 10, color: PDF_COLORS.muted, marginTop: 2 },
  // Cards de saldo
  saldoRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  saldoCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
    borderRadius: 6,
    padding: 10,
  },
  saldoLabel: { fontSize: 8, color: PDF_COLORS.muted, textTransform: "uppercase" },
  saldoValue: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 4 },
  // Seções / blocos
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    color: PDF_COLORS.text,
  },
  // Tabela
  table: { borderWidth: 1, borderColor: PDF_COLORS.border, borderRadius: 6 },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
  },
  trLast: { flexDirection: "row" },
  th: {
    backgroundColor: PDF_COLORS.surface,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
    color: PDF_COLORS.muted,
  },
  trTotal: { flexDirection: "row", backgroundColor: PDF_COLORS.surface },
  cell: { paddingVertical: 5, paddingHorizontal: 8 },
  cellNome: { flex: 2 },
  cellNum: { flex: 1, textAlign: "right" },
  num: { fontFamily: "Helvetica" },
  bold: { fontFamily: "Helvetica-Bold" },
  // Rodapé
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.border,
    paddingTop: 6,
    fontSize: 8,
    color: PDF_COLORS.muted,
    flexDirection: "row",
    justifyContent: "space-between",
  },
})

export interface ExtratoMensalPdfProps {
  subcontaNome: string
  mesNome: string
  ano: number
  extrato: ExtratoMensal
  /**
   * Saldo em conta acumulado ao fim do mês (Spec 25). Único número que depende
   * do histórico, não só do mês — por isso vem de fora de `montarExtratoMensal`.
   */
  saldoEmConta: number
  geradoEm: string
}

/** Linha numérica com sinal/cor (para diferença). */
function Diferenca({ valor }: { valor: number }) {
  return (
    <Text style={[styles.num, { color: corValor(valor) }]}>
      {sinal(valor)}
      {formatarMoeda(valor)}
    </Text>
  )
}

function SaldoCard({
  rotulo,
  valor,
  colorir = false,
}: {
  rotulo: string
  valor: number
  colorir?: boolean
}) {
  return (
    <View style={styles.saldoCard}>
      <Text style={styles.saldoLabel}>{rotulo}</Text>
      <Text style={[styles.saldoValue, colorir ? { color: corValor(valor) } : {}]}>
        {colorir ? sinal(valor) : ""}
        {formatarMoeda(valor)}
      </Text>
    </View>
  )
}

export function ExtratoMensalPdf({
  subcontaNome,
  mesNome,
  ano,
  extrato,
  saldoEmConta,
  geradoEm,
}: ExtratoMensalPdfProps) {
  return (
    <Document title={`Extrato ${mesNome} ${ano} — ${subcontaNome}`} author="Noviq Finance">
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.brand}>Noviq Finance</Text>
          <Text style={styles.title}>Extrato Mensal — {subcontaNome}</Text>
          <Text style={styles.subtitle}>
            {mesNome} de {ano} · Planejado, Realizado e Diferença
          </Text>
        </View>

        {/* Saldo do mês */}
        <View style={styles.saldoRow}>
          <SaldoCard rotulo="Saldo Planejado" valor={extrato.saldoPlanejado} />
          <SaldoCard rotulo="Saldo em conta" valor={saldoEmConta} />
          <SaldoCard rotulo="Diferença" valor={extrato.saldoDiferenca} colorir />
        </View>

        {/* 3 blocos */}
        {extrato.blocos.map((bloco) => (
          <View key={bloco.grupo} style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{bloco.titulo}</Text>
            <View style={styles.table}>
              {/* Cabeçalho da tabela */}
              <View style={[styles.tr, styles.th]}>
                <Text style={[styles.cell, styles.cellNome]}>Categoria</Text>
                <Text style={[styles.cell, styles.cellNum]}>Planejado</Text>
                <Text style={[styles.cell, styles.cellNum]}>Realizado</Text>
                <Text style={[styles.cell, styles.cellNum]}>Diferença</Text>
              </View>
              {/* Linhas */}
              {bloco.linhas.length === 0 ? (
                <View style={styles.trLast}>
                  <Text style={[styles.cell, { color: PDF_COLORS.muted }]}>
                    Sem lançamentos neste grupo.
                  </Text>
                </View>
              ) : (
                bloco.linhas.map((linha) => (
                  <View key={linha.id} style={styles.tr}>
                    <Text style={[styles.cell, styles.cellNome]}>{linha.nome}</Text>
                    <Text style={[styles.cell, styles.cellNum, styles.num]}>
                      {formatarMoeda(linha.planejado)}
                    </Text>
                    <Text style={[styles.cell, styles.cellNum, styles.num]}>
                      {formatarMoeda(linha.realizado)}
                    </Text>
                    <View style={[styles.cell, styles.cellNum]}>
                      <Diferenca valor={linha.diferenca} />
                    </View>
                  </View>
                ))
              )}
              {/* Total do bloco */}
              <View style={styles.trTotal}>
                <Text style={[styles.cell, styles.cellNome, styles.bold]}>Total</Text>
                <Text style={[styles.cell, styles.cellNum, styles.bold]}>
                  {formatarMoeda(bloco.total.planejado)}
                </Text>
                <Text style={[styles.cell, styles.cellNum, styles.bold]}>
                  {formatarMoeda(bloco.total.realizado)}
                </Text>
                <View style={[styles.cell, styles.cellNum]}>
                  <Diferenca valor={bloco.total.diferenca} />
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* Resumo 50‑30‑20 */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Distribuição 50‑30‑20</Text>
          <View style={styles.table}>
            <View style={[styles.tr, styles.th]}>
              <Text style={[styles.cell, styles.cellNome]}>Grupo</Text>
              <Text style={[styles.cell, styles.cellNum]}>Meta</Text>
              <Text style={[styles.cell, styles.cellNum]}>Ideal</Text>
              <Text style={[styles.cell, styles.cellNum]}>Realizado</Text>
              <Text style={[styles.cell, styles.cellNum]}>% da renda</Text>
            </View>
            {extrato.faixas.map((faixa) => (
              <View key={faixa.grupo} style={styles.tr}>
                <Text style={[styles.cell, styles.cellNome]}>{faixa.rotulo}</Text>
                <Text style={[styles.cell, styles.cellNum, styles.num]}>
                  {faixa.metaPct.toFixed(0)}%
                </Text>
                <Text style={[styles.cell, styles.cellNum, styles.num]}>
                  {formatarMoeda(faixa.ideal)}
                </Text>
                <Text style={[styles.cell, styles.cellNum, styles.num]}>
                  {formatarMoeda(faixa.realizado)}
                </Text>
                <Text style={[styles.cell, styles.cellNum, styles.num]}>
                  {faixa.percentualRenda.toFixed(0)}%
                </Text>
              </View>
            ))}
            <View style={styles.trTotal}>
              <Text style={[styles.cell, styles.cellNome, styles.bold]}>Renda base</Text>
              <Text style={[styles.cell, { flex: 3, textAlign: "right" }, styles.bold]}>
                {formatarMoeda(extrato.rendaBase)}
              </Text>
            </View>
          </View>
        </View>

        {/* Rodapé fixo */}
        <View style={styles.footer} fixed>
          <Text>Gerado por Noviq Finance em {geradoEm}</Text>
          <Text
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}
