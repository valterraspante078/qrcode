import { PublicGenerator } from "@/components/PublicGenerator";
import { Sparkles, Shield, Zap, TrendingUp, ChevronRight, ChevronDown, HelpCircle, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PricingSection } from "@/components/PricingSection";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.geradordeqrcode.com.br";

// JSON-LD Structured Data
const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Gerador de Qr Code",
  description: "Gerador de QR Codes dinâmicos, personalizados e rastreáveis. Ideal para restaurantes, eventos e pequenos negócios.",
  url: siteUrl,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
      name: "Gratuito (14 dias)",
      description: "Teste grátis por 14 dias com todas as funcionalidades.",
    },
    {
      "@type": "Offer",
      price: "50.00",
      priceCurrency: "BRL",
      name: "Plano Anual",
      description: "QR Codes ilimitados, domínio customizado e suporte 24/7.",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "50.00",
        priceCurrency: "BRL",
        unitText: "MONTH",
        billingDuration: "P1Y",
      },
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1240",
    bestRating: "5",
    worstRating: "1",
  },
  featureList: [
    "QR Codes Dinâmicos",
    "Personalização Completa",
    "Rastreamento de Scans",
    "Analytics Avançado",
    "Download SVG e PNG",
    "Links Permanentes",
    "Suporte a Pix",
    "QR Code para WhatsApp",
  ],
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Gerador de Qr Code",
  url: siteUrl,
  logo: `${siteUrl}/icon.png`,
  description: "Plataforma profissional de criação e gerenciamento de QR Codes para negócios.",
  sameAs: [],
};

const faqItems = [
  {
    question: "O que é um QR Code dinâmico?",
    answer: "Um QR Code dinâmico permite alterar o destino do link sem precisar reimprimir o código. Diferente do QR Code estático, você pode mudar a URL de destino a qualquer momento pelo painel, ideal para cardápios, promoções e campanhas que mudam com frequência.",
  },
  {
    question: "Como criar um QR Code grátis?",
    answer: "Com o Gerador de Qr Code, basta inserir o link ou texto desejado na ferramenta da página inicial e clicar em 'Gerar'. Você pode baixar em SVG ou PNG instantaneamente. Oferecemos 14 dias grátis com todas as funcionalidades premium.",
  },
  {
    question: "QR Code para restaurante funciona?",
    answer: "Sim! QR Codes são amplamente usados em restaurantes para cardápios digitais, pagamentos via Pix, avaliações no Google e promoções. Com o Gerador de Qr Code, você pode rastrear quantas pessoas escanearam e de qual localização.",
  },
  {
    question: "Posso rastrear quem escaneou meu QR Code?",
    answer: "Sim. Nosso painel de Analytics mostra o número total de scans, data/hora de cada scan, e estatísticas detalhadas. Planos premium incluem relatórios avançados com gráficos de tendências.",
  },
  {
    question: "QR Code expira?",
    answer: "No plano gratuito, QR Codes expiram após 14 dias. Nos planos pagos (Mensal, Trimestral ou Anual), seus QR Codes são permanentes e nunca expiram, garantindo que seus materiais impressos continuem funcionando.",
  },
  {
    question: "Como usar QR Code para pagamento Pix?",
    answer: "Você pode gerar um QR Code que redireciona para sua chave Pix ou link de pagamento. Basta inserir o link do seu Pix como destino do QR Code e distribuir para seus clientes.",
  },
  {
    question: "Qual o melhor gerador de QR Code do Brasil?",
    answer: "O Gerador de Qr Code é a solução mais completa do mercado brasileiro: oferece QR Codes dinâmicos, rastreáveis, personalizáveis, com analytics avançado e suporte em português. Comece grátis e veja a diferença.",
  },
  {
    question: "QR Code personalizado é seguro?",
    answer: "Sim. Todos os QR Codes gerados pelo Gerador de Qr Code utilizam links encriptados e monitoramento de integridade. Seus dados e os de seus clientes estão protegidos com as melhores práticas de segurança.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function Home() {
  return (
    <main className="relative flex flex-col items-center">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-blue-500/10 blur-[120px] rounded-full -z-10" />

      {/* Header */}
      <nav className="w-full max-w-7xl px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="text-white w-6 h-6 fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Gerador de Qr Code</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Recursos</a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Planos</a>
          <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">FAQ</a>
          <Link href="/login" className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-colors">
            Acessar Painel
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mt-20 px-6 text-center space-y-8 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
          O Melhor <span className="gradient-text">Gerador de QR Code</span> Dinâmico do Brasil.
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
          Crie códigos rastreáveis, personalizados e profissionais em segundos. Gerencie sua presença digital e impulsione suas conversões hoje mesmo.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-green-500" />
            14 Dias Grátis
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-green-500" />
            Sem Cartão de Crédito
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-green-500" />
            Suporte em Português
          </div>
        </div>

        <div className="pt-10">
          <PublicGenerator />
        </div>
      </section>

      {/* Social Proof Section (NEW) */}
      <section className="mt-20 px-6 w-full max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="py-10 border-y border-white/5 flex flex-col md:flex-row items-center justify-center gap-12 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground md:mr-4">Confiado por:</p>
          <div className="flex flex-wrap justify-center gap-12 items-center">
             <div className="text-xl font-black italic tracking-tighter">TECH.CORP</div>
             <div className="text-xl font-serif font-bold italic tracking-tighter">RESTAURANTE.BIO</div>
             <div className="text-xl font-sans font-extrabold tracking-tighter">AGÊNCIA_X</div>
             <div className="text-xl font-mono font-bold tracking-tighter">STARTUP.NET</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mt-40 px-6 max-w-7xl w-full">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold">Por que usar o nosso Gerador de QR Code?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Desenvolvido para negócios que buscam performance, segurança e resultados mensuráveis.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Shield className="w-6 h-6 text-blue-400" />}
            title="Segurança Máxima"
            description="Links protegidos com SSL e monitoramento constante de integridade para sua total tranquilidade."
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-purple-400" />}
            title="Sessões Dinâmicas"
            description="Altere a URL de destino dos seus códigos em tempo real sem precisar reimprimir nada."
          />
          <FeatureCard
            icon={<TrendingUp className="w-6 h-6 text-green-400" />}
            title="Analytics em Tempo Real"
            description="Acompanhe quem, quando e de onde estão escanneando. Dados precisos para decisões inteligentes."
          />
        </div>
      </section>

      <PricingSection />

      {/* FAQ Section — AEO Optimized */}
      <section id="faq" className="mt-20 mb-40 w-full max-w-4xl px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <HelpCircle className="w-4 h-4" />
            Perguntas Frequentes
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Guia Completo: Dúvidas sobre o Gerador de Qr Code</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Respondemos às dúvidas mais comuns sobre geração, uso e rastreamento de QR Codes profissionais.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, idx) => (
            <FAQItem key={idx} question={item.question} answer={item.answer} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="text-blue-600 w-5 h-5 fill-blue-600" />
              <span className="font-bold">Gerador de Qr Code</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A maior plataforma de QR Codes dinâmicos do Brasil. Criada para empresas que buscam inteligência e crescimento.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-blue-400">Produtos</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-white transition-colors">QR Code Dinâmico</a></li>
              <li><a href="#" className="hover:text-white transition-colors">QR Code para Pix</a></li>
              <li><a href="#" className="hover:text-white transition-colors">QR Code para WhatsApp</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Menus Digitais</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-blue-400">Empresa</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog de SEO</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Afiliados</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-blue-400">Legal</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-muted-foreground text-sm">© 2026 Gerador de Qr Code. Todos os direitos reservados.</p>
          <div className="flex gap-4 text-xs text-muted-foreground/30 italic">
            <span>Gerador de QR Code Online</span>
            <span>•</span>
            <span>Criar QR Code Grátis</span>
            <span>•</span>
            <span>Analytics de QR Code</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-card border border-white/5 space-y-4 hover:border-blue-500/30 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-2xl border border-white/5 bg-card/50 backdrop-blur-sm overflow-hidden transition-all hover:border-blue-500/20">
      <summary className="flex items-center justify-between px-8 py-6 cursor-pointer list-none select-none">
        <h3 className="text-base font-bold text-white group-open:text-blue-400 transition-colors pr-4">
          {question}
        </h3>
        <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 group-open:rotate-180 group-open:text-blue-400" />
      </summary>
      <div className="px-8 pb-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {answer}
        </p>
      </div>
    </details>
  )
}
