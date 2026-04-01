"use client"

import { useEffect, useState } from "react"
import { ExternalLink, Clock, Play, Loader2, Calendar, User, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { isAfter, parseISO, addDays, format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface AdminQRTableProps {
    type: "registered" | "public"
}

export function AdminQRTable({ type }: AdminQRTableProps) {
    const [qrs, setQrs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actionId, setActionId] = useState<string | null>(null)

    const fetchQrs = async () => {
        try {
            const res = await fetch(`/api/admin/qr?type=${type}`)
            const data = await res.json()
            if (Array.isArray(data)) setQrs(data)
        } catch (err) {
            console.error("Error fetching QRs:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (id: string, action: string, expiresAt?: string) => {
        setActionId(id)
        try {
            const res = await fetch("/api/admin/qr", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, action, expiresAt })
            })
            if (res.ok) {
                fetchQrs()
            }
        } catch (err) {
            console.error("Action error:", err)
        } finally {
            setActionId(null)
        }
    }

    useEffect(() => {
        fetchQrs()
    }, [type])

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Carregando códigos...</p>
        </div>
    )

    return (
        <div className="glass rounded-[2rem] border-white/5 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
                    <tr>
                        <th className="px-8 py-5 font-bold">Nome / Conteúdo</th>
                        <th className="px-8 py-5 font-bold">{type === "registered" ? "Dono" : "Público"}</th>
                        <th className="px-8 py-5 font-bold">Status / Expiração</th>
                        <th className="px-8 py-5 font-bold text-center">Scans</th>
                        <th className="px-8 py-5 font-bold text-right">Ações Admin</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {qrs.map((qr) => {
                        const active = !qr.expires_at || isAfter(parseISO(qr.expires_at), new Date())
                        const scans = qr.scans?.[0]?.count || 0
                        const isProcessing = actionId === qr.id

                        return (
                            <tr key={qr.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="font-bold text-sm">{qr.name || "Sem nome"}</div>
                                    <div className="text-[10px] text-muted-foreground truncate max-w-[200px] mt-1">{qr.content}</div>
                                </td>
                                <td className="px-8 py-6">
                                    {qr.profiles ? (
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-blue-300">{qr.profiles.display_name || "Dono"}</span>
                                            <span className="text-[10px] text-muted-foreground">{qr.profiles.email}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-orange-400/60 font-black uppercase text-[10px] tracking-widest">
                                            <Globe className="w-3 h-3" /> Anonimo
                                        </div>
                                    )}
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1.5">
                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                            active ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                        )}>
                                            {active ? "Ativo" : "Expirado"}
                                        </div>
                                        {qr.expires_at && (
                                            <div className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-bold tracking-tighter">
                                                <Calendar className="w-3 h-3" />
                                                {format(parseISO(qr.expires_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                            </div>
                                        )}
                                        {!qr.expires_at && (
                                            <div className="text-[10px] text-blue-400/60 uppercase font-black tracking-widest">
                                                Permanente
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className="font-mono text-sm font-bold text-blue-100">{scans}</span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        {/* Toggle status */}
                                        <button
                                            disabled={isProcessing}
                                            onClick={() => handleAction(qr.id, "toggle", active ? "deactivate" : "activate")}
                                            className={cn(
                                                "p-2 rounded-lg transition-all border outline-none active:scale-95 disabled:opacity-50",
                                                active 
                                                    ? "bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white"
                                                    : "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500 hover:text-white"
                                            )}
                                            title={active ? "Desativar Agora" : "Ativar Permanente"}
                                        >
                                            {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : active ? <Clock className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                        </button>

                                        {/* Extend 14 days */}
                                        <button
                                            disabled={isProcessing}
                                            onClick={() => handleAction(qr.id, "extend")}
                                            className="p-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all active:scale-95 disabled:opacity-50"
                                            title="Estender +14 Dias"
                                        >
                                            {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Calendar className="w-3 h-3" />}
                                        </button>
                                        
                                        <a
                                            href={`${process.env.NEXT_PUBLIC_SITE_URL}/q/${qr.id}`}
                                            target="_blank"
                                            className="p-2 bg-white/5 border border-white/5 text-muted-foreground hover:bg-white/10 hover:text-white rounded-lg transition-all"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
