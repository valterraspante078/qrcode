import Link from "next/link";
import { ArrowLeft, TrendingUp, Handshake, DollarSign, ExternalLink } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Programa de Afiliados | Gerador de QR Code da Fortuna",
    description: "Ganhe dinheiro divulgando a principal ferramenta de QR Code do Brasil com altas comissões recorrentes.",
};

export default function AfiliadosPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-10">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para a Home
                </Link>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-8">Programa de Afiliados</h1>
                <p className="text-xl text-muted-foreground mb-12">
                    Faça parte de uma das ferramentas SaaS que mais engajam negócios locais. A cada assinatura adquirida a partir do seu Link, nós repassamos <strong>até 40% de comissão</strong> para a sua conta via PIX automático.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                        <TrendingUp className="w-8 h-8 text-blue-400 mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-3">Comissão Recorrente</h3>
                        <p className="text-muted-foreground text-sm">
                            Enquanto o cliente mantiver sua assinatura PRO (Mensal ou Anual) ativa com o Mercado Pago, você recebe sua fatia em todos os picos de renovações. O esforço inicial gera ganhos de longo prazo!
                        </p>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                        <DollarSign className="w-8 h-8 text-green-400 mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-3">Altíssima Conversão</h3>
                        <p className="text-muted-foreground text-sm">
                            Nosso produto foi estritamente polido para encantar o usuário final. Páginas enxutas, gatilhos mentais acionáveis, e integração em um clique elevam drasticamente a chance de assinatura do seu Lead enviado.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                        <Handshake className="w-8 h-8 text-purple-400 mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-3">Rastreio de Cookies</h3>
                        <p className="text-muted-foreground text-sm">
                            Até 60 dias de Last-Click cookies. O usuário pode clicar entrar no aplicativo, avaliar o sistema gratuito e se ele atualizar o pacote premium, a venda ainda é atrelada integralmente ao seu ID parceiro.
                        </p>
                    </div>
                </div>

                <div className="bg-blue-600/10 border border-blue-500/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-3">Quer ser Parceiro Oficial?</h2>
                        <p className="text-muted-foreground text-sm max-w-lg">
                            Estamos configurando o painel de parceiros automático nas próximas integrações, onde você capturará a URL exclusiva direto no seu painel logado com métricas. Por ora, inicie contatando nossa gerência para ingressar no programa restrito e obter seu ID de afiliação.
                        </p>
                    </div>
                    <Link 
                        href="/contato" 
                        className="w-full md:w-auto shrink-0 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-colors inline-flex justify-center items-center gap-2"
                    >
                        Entrar em Contato
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
