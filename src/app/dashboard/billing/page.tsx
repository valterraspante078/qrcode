"use client"

import { useState } from "react"
import { Check, ChevronRight, Loader2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

export default function BillingPage() {
    const [loading, setLoading] = useState<string | null>(null)
    const [cancelLoading, setCancelLoading] = useState(false)
    const supabase = createClient()

    const handleCheckout = async (planType: string) => {
        if (!supabase) {
            alert("Erro: Conexão com o banco de dados não configurada.")
            return
        }

        setLoading(planType)
        try {
            const res = await fetch("/api/checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planType })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Erro ao criar sessão de checkout")
            }

            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error("Nenhuma URL de checkout retornada.")
            }
        } catch (err: unknown) {
            console.error(err)
            alert(`Erro no checkout: ${err instanceof Error ? err.message : "Erro desconhecido"}`)
        } finally {
            setLoading(null)
        }
    }

    const handleCancel = async () => {
        if (!confirm("Tem certeza que deseja cancelar sua assinatura? Seus QR Codes podem expirar.")) {
            return
        }

        setCancelLoading(true)
        try {
            const res = await fetch("/api/portal", { method: "POST" })
            const data = await res.json()

            if (!res.ok) {
                if (res.status === 400) {
                    alert("Você ainda não possui uma assinatura ativa. Selecione um plano acima para começar!")
                } else {
                    throw new Error(data.error || "Erro ao cancelar assinatura")
                }
                return
            }

            alert("Assinatura cancelada com sucesso. Seu plano será alterado para FREE.")
            window.location.reload()
        } catch (err: unknown) {
            console.error(err)
            alert(`Erro ao cancelar: ${err instanceof Error ? err.message : "Erro desconhecido"}`)
        } finally {
            setCancelLoading(false)
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
                    price="50"
                    period="mês"
                    planType="mensal"
                    features={["QR Codes ilimitados", "Analytics premium", "Suporte VIP"]}
                    onSelect={handleCheckout}
                    loading={loading === "mensal"}
                />
                <PricingCard
                    title="Trimestral"
                    price="25"
                    period="mês"
                    planType="trimestral"
                    highlight
                    features={["Pagamento de R$75 a cada 3 meses", "QR Codes ilimitados", "Analytics premium", "Suporte prioritário"]}
                    onSelect={handleCheckout}
                    loading={loading === "trimestral"}
                />
                <PricingCard
                    title="Anual"
                    price="12,50"
                    period="mês"
                    planType="anual"
                    features={["Pagamento de R$150 anual", "QR Codes ilimitados", "Domínio customizado", "Suporte 24/7"]}
                    onSelect={handleCheckout}
                    loading={loading === "anual"}
                />
            </div>

            <div className="pt-10 border-t border-white/5">
                <h2 className="text-xl font-bold mb-4">Gerenciar Assinatura</h2>
                <p className="text-sm text-muted-foreground mb-6 text-balance">
                    Deseja cancelar sua assinatura? O cancelamento é imediato e seu plano será alterado para FREE.
                </p>
                <button 
                    disabled={cancelLoading}
                    onClick={handleCancel}
                    className="px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {cancelLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Cancelando...
                        </>
                    ) : (
                        <>
                            <XCircle className="w-4 h-4" />
                            Cancelar Assinatura
                        </>
                    )}
                </button>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-10">
                Pagamentos processados com segurança pelo Mercado Pago.
            </p>
        </div>
    )
}

interface PricingCardProps {
    title: string
    price: string
    period: string
    features: string[]
    highlight?: boolean
    onSelect: (planType: string) => void
    planType: string
    loading: boolean
}

function PricingCard({ title, price, period, features, highlight = false, onSelect, planType, loading }: PricingCardProps) {
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
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold">R${price}</span>
                <span className={cn("text-sm transition-opacity", highlight ? "text-blue-100" : "opacity-80")}>/{period}</span>
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
                onClick={() => onSelect(planType)}
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
