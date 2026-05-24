import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Termos de Uso | Gerador de QR Code da Fortuna",
    description: "Leia nossos termos de uso para entender suas obrigações, direitos e regras da plataforma Gerador de QR Code da Fortuna.",
};

export default function TermosPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-10">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para a Home
                </Link>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-8">Termos de Uso</h1>
                
                <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
                    <p className="text-sm">Última atualização: Maio de 2026</p>
                    
                    <p>
                        Bem-vindo ao <strong>Gerador de QR Code da Fortuna</strong>. Ao acessar e utilizar nossa plataforma, você concorda legalmente e de forma expressa com os Termos de Uso aqui descritos. Se você não concorda com alguma de nossas diretrizes, por favor, não utilize nossos serviços.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-10 mb-4">1. Nossos Serviços</h2>
                    <p>
                        Disponibilizamos a criação de QR Codes dinâmicos para links, pagamentos (Pix), redes sociais (WhatsApp, Instagram), entre outras finalidades. Os usuários podem optar por versões gratuitas (baseadas em períodos promocionais) ou aderir a assinaturas pagas (Plano PRO).
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-10 mb-4">2. Regras de Assinatura e Pagamentos</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>
                            <strong>Cobrança Recorrente:</strong> Processamos os pagamentos de forma totalmente segura via <strong>Mercado Pago</strong> (assinaturas ou pagamentos únicos). A renovação de planos (Mensal, Trimestral ou Anual) é realizada de forma automática pelo gateway de pagamento, de acordo com o plano aceito pelo usuário.
                        </li>
                        <li>
                            <strong>Cancelamentos:</strong> O assinante possui autonomia total para efetuar o cancelamento a qualquer hora dentro de nosso dashboard interno ou solicitando ao suporte oficial. O cancelamento cessa as renovações imediatas, alterando os privilégios da conta no fim do ciclo pago.
                        </li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white mt-10 mb-4">3. Condutas Inaceitáveis e Restrições</h2>
                    <p>Ao criar seus QR Codes na plataforma, você compromete-se a <strong>NÃO</strong> realizar as seguintes ações:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Falsificar identidades financeiras por meio de códigos Pix manipulados.</li>
                        <li>Embutir URLs e scripts prejudiciais (phishing, malwares).</li>
                        <li>Promover ações extremistas, que violem direitos humanos ou conteúdo ilícito segundo a Legislação Brasileira.</li>
                        <li>Violar direitos autorais de terceiros nos materiais anexados.</li>
                    </ul>
                    <p>Nos reservamos o direito de excluir imediatamente suas artes e banir seu acesso, sem direito a qualquer aviso ou reembolso, em caso de violação explícita dessas regras de restrição.</p>

                    <h2 className="text-2xl font-bold text-white mt-10 mb-4">4. Limitação de Responsabilidade</h2>
                    <p>
                        Embora forneçamos análises e gestão premium, nós atuamos estritamente como a camada tecnológica para a geração e redirecionamento da informação, não nos responsabilizando ativamente por transações comerciais particulares derivadas do seu QR Code ou perdas resultantes da ausência de leituras dos consumidores à tecnologia exposta.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-10 mb-4">5. Propriedade Intelectual</h2>
                    <p>
                        A engine, software, layout do site, nomes e marcas &quot;Gerador de QR Code da Fortuna&quot; são propriedades da detentora e estão resguardadas por leis de proteção autoral e intelectual.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-10 mb-4">6. Alterações e Atualizações de Termos</h2>
                    <p>
                        Respeitamos o dinamismo da internet. Portanto, podemos alterar estes acordos a qualquer momento devido a novidades regulatórias da LGPD ou mudanças operacionais com o gateway Mercado Pago.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-10 mb-4">7. Programa de Afiliados</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>
                            <strong>Comissionamento:</strong> Afiliados recebem uma comissão de 40% sobre o valor da primeira venda ou renovação de assinaturas aprovadas provenientes de seus links registrados.
                        </li>
                        <li>
                            <strong>Saques e Pagamentos:</strong> Os valores acumulados podem ser sacados mediante solicitação no painel financeiro. Os repasses são processados com chave Pix (CPF, E-Mail ou Celular) na conta da mesma titularidade do afiliado.
                        </li>
                        <li>
                            <strong>Estornos e Chargebacks:</strong> Caso uma venda seja contestada ou estornada (chargeback) no gateway Mercado Pago em até 90 dias após a transação, a respectiva comissão será debitada do saldo futuro do afiliado.
                        </li>
                    </ul>

                    <p className="mt-10 pt-10 border-t border-white/10 text-sm">
                        Qualquer questionamento referente ao uso contratual pode ser sanado pelo e-mail: contato@geradordeqrcode.com.br
                    </p>
                </div>
            </div>
        </div>
    );
}
