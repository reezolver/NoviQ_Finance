import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * Botão **"Exportar PDF"** (Spec 11) — baixa o extrato do mês para o educador
 * enviar ao cliente. Aponta para o Route Handler `GET /api/export/[subcontaId]`,
 * que valida o acesso no servidor (RLS) e devolve o PDF como download.
 *
 * É só um link estilizado — a geração e a checagem de acesso ficam 100% no
 * servidor; nada de dados sensíveis trafega pelo cliente.
 */
export function ExportarPdfButton({
  subcontaId,
  ano,
  mes,
}: {
  subcontaId: string
  ano: number
  mes: number
}) {
  const href = `/api/export/${subcontaId}?tipo=extrato&ano=${ano}&mes=${mes}`
  return (
    <Button asChild variant="outline" size="sm">
      <a href={href} download>
        <Download className="size-4" />
        Exportar PDF
      </a>
    </Button>
  )
}
