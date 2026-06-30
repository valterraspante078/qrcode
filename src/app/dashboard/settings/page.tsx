"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { User, Lock, Mail, Save, RefreshCw, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const [profile, setProfile] = useState<{ display_name?: string; pix_key?: string }>({ display_name: "" })
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })
    const [message, setMessage] = useState({ type: "", text: "" })

    const supabase = createClient()

    useEffect(() => {
        async function fetchUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setLoading(false)
                return
            }
            setUser(user)

            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()

            if (profileData) setProfile(profileData)
            setLoading(false)
        }
        fetchUser()
    }, [supabase])

    const handleUpdateProfile = async () => {
        if (!user) return
        setSaving(true)
        setMessage({ type: "", text: "" })

        try {
            const displayName = (profile.display_name || "").trim().slice(0, 100)
            const pixKey = (profile.pix_key || "").trim().slice(0, 160)

            const { error } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    display_name: displayName,
                    pix_key: pixKey,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
            setMessage({ type: "success", text: "Perfil atualizado com sucesso!" })
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            setMessage({ type: "error", text: message })
        } finally {
            setSaving(false)
        }
    }

    const handleUpdatePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: "error", text: "As senhas não coincidem." })
            return
        }

        if (passwords.new.length < 8) {
            setMessage({ type: "error", text: "A nova senha deve ter pelo menos 8 caracteres." })
            return
        }

        setSaving(true)
        try {
            const { error } = await supabase.auth.updateUser({ password: passwords.new })
            if (error) throw error
            setMessage({ type: "success", text: "Senha alterada com sucesso!" })
            setPasswords({ current: "", new: "", confirm: "" })
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            setMessage({ type: "error", text: message })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse font-bold uppercase tracking-widest text-xs">Acessando Configurações...</p>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300 text-sm font-bold">
                Sessão não encontrada. Faça login novamente para acessar suas configurações.
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
            {message.text && (
                <div className={cn(
                    "p-4 rounded-2xl border text-sm font-bold animate-in slide-in-from-top-4",
                    message.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                )}>
                    {message.type === "success" ? <CheckCircle2 className="inline w-4 h-4 mr-2" /> : "⚠️ "}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Section */}
                <div className="md:col-span-1 space-y-2">
                    <h3 className="text-xl font-bold italic uppercase tracking-tight flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500" />
                        Perfil
                    </h3>
                    <p className="text-muted-foreground text-sm">Gerencie suas informações públicas e de contato.</p>
                </div>

                <div className="md:col-span-2 glass rounded-[2rem] border-white/5 p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">E-mail da Conta</label>
                            <div className="flex items-center gap-3 h-12 px-4 rounded-xl bg-white/5 border border-white/5 text-muted-foreground cursor-not-allowed">
                                <Mail className="w-4 h-4" />
                                <span className="text-sm">{user.email}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Nome de Exibição</label>
                            <input
                                type="text"
                                value={profile.display_name || ""}
                                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm"
                                placeholder="Seu nome no império"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Chave PIX (Para Afiliados)</label>
                            <input
                                type="text"
                                value={profile.pix_key || ""}
                                onChange={(e) => setProfile({ ...profile, pix_key: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-green-500/50 outline-none transition-all text-sm"
                                placeholder="CPF, Celular, E-mail ou Chave Aleatória"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleUpdateProfile}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 px-6 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar Perfil
                    </button>
                </div>

                <div className="col-span-full border-t border-white/5 my-4" />

                {/* Password Section */}
                <div className="md:col-span-1 space-y-2">
                    <h3 className="text-xl font-bold italic uppercase tracking-tight flex items-center gap-2">
                        <Lock className="w-5 h-5 text-yellow-500" />
                        Segurança
                    </h3>
                    <p className="text-muted-foreground text-sm">Mantenha sua senha forte e atualizada.</p>
                </div>

                <div className="md:col-span-2 glass rounded-[2rem] border-white/5 p-8 space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Nova Senha</label>
                            <input
                                type="password"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Confirmar Nova Senha</label>
                            <input
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleUpdatePassword}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 px-6 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-sm transition-all disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        Atualizar Senha
                    </button>
                </div>
            </div>
        </div>
    )
}
