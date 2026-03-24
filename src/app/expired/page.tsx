import { createClient } from "@/lib/supabase/server";
import { Zap, AlertCircle, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function ExpiredPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>;
}) {
    const { id } = await searchParams;
    let qrName = "";

    if (id) {
        const supabase = await createClient();
        const { data } = await supabase
            .from("qr_codes")
            .select("name")
            .eq("id", id)
            .single();
        if (data) qrName = data.name;
    }

    return (
        <main className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-blue-600/20 blur-[120px] rounded-full -z-10" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full -z-10" />

            <div className="w-full max-w-lg">
                {/* Logo Section */}
                <div className="flex items-center justify-center gap-2 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Zap className="text-white w-6 h-6 fill-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">QR Fortuna</span>
                </div>

                {/* Main Card */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                    <div className="relative bg-[#0b0f1a]/80 backdrop-blur-xl border border-white/10 p-10 md:p-12 rounded-[2.5rem] flex flex-col items-center text-center shadow-2xl">
                        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>

                        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
                            Este QR Code <span className="text-red-500">Expirou</span>
                        </h1>

                        <p className="text-gray-400 text-lg leading-relaxed mb-10">
                            {qrName ? (
                                <>O QR Code <strong className="text-white">"{qrName}"</strong> pertence a uma conta <span className="text-blue-400 font-bold uppercase tracking-wider text-sm">Free</span> e atingiu o limite de tempo.</>
                            ) : (
                                <>Este QR Code pertence a uma conta <span className="text-blue-400 font-bold uppercase tracking-wider text-sm">Free</span> e atingiu o limite de tempo.</>
                            )}
                            <br /><br />
                            Para renovar este QR Code e mantê-lo ativo permanentemente, faça o upgrade para o plano <strong className="text-white">Pro</strong> agora mesmo.
                        </p>

                        <div className="w-full space-y-4">
                            <Link
                                href="/#pricing"
                                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                            >
                                Fazer Upgrade para Pro
                                <ChevronRight className="w-5 h-5" />
                            </Link>

                            <Link
                                href="/"
                                className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 text-gray-300 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all border border-white/5"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Voltar ao Início
                            </Link>
                        </div>
                    </div>
                </div>

                <p className="mt-12 text-center text-gray-500 text-sm">
                    © 2026 QR Code da Fortuna. Gerencie seus links com inteligência.
                </p>
            </div>
        </main>
    );
}
