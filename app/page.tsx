import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Target, TrendingUp, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-6xl flex-col items-center justify-center py-20 px-6 bg-white dark:bg-black">
        {/* Header */}
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl font-bold tracking-tight text-black dark:text-zinc-50">
            Noviq Finance
          </h1>
          <p className="max-w-2xl text-xl text-zinc-600 dark:text-zinc-400">
            Educação e controle financeiro pessoal. Transforme sua relação com o dinheiro.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/cadastro">
              Começar agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
            <Link href="/login">
              Entrar
            </Link>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Controle Total"
            description="Acompanhe rendas, despesas e investimentos em um só lugar"
          />
          <FeatureCard
            icon={<Target className="h-8 w-8" />}
            title="Objetivos Claros"
            description="Defina metas financeiras e acompanhe seu progresso em tempo real"
          />
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8" />}
            title="Projeção Futura"
            description="Visualize sua aposentadoria e planeje seu futuro com segurança"
          />
        </div>

        {/* Educator CTA */}
        <div className="mt-20 p-8 bg-primary/5 rounded-lg border border-primary/20 max-w-2xl text-center">
          <Shield className="h-8 w-8 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-semibold mb-2">É educador financeiro?</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Gerencie as finanças dos seus clientes em um só lugar, de forma simples e eficiente.
          </p>
          <Button asChild variant="default">
            <Link href="/cadastro">
              Criar conta de educador
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 p-6">
      <div className="text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-black dark:text-zinc-50">
        {title}
      </h3>
      <p className="text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </div>
  )
}
