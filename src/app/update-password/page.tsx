"use client"

import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Zap, Sparkles, Lock, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react"

// Supabase error messages translation map (PT-BR)
const ERROR_TRANSLATIONS: Record<string, string> = {
    "New password should be different from the old password.": "A nova senha deve ser diferente da anterior.",
    "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres.",
    "Token has expired or is invalid": "O link de recuperação expirou ou é inválido. Peça um novo.",
}

function translateError(message: string): string {
    return ERROR_TRANSLATIONS[message] || `Erro: ${message}`
}

function UpdatePasswordContent() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                // If no session, the user didn't come from a valid recovery link
                router.push("/login?error=Sessão expirada ou link inválido. Solicite a recuperação novamente.")
            }
        }
        checkSession()
    }, [supabase, router])

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (password !== confirmPassword) {
            setError("As senhas não coincidem.")
            return
        }

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                setError(translateError(error.message))
            } else {
                setSuccess(true)
                // Redirect after 3 seconds
                setTimeout(() => {
                    router.push("/dashboard")
                }, 3000)
            }
        } catch (err: unknown) {
            setError(`Erro inesperado: ${err instanceof Error ? err.message : "Tente novamente mais tarde."}`)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <main className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a] relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[500px] bg-blue-500/10 blur-[120px] rounded-full -z-10" />
                
                <div className="w-full max-w-md login-card-enter">
                    <div className="glass p-10 rounded-[2rem] border-white/5 shadow-2xl text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-green-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-extrabold tracking-tight font-[var(--font-display)]">Senha alterada!</h1>
                            <p className="text-muted-foreground text-sm">Sua senha foi atualizada com sucesso. Redirecionando para o painel...</p>
                        </div>
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a] relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[500px] bg-blue-500/10 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full -z-10" />

            <div className="w-full max-w-md login-card-enter">
                <div className="glass p-10 rounded-[2rem] border-white/5 shadow-2xl space-y-8">
                    <div className="text-center space-y-3">
                        <div className="flex justify-center mb-2">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 animate-glow">
                                <Zap className="text-white w-8 h-8 fill-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight gradient-text">
                            Definir nova senha
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Escolha uma senha forte para sua segurança.
                        </p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-3">
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Nova senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 pl-12 pr-12 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirmar nova senha"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full h-12 pl-12 pr-12 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2 group disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Atualizar Senha
                                    <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    )
}

export default function UpdatePasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        }>
            <UpdatePasswordContent />
        </Suspense>
    )
}
