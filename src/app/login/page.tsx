"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Zap, Sparkles, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react"
import { useEffect } from "react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSignUp, setIsSignUp] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                console.log("Sessão ativa encontrada:", session.user.email)
                router.push("/dashboard")
            }
        }
        checkUser()
    }, [supabase, router])

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data, error } = isSignUp
            ? await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            })
            : await supabase.auth.signInWithPassword({ email, password })

        console.log("Resultado da Autenticação:", { data, error })

        if (error) {
            let translatedError = error.message;
            if (error.message === "Invalid login credentials") {
                translatedError = "E-mail ou senha incorretos.";
            } else if (error.message === "User already registered") {
                translatedError = "Este e-mail já está em uso.";
            } else if (error.message === "Password should be at least 6 characters") {
                translatedError = "A senha deve ter pelo menos 6 caracteres.";
            }
            setError(translatedError)
        } else if (data.user || data.session) {
            console.log("Sucesso! Redirecionando...")
            router.push("/dashboard")
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a] relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[400px] bg-blue-500/10 blur-[100px] rounded-full -z-10" />

            <div className="w-full max-w-md space-y-8 glass p-10 rounded-[2rem] border-white/5 shadow-2xl">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Zap className="text-white w-7 h-7 fill-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        {isSignUp ? "Crie sua conta" : "Bem-vindo de volta"}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {isSignUp
                            ? "Comece hoje a proteger seus QR codes."
                            : "Acesse seu painel da fortuna."}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 rounded-xl bg-background border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 pl-12 pr-12 rounded-xl bg-background border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        disabled={loading}
                        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                {isSignUp ? "Criar Conta" : "Entrar"}
                                <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                            </>
                        )}
                    </button>
                </form>

                <div className="pt-6 text-center border-t border-white/5">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                    >
                        {isSignUp ? "Já tem conta? Entre aqui" : "Novo por aqui? Crie uma conta agora!"}
                    </button>
                </div>
            </div>
        </main>
    )
}
