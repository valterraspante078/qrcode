import { PublicGenerator } from "@/components/PublicGenerator";
import { Sparkles, Shield, Zap, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="relative flex flex-col items-center">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-blue-500/10 blur-[120px] rounded-full -z-10" />

      {/* Header */}
      <nav className="w-full max-w-7xl px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="text-white w-6 h-6 fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">QR Fortuna</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Recursos</a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Planos</a>
          <Link href="/login" className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-colors">
            Acessar Painel
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mt-20 px-6 text-center space-y-8 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
          Gere <span className="gradient-text">QR Codes</span> que <br className="hidden md:block" /> impulsionam sua fortuna.
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
          Crie, personalize e rastreie seus QR codes com tecnologia de ponta. Comece grátis, scale para o infinito.
        </p>

        <div className="pt-10">
          <PublicGenerator />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8 px-6 max-w-7xl">
        <FeatureCard
          icon={<Shield className="w-6 h-6 text-blue-400" />}
          title="Segurança Máxima"
          description="Links protegidos e monitoramento constante de integridade dos seus dados."
        />
        <FeatureCard
          icon={<Zap className="w-6 h-6 text-purple-400" />}
          title="Alta Velocidade"
          description="Geração instantânea e redirecionamento de baixa latência para seus clientes."
        />
        <FeatureCard
          icon={<TrendingUp className="w-6 h-6 text-green-400" />}
          title="Analytics Avançado"
          description="Saiba exatamente quem, quando e de onde estão escaneando seus códigos."
        />
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="mt-40 mb-40 w-full max-w-7xl px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Planos que cabem no seu bolso</h2>
          <p className="text-muted-foreground">Escolha o plano ideal para a sua necessidade atual.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard
            title="Mensal"
            price="197"
            period="mês"
            features={["QR Codes ilimitados", "Analytics premium", "Suporte VIP"]}
            buttonText="Começar Agora"
          />
          <PricingCard
            title="Trimestral"
            price="100"
            period="mês"
            highlight
            features={["Economize 30%", "QR Codes ilimitados", "Analytics premium", "Suporte prioritário"]}
            buttonText="Selecionar Trimestral"
          />
          <PricingCard
            title="Anual"
            price="50"
            period="mês"
            features={["Melhor Custo Benefício", "QR Codes ilimitados", "Domínio customizado", "Suporte 24/7"]}
            buttonText="Selecionar Anual"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <Zap className="text-blue-600 w-5 h-5 fill-blue-600" />
            <span className="font-bold">QR Fortuna</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2026 QR Code da Fortuna. Todos os direitos reservados.</p>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Termos</a>
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

function PricingCard({ title, price, period, features, buttonText, highlight = false }: { title: string, price: string, period: string, features: string[], buttonText: string, highlight?: boolean }) {
  return (
    <div className={cn(
      "p-10 rounded-[2.5rem] border transition-all flex flex-col",
      highlight ? "bg-blue-600 border-blue-400 shadow-2xl shadow-blue-500/20 scale-105" : "bg-card border-white/5"
    )}>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-4xl font-extrabold">R${price}</span>
        <span className="text-sm opacity-60">/{period}</span>
      </div>
      <ul className="space-y-4 mb-10 flex-1">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-3 text-sm">
            <div className={cn("w-1.5 h-1.5 rounded-full", highlight ? "bg-white" : "bg-blue-500")} />
            {feature}
          </li>
        ))}
      </ul>
      <button className={cn(
        "w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
        highlight ? "bg-white text-black hover:bg-gray-100" : "bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
      )}>
        {buttonText}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
