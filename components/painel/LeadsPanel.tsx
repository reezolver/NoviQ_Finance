import { UserPlus } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface LeadResumo {
  id: string
  nome: string | null
  email: string | null
  created_at: string
}

/**
 * Leads visíveis ao master (Spec 17 · RF-10): educadores que entraram em modo
 * pessoal (`tipo_perfil='educador'` + `preferencia_inicial='pessoal'`). Só
 * exibido ao master — a query e o gate vivem no `painel/page.tsx`.
 *
 * Privacidade (§11.6): o master vê **só o perfil** (nome/e-mail/data) — nunca a
 * conta pessoal/finanças do lead. Por isso, sem link para o workspace.
 */
export function LeadsPanel({ leads }: { leads: LeadResumo[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Leads ({leads.length})</CardTitle>
        <CardDescription>
          Educadores que entraram para cuidar só das próprias finanças.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="size-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Nenhum lead ainda.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead className="text-right">Cadastrado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    {lead.nome?.trim() || "Sem nome"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.email || "—"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatarData(lead.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
