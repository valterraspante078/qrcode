import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BarChart3, QrCode, ArrowUp, Zap } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { isAfter, parseISO } from "date-fns"

import { QRNameEditor } from "@/components/dashboard/QRNameEditor"
import { QRRowActions } from "@/components/dashboard/QRRowActions"

export default async function DashboardPage() {
    const supabase = await createClient()

    if (!supabase) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Aguardando configuração do Supabase...</p>
            </div>
        )
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Fetch user profile for subscription status
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    const isPro = profile?.subscription_status === "active"

    // Fetch QR codes with scan counts (if possible)
    // We fetch qr_codes and then for each we want the count of scans
    const { data: qrs } = await supabase
        .from("qr_codes")
        .select(`
            *,
            scans(count)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    const totalScans = qrs?.reduce((acc: number, qr: any) => acc + (qr.scans?.[0]?.count || 0), 0) || 0
    const activeQrs = qrs?.filter((qr: any) => {
        if (isPro) return true
        if (!qr.expires_at) return true
        return isAfter(parseISO(qr.expires_at), new Date())
    }).length || 0

    return (
        <div className="space-y-10">
            {/* Welcome Card */}
            <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-400 overflow-hidden shadow-2xl">
                <div className="relative z-10 space-y-4">
                    <h1 className="text-3xl font-bold italic tracking-tight uppercase">Boas-vindas ao seu Painel, {profile?.display_name || user.email?.split("@")[0]}</h1>
                    <p className="text-blue-100 max-w-xl">
                        Seus códigos estão gerando fortuna. {isPro ? "Aproveite seu acesso ilimitado PRO." : "Você está no plano limitado FREE."}
                    </p>
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "px-4 py-2 rounded-lg backdrop-blur border text-xs font-bold uppercase",
                            isPro ? "bg-green-400/20 border-green-400 text-green-300" : "bg-white/10 border-white/20 text-white"
                        )}>
                            {isPro ? "PLANO PRO" : "PLANO FREE"}
                        </div>
                        {!isPro && (
                            <Link href="/dashboard/billing" className="px-4 py-2 rounded-lg bg-yellow-400 text-black text-xs font-bold uppercase animate-bounce hover:bg-yellow-300 transition-colors">
                                UPGRADE PRO
                            </Link>
                        )}
                    </div>
                </div>
                <Zap className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 -rotate-12" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Scans" value={totalScans.toLocaleString()} icon={<BarChart3 />} change="+0%" />
                <StatCard title="QR Ativos" value={activeQrs} icon={<QrCode />} />
                <StatCard title="Taxa Conversão" value="--" icon={<ArrowUp />} />
                <StatCard title="Status Conta" value={isPro ? "VIP" : "LIMITADA"} icon={<Zap />} color={isPro ? "text-green-400" : "text-yellow-500"} />
            </div>

            {/* QR Code List */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold px-2 flex items-center gap-2">
                    Seus Códigos Recentes
                    <span className="text-xs font-normal text-muted-foreground bg-white/5 px-2 py-1 rounded-full">{qrs?.length || 0} criados</span>
                </h3>
                <div className="glass rounded-[2rem] border-white/5 relative">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
                            <tr>
                                <th className="px-8 py-5 font-bold">Gerenciamento / Destino</th>
                                <th className="px-8 py-5 font-bold">Status</th>
                                <th className="px-8 py-5 font-bold text-center">Scans</th>
                                <th className="px-8 py-5 font-bold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {qrs && qrs.length > 0 ? qrs.map((qr: any) => {
                                const active = isPro || (!qr.expires_at || isAfter(parseISO(qr.expires_at), new Date()))
                                const scans = qr.scans?.[0]?.count || 0
                                return (
                                    <tr key={qr.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-6">
                                            <QRNameEditor id={qr.id} initialName={qr.name} />
                                            <div className="text-xs text-muted-foreground truncate max-w-xs mt-1">{qr.content}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                active ? "bg-green-500/10 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]" : "bg-red-500/10 text-red-500"
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", active ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                                                {active ? "Ativado" : "Expirado"}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="font-mono text-lg font-bold text-blue-100">{scans}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <QRRowActions
                                                id={qr.id}
                                                content={qr.content}
                                                name={qr.name}
                                                publicUrl={`${process.env.NEXT_PUBLIC_SITE_URL}/q/${qr.id}`}
                                                isExpired={!active}
                                            />
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-16 text-center text-muted-foreground/40 italic text-sm">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center opacity-20">
                                                <QrCode className="w-8 h-8" />
                                            </div>
                                            Seu império ainda não possui códigos registrados.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon, change, color }: any) {
    return (
        <div className="p-6 rounded-3xl bg-card/50 backdrop-blur-xl border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-xl">
            <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h4 className={cn("text-3xl font-bold tracking-tighter", color ? color : "text-white")}>{value}</h4>
                    {change && <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded uppercase">{change}</span>}
                </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 text-muted-foreground group-hover:bg-blue-600/10 group-hover:text-blue-400 transition-all">
                {icon}
            </div>
        </div>
    )
}
