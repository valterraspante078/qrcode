import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, MapPin } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Fale Conosco | Gerador de QR Code da Fortuna",
    description: "Entre em contato agora mesmo com os atendentes da plataforma ou mande um e-mail para sugestões e parcerias.",
};

export default function ContatoPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-10">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para a Home
                </Link>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-8">Podemos ajudar?</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mb-16">
                    Seja para relatar um bug, solicitar recursos enterprise, entrar para a nossa rede de afiliados ou sugerir algo de outro mundo na ferramenta de códigos, adoraremos conversar. 
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    {/* Contatos Express*/}
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors">
                            <div className="w-12 h-12 bg-blue-600/20 shrink-0 rounded-full flex items-center justify-center">
                                <Mail className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg mb-1">E-mail Comercial Oficial</h3>
                                <p className="text-muted-foreground mb-3 text-sm">Respostas de alta complexidade em até 48 horas úteis.</p>
                                <a href="mailto:contato@geradordeqrcode.com.br" className="text-blue-400 hover:underline font-medium">contato@geradordeqrcode.com.br</a>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors">
                            <div className="w-12 h-12 bg-green-500/20 shrink-0 rounded-full flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg mb-1">Atendimento Rápido via WhatsApp</h3>
                                <p className="text-muted-foreground mb-3 text-sm">Suporte expresso a clientes assinantes PRO.</p>
                                <a href="#" className="inline-block bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-500/20 transition-colors">
                                    Enviar Mensagem
                                </a>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-500/20 shrink-0 rounded-full flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg mb-1">Escritório Central (Operação Web)</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Totalmente adaptados à nova era global, nossa matriz de software opera nativamente focada no digital sem restrições fronteiriças (Home / Remote Office). Ponto de contato presencial sob prévio agendamento ou conferência virtual agendada.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Formulário Falso Estilizado */}
                    <div className="bg-[#0f0f13] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                        <h3 className="text-2xl font-bold text-white mb-6">Mande um recado rápido</h3>
                        <form className="space-y-4" action="#">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Seu Nome</label>
                                <input type="text" placeholder="Ex: João da Silva" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1.5">E-mail para resposta</label>
                                <input type="email" placeholder="joao@empresa.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Assunto ou Motivo</label>
                                <textarea rows={4} placeholder="Como podemos crescer ainda mais a nossa startup?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"></textarea>
                            </div>
                            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors mt-2">
                                Enviar Mensagem
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
