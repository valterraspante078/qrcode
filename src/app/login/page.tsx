"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Zap, Sparkles, Mail, Lock, Loader2, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import Link from "next/link"
import { isUuid } from "@/lib/validation"

// Inline Google logo SVG component
function GoogleLogo({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    )
}

// Supabase error messages translation map (PT-BR)
const ERROR_TRANSLATIONS: Record<string, string> = {
    "Invalid login credentials": "E-mail ou senha incorretos.",
    "User already registered": "Este e-mail já está em uso.",
    "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres.",
    "Email not confirmed": "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
    "Signup requires a valid password": "Informe uma senha válida.",
    "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
    "User not found": "Usuário não encontrado.",
    "Invalid email": "Informe um e-mail válido.",
    "New password should be different from the old password.": "A nova senha deve ser diferente da anterior.",
    "Unable to validate email address: invalid format": "Formato de e-mail inválido.",
    "Anonymous sign-ins are disabled": "Cadastro anônimo desabilitado.",
    "Signups not allowed for this instance": "Cadastros estão temporariamente desabilitados.",
    "Email link is invalid or has expired": "O link de confirmação é inválido ou expirou.",
    "Token has expired or is invalid": "Sessão expirada. Faça login novamente.",
}

function translateError(message: string): string {
    return ERROR_TRANSLATIONS[message] || `Erro: ${message}`
}

function LoginContent() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
    const [resetEmailSent, setResetEmailSent] = useState(false)
    const [isForgotPassword, setIsForgotPassword] = useState(false)

    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams();
    const [isSignUp, setIsSignUp] = useState(() => searchParams.get("mode") === "signup");

    useEffect(() => {
        const mode = searchParams.get("mode");
        if (mode === "signup") {
            setIsSignUp(true);
            setIsForgotPassword(false);
        } else if (mode === "login") {
            setIsSignUp(false);
            setIsForgotPassword(false);
        }

        // Show error from URL params (e.g., from auth callback)
        const urlError = searchParams.get("error");
        if (urlError) {
            setError(urlError);
        }

        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                router.push("/dashboard")
            }
        }
        checkUser()
    }, [supabase, router, searchParams])

    const handleGoogleLogin = async () => {
        if (!supabase) {
            setError("Erro: Configuração do Supabase ausente.")
            return
        }
        setGoogleLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) {
                setError(translateError(error.message))
            }
        } catch (err: unknown) {
            setError(`Erro inesperado: ${err instanceof Error ? err.message : "Tente novamente mais tarde."}`)
        } finally {
            setGoogleLoading(false)
        }
    }

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
            })

            if (error) {
                setError(translateError(error.message))
            } else {
                setResetEmailSent(true)
            }
        } catch (err: unknown) {
            setError(`Erro inesperado: ${err instanceof Error ? err.message : "Tente novamente mais tarde."}`)
        } finally {
            setLoading(false)
        }
    }

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isForgotPassword) {
            return handleForgotPassword(e)
        }

        if (!supabase) {
            setError("Erro: Configuração do Supabase ausente. Verifique as variáveis de ambiente.")
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Get affiliate from cookie before sign up
            let affiliateId = null;
            if (isSignUp) {
                const refMatch = document.cookie.match(/(?:^|; )qrc_affiliate_ref=([^;]*)/);
                if (refMatch && refMatch[1]) {
                    const decodedRef = decodeURIComponent(refMatch[1]);
                    affiliateId = isUuid(decodedRef) ? decodedRef : null;
                }
            }

            const { data, error } = isSignUp
                ? await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                        data: {
                            referred_by: affiliateId
                        }
                    }
                })
                : await supabase.auth.signInWithPassword({ email, password })

            if (error) {
                setError(translateError(error.message))
            } else if (isSignUp && data.user && !data.session) {
                // Signup successful but email needs confirmation
                setEmailSent(true)

                // Track sign_up conversion
                if (typeof window !== "undefined" && typeof window.gtag === "function") {
                    window.gtag("event", "conversion", {
                        "send_to": "AW-18124091400/sign_up"
                    })
                }
            } else if (data.user || data.session) {
                // Track sign_up conversion
                if (isSignUp && typeof window !== "undefined" && typeof window.gtag === "function") {
                    window.gtag("event", "conversion", {
                        "send_to": "AW-18124091400/sign_up"
                    })
                }

                router.push("/dashboard")
                router.refresh()
            }
        } catch (err: unknown) {
            setError(`Erro inesperado: ${err instanceof Error ? err.message : "Tente novamente mais tarde."}`)
        } finally {
            setLoading(false)
        }
    }

    // Email Confirmation Screen (Signup or Password Reset)
    if (emailSent || resetEmailSent) {
        return (
            <main className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a] relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[500px] bg-blue-500/10 blur-[120px] rounded-full -z-10" />
                <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full -z-10" />

                <div className="w-full max-w-md login-card-enter">
                    <div className="glass p-10 rounded-[2rem] border-white/5 shadow-2xl text-center space-y-6">
                        {/* Success icon */}
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-green-400" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-extrabold tracking-tight font-[var(--font-display)]">
                                {resetEmailSent ? "E-mail de recuperação enviado" : "Verifique seu e-mail"}
                            </h1>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {resetEmailSent 
                                    ? "Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha em:"
                                    : "Enviamos um link de confirmação para:"}
                                <br />
                                <span className="text-blue-400 font-semibold">{email}</span>.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-muted-foreground leading-relaxed">
                            <p>📧 Verifique sua <strong className="text-white">caixa de entrada</strong> e a <strong className="text-white">pasta de spam</strong>.</p>
                            <p className="mt-2">O link expira em 24 horas.</p>
                        </div>

                        <button
                            onClick={() => {
                                setEmailSent(false)
                                setResetEmailSent(false)
                                setIsSignUp(false)
                                setIsForgotPassword(false)
                                setPassword("")
                            }}
                            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Voltar para o login
                        </button>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a] relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[500px] bg-blue-500/10 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full -z-10" />
            <div className="absolute top-1/3 left-1/4 w-[200px] h-[200px] bg-blue-600/5 blur-[80px] rounded-full -z-10 animate-pulse" />

            <div className="w-full max-w-md login-card-enter">
                <div className="glass p-10 rounded-[2rem] border-white/5 shadow-2xl space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="flex justify-center mb-2">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 animate-glow">
                                <Zap className="text-white w-8 h-8 fill-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight gradient-text">
                            {isForgotPassword ? "Recuperar senha" : (isSignUp ? "Crie sua conta" : "Bem-vindo de volta")}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {isForgotPassword 
                                ? "Enviaremos um link para seu e-mail."
                                : (isSignUp ? "Comece hoje a proteger seus QR Codes." : "Acesse seu painel e gerencie seus QR Codes.")}
                        </p>
                    </div>

                    {!isForgotPassword && (
                        <>
                            {/* Google OAuth Button */}
                            <button
                                onClick={handleGoogleLogin}
                                disabled={googleLoading || loading}
                                className="w-full h-12 rounded-xl bg-white hover:bg-gray-100 text-gray-800 font-semibold transition-all flex items-center justify-center gap-3 group disabled:opacity-50 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {googleLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                                ) : (
                                    <>
                                        <GoogleLogo className="w-5 h-5" />
                                        <span className="text-sm">{isSignUp ? "Cadastrar com Google" : "Entrar com Google"}</span>
                                    </>
                                )}
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-px bg-white/10" />
                                <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">ou</span>
                                <div className="flex-1 h-px bg-white/10" />
                            </div>
                        </>
                    )}

                    {/* Email/Password Form */}
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-3">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                                    required
                                />
                            </div>

                            {!isForgotPassword && (
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Sua senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-12 pl-12 pr-12 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
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
                            )}
                        </div>

                        {/* Forgot Password link (only in login mode) */}
                        {!isSignUp && !isForgotPassword && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsForgotPassword(true)}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                                >
                                    Esqueci minha senha
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            disabled={loading || googleLoading}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2 group disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    {isForgotPassword ? "Enviar link de recuperação" : (isSignUp ? "Criar Conta" : "Entrar")}
                                    <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                                </>
                            )}
                        </button>

                        {isForgotPassword && (
                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsForgotPassword(false)}
                                    className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Voltar para login
                                </button>
                            </div>
                        )}
                    </form>

                    {/* Toggle Sign Up / Sign In */}
                    {!isForgotPassword && (
                        <div className="pt-2 text-center border-t border-white/5">
                            <button
                                onClick={() => {
                                    setIsSignUp(!isSignUp)
                                    setError(null)
                                }}
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium pt-4 inline-block"
                            >
                                {isSignUp ? "Já tem conta? Entre aqui" : "Novo por aqui? Crie uma conta agora!"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer link */}
                <div className="text-center mt-8">
                    <Link
                        href="/"
                        className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                        ← Voltar para o site
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}
