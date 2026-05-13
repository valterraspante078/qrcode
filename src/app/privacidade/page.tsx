import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Política de Privacidade | Gerador de QR Code da Fortuna",
    description: "Saiba como tratamos seus dados pessoais de forma segura e dentro das normas da LGPD.",
};

export default function PrivacidadePage() {
    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-10">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para a Home
                </Link>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-8">Política de Privacidade</h1>
                
                <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
                    <p className="text-sm">Última atualização: Maio de 2026</p>
                    
                    <p>
                        O respeito à sua privacidade é o princípio primário do <strong>Gerador de QR Code da Fortuna</strong>. Entendemos a extrema importância dos seus dados pessoais e escrevemos essa política para te assegurar 100% de clareza de como as suas informações são processadas dentro dos fundamentos da LGPD - Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-10 mb-4">1. Que Informações Nós Processamos?</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Dados Cadastrais:</strong> Nome e endereço de e-mail ao criar registro na plataforma.</li>
                        <li><strong>Informações de Uso:</strong> Estatísticas de cliques referentes aos seus QR Codes e acessos (Analytics), fundamentais para mostrarmos o desempenho de rastreio de seus clientes.</li>
                        <li><strong>Dados de Pagamento (Faturamento):</strong> Em planos mensais/anuais, seus dados referentes ao pagamento (CPF, cartões de crédito) jamais são armazenados em nossos servidores. Para a segurança extrema de dados, a camada financeira é criptografada e transferida aos servidores oficias de nossos parceiros de Gateway de Pagamento, como o Mercado Pago.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white mt-10 mb-4">2. Com Quais Serviços Compartilhamos os Seus Dados?</h2>
                    <p>Somente com empresas cujo nível de segurança tecnológica seja da altíssima estirpe. Sendo eles:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Supabase:</strong> Fornece a forte criptografia em cima dos seus acessos (Email), banco de dados e senhas hashs.</li>
                        <li><strong>Mercado Pago:</strong> Processadores homologados no sistema bancário nacional onde realizamos a intermediação da nossa assinatura.</li>
                        <li><strong>Google Analytics e Google Ads:</strong> Nós ativamos cookies essenciais de conversão mercadológica ou uso métrico para melhora da plataforma, que atuam de forma 100% anonimizada (dados isolados).</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white mt-10 mb-4">3. Os seus direitos de Proprietário (LGPD)</h2>
                    <p>Aos moldes da lei atual, garantimos a você o direito de requerer:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Confirmação da existência de coleta dados referentes a sua pessoa na nossa database.</li>
                        <li>Anonimização, exclusão física de informações imprecisas ou retificação técnica.</li>
                        <li><strong>Exclusão Extrema:</strong> Caso resolva apagar sua conta, as tabelas que vinculavam o seu e-mail aos códigos originados podem ser deletadas do banco permanentemente.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white mt-10 mb-4">4. Período de Armazenamento</h2>
                    <p>
                        Retemos seus dados durante o período de prestação do serviço do pacote QR Gerador (Gratuito ou PRO/assinatura). Se solicitada a exclusão e finalizada a sua inscrição, em um prazo de no máximo 30 dias limpamos seus traços em tabelas secundárias, exceto quando imposto por obrigações legais em ações judiciais governamentais ou auditoria anti-fraude originária das intermediadoras de pagamento.
                    </p>

                    <p className="mt-10 pt-10 border-t border-white/10 text-sm">
                        Tem alguma dúvida ou deseja exercer o seu direito de esquecimento ou portabilidade de seus dados? Responda usando o suporte oficial ou através do e-mail: contato@geradordeqrcode.com.br.
                    </p>
                </div>
            </div>
        </div>
    );
}
