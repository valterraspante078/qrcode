"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { User, Lock, ShieldCheck, Mail, Save, RefreshCw, Smartphone, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>({ display_name: "" })
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })
    const [message, setMessage] = useState({ type: "", text: "" })
    const [mfaEnabled, setMfaEnabled] = useState(false)
    const [verifyingMfa, setVerifyingMfa] = useState(false)
    const [verificationCode, setVerificationCode] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")

    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 12)
        if (digits.length <= 2) return digits
        if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 12)}`
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "").slice(0, 12)
        setPhoneNumber(raw)
    }

    const supabase = createClient()

    useEffect(() => {
        async function fetchUser() {
            if (!supabase) {
                setLoading(false)
                return
            }
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            setUser(user)

            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()

            if (profile) setProfile(profile)
            setLoading(false)
        }
        fetchUser()
    }, [])

    const handleUpdateProfile = async () => {
        setSaving(true)
        setMessage({ type: "", text: "" })

        try {
            const { error } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    display_name: profile.display_name,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
            setMessage({ type: "success", text: "Perfil atualizado com sucesso!" })
        } catch (err: any) {
            setMessage({ type: "error", text: err.message })
        } finally {
            setSaving(false)
        }
    }

    const handleUpdatePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: "error", text: "As senhas não coincidem." })
            return
        }

        setSaving(true)
        try {
            const { error } = await supabase.auth.updateUser({ password: passwords.new })
            if (error) throw error
            setMessage({ type: "success", text: "Senha alterada com sucesso!" })
            setPasswords({ current: "", new: "", confirm: "" })
        } catch (err: any) {
            setMessage({ type: "error", text: err.message })
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

                <div className="col-span-full border-t border-white/5 my-4" />

                {/* 2FA Section */}
                <div className="md:col-span-1 space-y-2">
                    <h3 className="text-xl font-bold italic uppercase tracking-tight flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        2FA (SMS)
                    </h3>
                    <p className="text-muted-foreground text-sm">Adicione uma camada extra de proteção ao seu império.</p>
                </div>

                <div className="md:col-span-2 glass rounded-[2rem] border-white/5 p-8 flex items-center justify-between group hover:border-green-500/20 transition-all">
                    <div className="space-y-4 flex-1 mr-8">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "p-3 rounded-2xl bg-white/5 text-muted-foreground group-hover:bg-green-500/10 group-hover:text-green-500 transition-all shadow-xl",
                                mfaEnabled && "bg-green-500/20 text-green-500"
                            )}>
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white uppercase tracking-tight">Autenticação por Celular</h4>
                                <p className="text-xs text-muted-foreground">Receba códigos via SMS para cada login.</p>
                            </div>
                        </div>

                        {mfaEnabled ? (
                            <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
                                <CheckCircle2 className="w-4 h-4" />
                                Configurado e Ativo
                            </div>
                        ) : verifyingMfa ? (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Código de Verificação (Enviado para {formatPhone(phoneNumber)})</label>
                                    <div className="flex gap-2">
                                        {[0, 1, 2, 3, 4, 5].map((i) => (
                                            <input
                                                key={i}
                                                type="text"
                                                maxLength={1}
                                                value={verificationCode[i] || ""}
                                                onChange={(e) => {
                                                    const target = e.target as HTMLInputElement
                                                    const val = target.value.replace(/\D/g, "")
                                                    if (val) {
                                                        const newCode = verificationCode.split("")
                                                        newCode[i] = val
                                                        setVerificationCode(newCode.join("").slice(0, 6))
                                                        // Auto focus next
                                                        if (i < 5) (target.nextSibling as HTMLInputElement)?.focus()
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Backspace" && !verificationCode[i] && i > 0) {
                                                        const target = e.target as HTMLInputElement
                                                        const newCode = verificationCode.split("")
                                                        newCode[i - 1] = ""
                                                        setVerificationCode(newCode.join(""))
                                                            ; (target.previousSibling as HTMLInputElement)?.focus()
                                                    }
                                                }}
                                                className="w-full h-12 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-green-500/50 outline-none text-center text-xl font-bold font-mono"
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground/60 italic">Dica: Para teste, qualquer código de 6 dígitos funciona!</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            if (verificationCode.length === 6) {
                                                setMfaEnabled(true)
                                                setVerifyingMfa(false)
                                                setMessage({ type: "success", text: "2FA Ativado com sucesso!" })
                                            }
                                        }}
                                        className="flex-1 h-12 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold text-xs transition-all uppercase tracking-widest"
                                    >
                                        Verificar e Ativar
                                    </button>
                                    <button
                                        onClick={() => setVerifyingMfa(false)}
                                        className="px-6 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground border border-white/10 font-bold text-xs transition-all"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Número do Celular</label>
                                        <span className="text-[10px] font-mono text-muted-foreground/40">{phoneNumber.length}/12</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-16 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-xs font-black text-blue-400">+55</div>
                                        <input
                                            type="text"
                                            value={formatPhone(phoneNumber)}
                                            onChange={handlePhoneChange}
                                            className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-lg font-mono tracking-widest text-blue-100"
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => phoneNumber.length >= 10 && setVerifyingMfa(true)}
                                    disabled={phoneNumber.length < 10}
                                    className="px-6 h-12 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 font-bold text-xs transition-all uppercase tracking-widest disabled:opacity-20 disabled:cursor-not-allowed"
                                >
                                    Configurar Agora
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="hidden lg:block w-32 h-32 opacity-20 group-hover:opacity-40 transition-all">
                        <ShieldCheck className="w-full h-full text-green-500" />
                    </div>
                </div>
            </div>
        </div>
    )
}
