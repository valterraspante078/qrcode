"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, LayoutDashboard, Database, CreditCard, Plus, ArrowUpRight, BarChart3, Settings } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/ui/Modal"
import { PublicGenerator } from "@/components/PublicGenerator"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const supabase = createClient()
    const router = useRouter()
    const pathname = usePathname()
    const pageTitle = pathname.split("/").pop() || "Geral"

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/")
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-[#070707] flex text-white">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 flex flex-col p-6 space-y-8 sticky top-0 h-screen">
                <div className="flex items-center gap-2 px-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">QR Fortuna</span>
                </div>

                <nav className="flex-1 space-y-1">
                    <Link href="/dashboard">
                        <NavItem
                            icon={<LayoutDashboard className="w-4 h-4" />}
                            label="Geral"
                            active={pathname === "/dashboard"}
                        />
                    </Link>
                    <Link href="/dashboard/analytics">
                        <NavItem
                            icon={<BarChart3 className="w-4 h-4" />}
                            label="Analytics"
                            active={pathname === "/dashboard/analytics"}
                        />
                    </Link>
                    <Link href="/dashboard/billing">
                        <NavItem
                            icon={<CreditCard className="w-4 h-4" />}
                            label="Assinatura"
                            active={pathname === "/dashboard/billing"}
                        />
                    </Link>
                    <Link href="/dashboard/settings">
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
            <main className="flex-1 flex flex-col min-h-0 overflow-auto">
                <header className="h-20 border-b border-white/5 px-10 flex items-center justify-between">
                    <h2 className="text-xl font-bold capitalize">{pageTitle === "dashboard" ? "Geral" : pageTitle === "billing" ? "Assinatura" : pageTitle}</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Novo QR Code
                    </button>
                </header>

                <div className="p-10 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Novo QR Code de Elite"
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
            {label}
        </button>
    )
}
