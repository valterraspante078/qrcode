"use client"

import { useState } from "react"
import { Check, Zap, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function BillingPage() {
    const [loading, setLoading] = useState<string | null>(null)

    const handleCheckout = async (priceId: string) => {
        setLoading(priceId)
        try {
            const res = await fetch("/api/checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId })
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="space-y-10">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Planos e Assinatura</h1>
                <p className="text-muted-foreground italic">Pague para manter seus códigos funcionando para sempre.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <PricingCard
                    title="Mensal"
                    price="197"
                    period="mês"
                    priceId="price_monthly_placeholder"
                    features={["QR Codes ilimitados", "Analytics premium", "Suporte VIP"]}
                    onSelect={handleCheckout}
                    loading={loading === "price_monthly_placeholder"}
                />
                <PricingCard
                    title="Trimestral"
                    price="100"
                    period="mês"
                    priceId="price_quarterly_placeholder"
                    highlight
                    features={["Economize 30%", "QR Codes ilimitados", "Analytics premium", "Suporte prioritário"]}
                    onSelect={handleCheckout}
                    loading={loading === "price_quarterly_placeholder"}
                />
                <PricingCard
                    title="Anual"
                    price="50"
                    period="mês"
                    priceId="price_yearly_placeholder"
                    features={["Melhor Custo Benefício", "QR Codes ilimitados", "Domínio customizado", "Suporte 24/7"]}
                    onSelect={handleCheckout}
                    loading={loading === "price_yearly_placeholder"}
                />
            </div>

            <p className="text-xs text-center text-muted-foreground mt-10">
                Lembre-se: Você deve configurar seus IDs de preço do Stripe no Dashboard do Stripe e atualizar as flags no código.
            </p>
        </div>
    )
}

function PricingCard({ title, price, period, features, highlight = false, onSelect, priceId, loading }: any) {
    return (
        <div className={cn(
            "p-8 rounded-[2rem] border transition-all flex flex-col relative overflow-hidden",
            highlight ? "bg-blue-600 border-blue-400 shadow-2xl scale-105 z-10" : "bg-card border-white/5"
        )}>
            {highlight && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
                    Mais Popular
                </div>
            )}
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold">R${price}</span>
                <span className="text-sm opacity-60">/{period}</span>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
                {features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3 text-sm">
                        <Check className={cn("w-4 h-4", highlight ? "text-white" : "text-blue-500")} />
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
