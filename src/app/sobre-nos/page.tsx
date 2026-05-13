import Link from "next/link";
import { ArrowLeft, Rocket, Shield, Zap } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sobre Nós | Gerador de QR Code da Fortuna",
    description: "Conheça a missão do Gerador de QR Code da Fortuna, a principal plataforma de inteligência de links do Brasil.",
};

export default function SobreNosPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-10">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para a Home
                </Link>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-8">Nossa Missão Institucional</h1>
                
                <div className="prose prose-invert max-w-none text-muted-foreground space-y-8">
                    <p className="text-xl text-white/80 leading-relaxed font-medium">
                        O <strong>Gerador de QR Code da Fortuna</strong> nasceu com um único objetivo: facilitar a ponte entre o mundo físico e o mundo digital para negócios brasileiros da nova era.
                    </p>

                    <p>
                        A popularização dos códigos QR mudou a maneira como entregamos cardápios de restaurante, cobramos via PIX, passamos a senha do Wi-Fi e integramos leads do marketing presencial para o virtual. Apesar da massiva popularização, notamos que a grande maioria das plataformas do segmento ainda operava com restrições difíceis ou custos exorbitantes para moedas internacionais (Dólar). 
                    </p>
                    
                    <p>
                        Resolvemos reconstruir a tecnologia focados primeiramente no público brasileiro, oferecendo alta performance em pagamentos simplificados e códigos dinâmicos em que os empreendedores no Brasil possam medir o seu tráfego sem o risco e custo abusivo estrangeiro.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                                <Zap className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-white font-bold mb-2">Velocidade</h3>
                            <p className="text-sm">Infraestrutura escalável para mais de 10 mil leituras de código simultâneas sem perdas.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-white font-bold mb-2">Segurança Pátria</h3>
                            <p className="text-sm">Tratamento de dados e pagamentos sob o rigoroso guarda-chuva jurídico LGPD do Brasil.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                                <Rocket className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-white font-bold mb-2">Crescimento</h3>
                            <p className="text-sm">Ferramentas de coleta de tracking (Analytics) integrados sem gambiarras de código.</p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">A fundação do sucesso</h2>
                    <p>
                        Nós continuamos firmes desenvolvendo os recursos do portal para te entregar <strong>QR Codes</strong> cada vez mais modulares, focados no dia a dia do varejo online e físico com excelência incomparável.
                    </p>

                </div>
            </div>
        </div>
    );
}
