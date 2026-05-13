import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Política de Cookies | Gerador de QR Code da Fortuna",
    description: "Saiba quais são os Cookies de dados utilizados pelo Gerador de QR Code da Fortuna no seu navegador e para qual finalidade.",
};

export default function CookiesPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-10">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para a Home
                </Link>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-8">Política de Cookies</h1>
                
                <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
                    
                    <p>
                        Os cookies ajudam empresas de tecnologia a reconhecer o usuário a cada visita do site. Esta página descreverá as funcionalidades utilizadas por esses pequeninos arquivos dentro da nossa plataforma <strong>Gerador de QR Code da Fortuna</strong>.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-10 mb-4">O que exatamente são Cookies?</h2>
                    <p>
                        Arquivos passivos salvos temporariamente na memória de longo termo ou curto termo (cache) no seu navegador ou telefone celular, emitido por nossos servidores do gateway, sendo ativados quando você navega de volta, melhorando substancialmente a velocidade e personalizando as janelas (para você não precisar fazer "login" novamente cada vez que abre o navegador).
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-10 mb-4">Quais Cookies Utilizamos no Portal?</h2>
                    
                    <h3 className="text-lg font-bold text-white mt-6 mb-2">Cookies Essenciais e Técnicos (Obrigatórios)</h3>
                    <p>
                        Totalmente essenciais no Next.JS e tecnologias Supabase vinculadas para manter você conectado (Logado), para preencher pagamentos no Mercado Pago mantendo tokens de sessão válidos de ponta-a-ponta na infraestrutura online. Se fossem desabilitados em sua máquina, o nosso código perderia o contato e as compras iriam falhar ou páginas bloqueariam acesso à Dashboards.
                    </p>

                    <h3 className="text-lg font-bold text-white mt-6 mb-2">Cookies de Desempenho / Análise (Opcionais à LGPD)</h3>
                    <p>
                        Conseguimos capturar a informação agregada e genérica através do <strong>Google Analytics</strong> ou mecanismos nativos que definem se o sistema travou ou entender relatórios, tal como "a quantidade de pessoas que apertou no botão Azul". Nenhuma destas captações é focada em expor seus atributos pessoais em hipótese nenhuma.
                    </p>

                    <h3 className="text-lg font-bold text-white mt-6 mb-2">Cookies de Publicidade ou Rastreio de Rede Social</h3>
                    <p>
                        O Mercado Pago ou Google Adsense / Meta Platforms ativam cookies de visualização mercadológicas para exibir nossos banners em retargeting do lado de fora caso percebam a probabilidade eminente de contratações recorrentes aos nossos pacotes geradores.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-10 mb-4">Seu Controle Sobre Eles</h2>
                    <p>
                        Qualquer visitante da internet, detém do total controle na guia de "Segurança" ou painéis de preferências dos principais browsers de navegação (Google Chrome, Brave, Safari, Firefox) de remover esses "Cookies" salvos ao limpar o cachê. Entenda no entanto, que limpezas severas requerem recadastros rotineiros ou bugs passageiros visuais em páginas do front-end.
                    </p>
                </div>
            </div>
        </div>
    );
}
