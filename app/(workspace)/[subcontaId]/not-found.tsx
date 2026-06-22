import Link from "next/link"
import { ShieldAlert } from "lucide-react"

import { getUsuarioAtual } from "@/lib/auth"
import { Button } from "@/components/ui/button"

/**
 * 404 do workspace — disparado pelo `notFound()` do `layout.tsx` quando a
 * subconta **não existe ou a RLS negou** o acesso. Renderiza **fora** do layout
 * do workspace (o layout foi quem lançou), então não tem a subconta no contexto.
 *
 * Segurança (RNF-5): só **reflete** o que a RLS decidiu — nunca revalida acesso
 * no front. A copy "não encontrada **ou** sem acesso" é proposital: não revela
 * se a subconta existe. A ação varia por papel; fallback seguro = link para `/`.
 */
export default async function WorkspaceNotFound() {
  const usuario = await getUsuarioAtual()
  const isGestor =
    usuario?.tipo_perfil === "educador" || usuario?.tipo_perfil === "master"

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <ShieldAlert className="size-6 text-muted-foreground" aria-hidden />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">
          Conta não encontrada ou sem acesso
        </h1>
        <p className="text-sm text-muted-foreground">
          Esta carteira não existe ou você não tem permissão para acessá-la.
        </p>
      </div>
      <Button asChild>
        <Link href={isGestor ? "/painel" : "/"}>
          {isGestor ? "Voltar ao painel" : "Ir para minha conta"}
        </Link>
      </Button>
    </div>
  )
}
