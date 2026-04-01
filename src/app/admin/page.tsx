"use client"

import { useEffect, useState } from "react"
import { Users, QrCode, Globe, Zap, ArrowUpRight, BarChart3, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserList } from "@/components/admin/UserList"
import { AdminQRTable } from "@/components/admin/AdminQRTable"

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<"users" | "registered" | "public">("users")

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/stats")
            const data = await res.json()
            setStats(data)
        } catch (err) {
            console.error("Stats error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin shadow-2xl shadow-red-600/20" />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Autenticando Acesso Root...</p>
        </div>
    )

    return (
        <div className="space-y-12">
            {/* Quick Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <AdminStatCard title="Total Usuários" value={stats.totalUsers} icon={<Users />} color="text-blue-400" />
                <AdminStatCard title="Total QR Codes" value={stats.totalQrs} icon={<QrCode />} color="text-purple-400" />
                <AdminStatCard title="QRs Ativos (Paid)" value={stats.activeQrs} icon={<Zap />} color="text-green-400" />
                <AdminStatCard title="QRs Públicos" value={stats.publicQrs} icon={<Globe />} color="text-orange-400" />
            </div>

            {/* Content Tabs */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/5 rounded-2xl w-fit">
                    <TabButton active={activeTab === "users"} label="Usuários" onClick={() => setActiveTab("users")} />
                    <TabButton active={activeTab === "registered"} label="QRs Registrados" onClick={() => setActiveTab("registered")} />
                    <TabButton active={activeTab === "public"} label="QRs Públicos" onClick={() => setActiveTab("public")} />
                </div>

                <div className="transition-all duration-500">
                    {activeTab === "users" && <UserList />}
                    {activeTab === "registered" && <AdminQRTable type="registered" />}
                    {activeTab === "public" && <AdminQRTable type="public" />}
                </div>
            </div>
        </div>
    )
}

function AdminStatCard({ title, value, icon, color }: any) {
    return (
        <div className="p-8 rounded-[2rem] bg-[#0c0c0c] border border-white/5 flex items-center justify-between group hover:border-red-500/20 transition-all shadow-xl hover:shadow-2xl">
            <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.2em]">{title}</p>
                <h4 className={cn("text-4xl font-black tracking-tighter", color)}>{value}</h4>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 text-muted-foreground group-hover:bg-white/10 transition-all scale-110">
                {icon}
            </div>
        </div>
    )
}

function TabButton({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                active ? "bg-white/10 text-white shadow-lg" : "text-muted-foreground hover:text-white"
            )}
        >
            {label}
        </button>
    )
}
