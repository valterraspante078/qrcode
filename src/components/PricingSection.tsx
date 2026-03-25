"use client"

import { useState } from "react"
import { Check, Zap, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface PricingCardProps {
    title: string
    price: string
    period: string
    priceId: string
    features: string[]
    highlight?: boolean
}

export function PricingSection() {
    const [loading, setLoading] = useState<string | null>(null)
    const supabase = createClient()

    const handleCheckout = async (priceId: string) => {
        if (!supabase) {
            alert("Erro: Conexão com o banco de dados não configurada. Verifique as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e KEY.")
            return
        }

        setLoading(priceId)
        try {
            const { data, error } = await supabase.auth.getUser()
            
            if (error || !data.user) {
                // Se não estiver logado, manda pro login
                window.location.href = "/login?redirect=/dashboard/billing"
                return
            }

            const res = await fetch("/api/checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId })
            })
            
            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || "Erro ao criar sessão de checkout")
            }

            const checkoutData = await res.json()
            if (checkoutData.url) {
                window.location.href = checkoutData.url
            }
        } catch (err: any) {
            console.error(err)
            alert(`Erro no checkout: ${err.message}`)
        } finally {
            setLoading(null)
        }
    }

    return (
        <section id="pricing" className="mt-40 mb-20 w-full max-w-7xl px-6">
            <div className="text-center mb-20">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Planos que cabem no seu bolso</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest mb-4">
                    🔥 50% de DESCONTO POR TEMPO LIMITADO
                </div>
                <p className="text-muted-foreground mt-2">Escolha o plano ideal para a sua necessidade atual.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <PricingCard
                    title="Mensal"
                    price="50"
                    period="mês"
                    priceId="price_1TEsBMLrEod9tlUtA1P6SNrc"
                    features={["QR Codes ilimitados", "Analytics premium", "Suporte VIP"]}
                    onSelect={handleCheckout}
                    loading={loading === "price_1TEsBMLrEod9tlUtA1P6SNrc"}
                />
                <PricingCard
                    title="Trimestral"
                    price="25"
                    period="mês"
                    priceId="price_1TEsDMLrEod9tlUtxljXtxXN"
                    highlight
                    features={["Cobrado R$75 trimestralmente", "QR Codes ilimitados", "Analytics premium", "Suporte prioritário"]}
                    onSelect={handleCheckout}
                    loading={loading === "price_1TEsDMLrEod9tlUtxljXtxXN"}
                />
                <PricingCard
                    title="Anual"
                    price="12,50"
                    period="mês"
                    priceId="price_1TEsDuLrEod9tlUtPRPG12oa"
                    features={["Cobrado R$150 anualmente", "Melhor Custo Benefício", "Domínio customizado", "Suporte 24/7"]}
                    onSelect={handleCheckout}
                    loading={loading === "price_1TEsDuLrEod9tlUtPRPG12oa"}
                />
            </div>
        </section>
    )
}

function PricingCard({ title, price, period, features, highlight = false, onSelect, priceId, loading }: any) {
    return (
        <div className={cn(
            "p-10 rounded-[2.5rem] border transition-all flex flex-col relative",
            highlight ? "bg-blue-600 border-blue-400 shadow-2xl shadow-blue-500/20 scale-105 z-10" : "bg-card border-white/5"
        )}>
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold">R${price}</span>
                <span className="text-sm opacity-60">/{period}</span>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
                {features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3 text-sm">
                        <div className={cn("w-1.5 h-1.5 rounded-full", highlight ? "bg-white" : "bg-blue-500")} />
                        {feature}
                    </li>
                ))}
            </ul>
            <button
                disabled={loading}
                onClick={() => onSelect(priceId)}
                className={cn(
                    "w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                    highlight ? "bg-white text-black hover:bg-gray-100" : "bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
                )}
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                        Selecionar Plano
                        <ChevronRight className="w-4 h-4" />
                    </>
                )}
            </button>
        </div>
    )
}
