"use client"

import { useEffect, useState } from "react"
import { User, Mail, Shield, Zap, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function UserList() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users")
            const data = await res.json()
            if (Array.isArray(data)) setUsers(data)
        } catch (err) {
            console.error("Error fetching users:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Carregando usuários...</p>
        </div>
    )

    return (
        <div className="glass rounded-[2rem] border-white/5 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
                    <tr>
                        <th className="px-8 py-5 font-bold">Usuário</th>
                        <th className="px-8 py-5 font-bold">E-mail</th>
                        <th className="px-8 py-5 font-bold">Plano</th>
                        <th className="px-8 py-5 font-bold">Criado em</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                                        {user.display_name?.[0] || user.email?.[0] || "?"}
                                    </div>
                                    <span className="font-bold text-sm">{user.display_name || "Sem nome"}</span>
                                </div>
                            </td>
                            <td className="px-8 py-6 text-sm text-muted-foreground">
                                {user.email}
                            </td>
                            <td className="px-8 py-6">
                                <div className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                    user.subscription_status === "active" ? "bg-green-500/10 text-green-500" : "bg-white/5 text-muted-foreground"
                                )}>
                                    {user.subscription_status === "active" ? <Zap className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                    {user.subscription_tier || "FREE"}
                                </div>
                            </td>
                            <td className="px-8 py-6 text-xs text-muted-foreground">
                                {new Date(user.created_at).toLocaleDateString("pt-BR")}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
