import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { Shield, LayoutDashboard, Users, QrCode, Globe, LogOut } from "lucide-react";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    if (!(await isAdmin())) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-[#070707] flex text-white font-sans selection:bg-blue-500/30">
            {/* Admin Sidebar */}
            <aside className="w-72 border-r border-white/5 flex flex-col p-8 space-y-10 sticky top-0 h-screen bg-[#0a0a0a]">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-sm tracking-tighter uppercase">Painel Admin</span>
                        <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase opacity-50">Fortuna v1.0</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 px-4 mb-4">Gerenciamento</p>
                    <AdminNavItem href="/admin" icon={<LayoutDashboard className="w-4 h-4" />} label="Visão Geral" />
                    <AdminNavItem href="/dashboard" icon={<LogOut className="w-4 h-4" />} label="Sair para App" />
                </nav>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 space-y-3">
                    <Shield className="w-5 h-5 text-red-500" />
                    <p className="text-[10px] font-bold text-red-200/60 leading-relaxed uppercase tracking-tight">
                        Você está no modo de acesso restrito com privilégios de ROOT.
                    </p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-0 overflow-auto bg-[#070707]">
                <header className="h-24 border-b border-white/5 px-12 flex items-center justify-between backdrop-blur-md bg-black/20 sticky top-0 z-50">
                    <div>
                        <h1 className="text-2xl font-black italic tracking-tighter uppercase">Administração Central</h1>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Controle total dos códigos e impérios</p>
                    </div>
                </header>

                <div className="p-12 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {children}
                </div>
            </main>
        </div>
    );
}

function AdminNavItem({ href, icon, label }: { href: string; icon: any; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all w-full text-sm font-bold text-muted-foreground hover:text-white hover:bg-white/5 group border border-transparent hover:border-white/5"
        >
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-red-600/10 group-hover:text-red-500 transition-all">
                {icon}
            </div>
            {label}
        </Link>
    );
}
