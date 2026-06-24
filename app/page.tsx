import type { Metadata } from 'next'
import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { Posicionamento } from '@/components/landing/Posicionamento'
import { Metodo } from '@/components/landing/Metodo'
import { Funcionalidades } from '@/components/landing/Funcionalidades'
import { VitrineTelas } from '@/components/landing/VitrineTelas'
import { ParaQuem } from '@/components/landing/ParaQuem'
import { Precos } from '@/components/landing/Precos'
import { Faq } from '@/components/landing/Faq'
import { CtaFinal } from '@/components/landing/CtaFinal'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Noviq Finance — A clareza da planilha, a praticidade de um app',
  description:
    'Organize sua vida financeira com o método planejado × realizado × diferença e a divisão 50-30-20. Simples, prático e gratuito durante o beta.',
  openGraph: {
    title: 'Noviq Finance — A clareza da planilha, a praticidade de um app',
    description:
      'Organize sua vida financeira com o método planejado × realizado × diferença e a divisão 50-30-20. Simples, prático e gratuito durante o beta.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noviq Finance — A clareza da planilha, a praticidade de um app',
    description:
      'Organize sua vida financeira com o método planejado × realizado × diferença e a divisão 50-30-20. Simples, prático e gratuito durante o beta.',
  },
}

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Posicionamento />
        <Metodo />
        <Funcionalidades />
        <VitrineTelas />
        <ParaQuem />
        <Precos />
        <Faq />
        <CtaFinal />
      </main>
      <Footer />
    </>
  )
}
