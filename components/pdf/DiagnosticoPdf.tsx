import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

import { formatarMoeda } from "@/lib/calculations"
import type { AnaliseAnamnese, LinhaDistribuicao } from "@/lib/anamnese"
import { PDF_COLORS, corValor, sinal } from "./theme"

/**
 * Template do **diagnóstico da anamnese em PDF** (Spec 11 §4, opcional). Mostra
 * o `analise` (jsonb) calculado no Spec 08: resumo, distribuição 50‑30‑20,
 * reserva de emergência, patrimônio e alertas. Sem cálculo aqui — só layout.
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
  header: {
    borderBottomWidth: 2,
    borderBottomColor: PDF_COLORS.primary,
    paddingBottom: 12,
    marginBottom: 18,
  },
  brand: { fontSize: 16, fontFamily: "Helvetica-Bold", color: PDF_COLORS.primary },
  title: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 8 },
  subtitle: { fontSize: 10, color: PDF_COLORS.muted, marginTop: 2 },
  cardRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  card: {
    width: "47%",
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
    borderRadius: 6,
    padding: 10,
  },
  cardLabel: { fontSize: 8, color: PDF_COLORS.muted, textTransform: "uppercase" },
  cardValue: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 4 },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  table: { borderWidth: 1, borderColor: PDF_COLORS.border, borderRadius: 6 },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: PDF_COLORS.border },
  trLast: { flexDirection: "row" },
  th: {
    backgroundColor: PDF_COLORS.surface,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
    color: PDF_COLORS.muted,
  },
  cell: { paddingVertical: 5, paddingHorizontal: 8 },
  cellNome: { flex: 2 },
  cellNum: { flex: 1, textAlign: "right" },
  num: { fontFamily: "Helvetica" },
  alerta: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
  },
  alertaSemAtencao: { color: PDF_COLORS.success, paddingVertical: 4, paddingHorizontal: 8 },
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

export interface DiagnosticoPdfProps {
  subcontaNome: string
  analise: AnaliseAnamnese
  geradoEm: string
}

function Card({
  rotulo,
  valor,
  colorir = false,
}: {
  rotulo: string
  valor: number
  colorir?: boolean
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{rotulo}</Text>
      <Text style={[styles.cardValue, colorir ? { color: corValor(valor) } : {}]}>
        {colorir ? sinal(valor) : ""}
        {formatarMoeda(valor)}
      </Text>
    </View>
  )
}

function LinhaDist({
  rotulo,
  linha,
}: {
  rotulo: string
  linha: LinhaDistribuicao
}) {
  return (
    <View style={styles.tr}>
      <Text style={[styles.cell, styles.cellNome]}>{rotulo}</Text>
      <Text style={[styles.cell, styles.cellNum, styles.num]}>
        {formatarMoeda(linha.real)}
      </Text>
      <Text style={[styles.cell, styles.cellNum, styles.num]}>
        {formatarMoeda(linha.ideal)}
      </Text>
      <Text style={[styles.cell, styles.cellNum, styles.num]}>
        {linha.percentual.toFixed(0)}%
      </Text>
    </View>
  )
}

export function DiagnosticoPdf({ subcontaNome, analise, geradoEm }: DiagnosticoPdfProps) {
  return (
    <Document title={`Diagnóstico financeiro — ${subcontaNome}`} author="Noviq Finance">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>Noviq Finance</Text>
          <Text style={styles.title}>Diagnóstico Financeiro — {subcontaNome}</Text>
          <Text style={styles.subtitle}>Panorama da anamnese · regra 50‑30‑20</Text>
        </View>

        {/* Resumo */}
        <View style={styles.cardRow}>
          <Card rotulo="Renda mensal" valor={analise.renda_total} />
          <Card rotulo="Despesa mensal" valor={analise.despesa_total} />
          <Card rotulo="Saldo do mês" valor={analise.saldo} colorir />
          <Card rotulo="Patrimônio líquido" valor={analise.patrimonio_liquido} colorir />
        </View>

        {/* Distribuição 50‑30‑20 */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Distribuição 50‑30‑20</Text>
          <View style={styles.table}>
            <View style={[styles.tr, styles.th]}>
              <Text style={[styles.cell, styles.cellNome]}>Grupo</Text>
              <Text style={[styles.cell, styles.cellNum]}>Real</Text>
              <Text style={[styles.cell, styles.cellNum]}>Ideal</Text>
              <Text style={[styles.cell, styles.cellNum]}>% da renda</Text>
            </View>
            <LinhaDist rotulo="Despesa Fixa (50%)" linha={analise.distribuicao.fixo} />
            <LinhaDist rotulo="Despesa Variável (30%)" linha={analise.distribuicao.variavel} />
            <LinhaDist
              rotulo="Investimento (20%)"
              linha={analise.distribuicao.investimento}
            />
          </View>
        </View>

        {/* Reserva + patrimônio */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Reserva de emergência e patrimônio</Text>
          <View style={styles.table}>
            <View style={styles.tr}>
              <Text style={[styles.cell, styles.cellNome]}>Reserva atual</Text>
              <Text style={[styles.cell, styles.cellNum, styles.num]}>
                {formatarMoeda(analise.reserva.atual)}
              </Text>
            </View>
            <View style={styles.tr}>
              <Text style={[styles.cell, styles.cellNome]}>Meta (6× despesas)</Text>
              <Text style={[styles.cell, styles.cellNum, styles.num]}>
                {formatarMoeda(analise.reserva.meta)} ({analise.reserva.percentual.toFixed(0)}%)
              </Text>
            </View>
            <View style={styles.tr}>
              <Text style={[styles.cell, styles.cellNome]}>Patrimônio total</Text>
              <Text style={[styles.cell, styles.cellNum, styles.num]}>
                {formatarMoeda(analise.patrimonio_total)}
              </Text>
            </View>
            <View style={styles.trLast}>
              <Text style={[styles.cell, styles.cellNome]}>Dívidas em aberto</Text>
              <Text style={[styles.cell, styles.cellNum, styles.num]}>
                {formatarMoeda(analise.dividas_total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Alertas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pontos de atenção</Text>
          <View style={styles.table}>
            {analise.alertas.length === 0 ? (
              <Text style={styles.alertaSemAtencao}>
                Nenhum ponto de atenção — finanças equilibradas.
              </Text>
            ) : (
              analise.alertas.map((alerta, i) => (
                <View
                  key={i}
                  style={
                    i === analise.alertas.length - 1
                      ? [styles.alerta, { borderBottomWidth: 0 }]
                      : styles.alerta
                  }
                >
                  <Text style={{ color: PDF_COLORS.destructive }}>•</Text>
                  <Text>{alerta}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Gerado por Noviq Finance em {geradoEm}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
