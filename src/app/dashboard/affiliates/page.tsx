import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Users, DollarSign, WalletCards, CheckCircle2 } from "lucide-react"
import { CopyLinkButton } from "./CopyLinkButton"

export default async function AffiliatesDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // 1. Número de Leads indicados
    const { count: referredCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .eq("referred_by", user.id)

    // 2. Busca comissões
    const { data: commissions } = await supabase
        .from("commissions")
        .select("*")
        .eq("affiliate_id", user.id)

    // Cálculos
    const totalGanhos = commissions?.reduce((acc: number, curr: { amount: string | number }) => acc + Number(curr.amount), 0) || 0
    const saldoPendente = commissions?.filter((c: { status: string; amount: string | number }) => c.status === "pending").reduce((acc: number, curr: { amount: string | number }) => acc + Number(curr.amount), 0) || 0

    // O link exclusivo
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.geradordeqrcode.com.br"
    const affiliateLink = `${siteUrl}?ref=${user.id}`

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold mb-2 text-white">Programa de Afiliados (BETA)</h1>
                <p className="text-muted-foreground text-sm">Acompanhe suas indicações, ganhos recorrentes e retire seus valores via Pix.</p>
            </div>

            {/* Painéis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0f0f13] border border-white/5 p-6 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Users className="w-24 h-24" />
                    </div>
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                        <Users className="text-blue-400 w-5 h-5" />
                    </div>
                    <h3 className="text-muted-foreground text-sm font-medium">Cadastros Gerados</h3>
                    <p className="text-3xl font-bold text-white mt-2">{referredCount || 0}</p>
                </div>
                
                <div className="bg-[#0f0f13] border border-white/5 p-6 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <DollarSign className="w-24 h-24" />
                    </div>
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                        <DollarSign className="text-green-400 w-5 h-5" />
                    </div>
                    <h3 className="text-muted-foreground text-sm font-medium">Total Acumulado</h3>
                    <p className="text-3xl font-bold text-white mt-2">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalGanhos)}
                    </p>
                </div>

                <div className="bg-[#0f0f13] border border-blue-500/20 p-6 rounded-3xl shadow-xl shadow-blue-500/5 relative overflow-hidden">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                        <WalletCards className="text-blue-400 w-5 h-5" />
                    </div>
                    <h3 className="text-blue-200/60 text-sm font-medium">Saldo Disponível (Pendente)</h3>
                    <p className="text-3xl font-bold text-blue-400 mt-2">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoPendente)}
                    </p>
                </div>
            </div>

            {/* Link Exclusivo */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="w-full">
                    <h3 className="text-xl font-bold text-white mb-2">Seu Link de Indicação Exclusivo</h3>
                    <p className="text-muted-foreground text-sm mb-4">Copie o link abaixo, envie para a sua rede, e garanta 40% de comissão recorrente nas vendas geradas através dele.</p>
                    
                    <div className="flex bg-black/40 border border-white/10 rounded-xl p-2 items-center gap-2">
                        <input 
                            readOnly 
                            type="text" 
                            title="Seu Link Exclusivo"
                            aria-label="Link Exclusivo de Afiliado"
                            className="bg-transparent text-sm text-blue-300 flex-1 px-3 outline-none truncate" 
                            value={affiliateLink} 
                        />
                        <CopyLinkButton link={affiliateLink} />
                    </div>
                </div>
            </div>

            {/* Aviso de Saque */}
            <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-3xl flex items-start gap-4">
                <div className="mt-1">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                    <h4 className="text-white font-bold mb-1">Saques Simplificados e Automáticos</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
                        A burocracia ficou no passado! Agora o sistema faz a varredura automática do seu <strong>Saldo Disponível</strong>. Sempre que atingir o mínimo de R$ 50,00, faremos a transferência PIX diretamente na chave cadastrada na aba de <strong>Configurações</strong> do seu perfil, todo <strong>dia 05</strong> de cada mês, sem a necessidade de solicitar nada manualmente. 💸
                    </p>
                </div>
            </div>

        </div>
    )
}
