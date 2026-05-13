"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, LayoutDashboard, Database, CreditCard, Plus, BarChart3, Settings, Menu, X } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/ui/Modal"
import { PublicGenerator } from "@/components/PublicGenerator"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const supabase = createClient()
    const router = useRouter()
    const pathname = usePathname()
    const pageTitle = pathname.split("/").pop() || "Geral"

    // Fecha o menu num resize para desktop, caso seja rotacionado
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false)
            }
        }
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // Altera o overflow do body quando o menu mobile está aberto
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isMobileMenuOpen])

    const handleSignOut = async () => {
        if (!supabase) return
        await supabase.auth.signOut()
        router.push("/")
        router.refresh()
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    return (
        <div className="min-h-screen bg-[#070707] flex text-white relative">
            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed md:sticky top-0 h-[100dvh] w-72 border-r border-white/5 flex flex-col p-6 space-y-8 bg-[#070707] z-50 transition-transform duration-300 overflow-y-auto",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Close Button Mobile */}
                <button 
                    className="md:hidden absolute top-6 right-6 text-muted-foreground hover:text-white"
                    onClick={closeMobileMenu}
                    aria-label="Fechar menu lateral"
                    title="Fechar menu"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-2 px-2 mt-2 md:mt-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg shrink-0 flex items-center justify-center">
                        <Database className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg tracking-tight truncate">Gerador de Qr Code</span>
                </div>

                <nav className="flex-1 space-y-1">
                    <Link href="/dashboard" onClick={closeMobileMenu}>
                        <NavItem
                            icon={<LayoutDashboard className="w-4 h-4" />}
                            label="Geral"
                            active={pathname === "/dashboard"}
                        />
                    </Link>
                    <Link href="/dashboard/analytics" onClick={closeMobileMenu}>
                        <NavItem
                            icon={<BarChart3 className="w-4 h-4" />}
                            label="Analytics"
                            active={pathname === "/dashboard/analytics"}
                        />
                    </Link>
                    <Link href="/dashboard/billing" onClick={closeMobileMenu}>
                        <NavItem
                            icon={<CreditCard className="w-4 h-4" />}
                            label="Assinatura"
                            active={pathname === "/dashboard/billing"}
                        />
                    </Link>
                    <Link href="/dashboard/settings" onClick={closeMobileMenu}>
                        <NavItem
                            icon={<Settings className="w-4 h-4" />}
                            label="Configurações"
                            active={pathname === "/dashboard/settings"}
                        />
                    </Link>
                </nav>

                <div className="pt-6 border-t border-white/5">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all w-full text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-0 w-full overflow-auto">
                <header className="h-20 border-b border-white/5 px-6 md:px-10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <button 
                            className="md:hidden text-white"
                            onClick={() => setIsMobileMenuOpen(true)}
                            aria-label="Abrir menu lateral"
                            title="Abrir menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold capitalize truncate">
                            {pageTitle === "dashboard" ? "Geral" : pageTitle === "billing" ? "Assinatura" : pageTitle}
                        </h2>
                    </div>
                    
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden md:inline">Novo QR Code</span>
                        <span className="md:hidden">Criar</span>
                    </button>
                </header>

                <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Novo QR Code"
            >
                <div className="p-4">
                    <PublicGenerator hideStyles={true} />
                </div>
            </Modal>
        </div>
    )
}

function NavItem({ icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-sm font-medium",
                active ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
        >
            {icon}
            <span className="truncate">{label}</span>
        </button>
    )
}
