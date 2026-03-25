"use client"

import { useState, useRef, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Download, Copy, Check, Sparkles, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function PublicGenerator({ hideStyles = false }: { hideStyles?: boolean }) {
    const [content, setContent] = useState("https://seusite.com")
    const [name, setName] = useState("")
    const [isCopied, setIsCopied] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [qrId, setQrId] = useState<string | null>(null)
    const qrRef = useRef<SVGSVGElement>(null)
    const router = useRouter()

    const saveToDb = async () => {
        if (qrId || isSaving) return qrId
        setIsSaving(true)
        try {
            const res = await fetch("/api/qr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, name: name || (hideStyles ? "QR Dashboard" : "QR Público") })
            })
            const data = await res.json()
            if (data.id) {
                setQrId(data.id)
                router.refresh()
                // Alert success or some visual cue
                return data.id
            }
        } catch (err) {
            console.error("Erro ao salvar", err)
        } finally {
            setIsSaving(false)
        }
    }

    const downloadQR = async () => {
        let currentId = qrId
        if (!currentId) {
            currentId = await saveToDb()
        }

        if (!qrRef.current) return

        // Wait a bit for the SVG to update with the new URL value before capturing
        setTimeout(() => {
            if (!qrRef.current) return
            const svgData = new XMLSerializer().serializeToString(qrRef.current)
            const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
            const url = URL.createObjectURL(svgBlob)
            const link = document.createElement("a")
            link.href = url
            link.download = `gerador-qrcode-${currentId || Date.now()}.svg`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }, 150)
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error("Erro ao copiar", err)
        }
    }

    const publicUrl = qrId ? `${typeof window !== "undefined" ? window.location.origin : ""}/q/${qrId}` : ""

    return (
        <div className={cn(
            "w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center",
            !hideStyles && "p-6 bg-card/50 backdrop-blur-xl border border-white/5 rounded-3xl animate-glow"
        )}>
            <div className="space-y-6">
                <div>
                    <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <Sparkles className="text-blue-400 w-5 h-5" />
                        Crie seu QR Code agora
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Insira o link ou texto abaixo para gerar seu QR code permanente.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nome do QR (Opcional)</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-background/50 border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-muted-foreground/50"
                            placeholder="Ex: Minha Loja, Bio Instagram"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Destino do QR</label>
                        <input
                            type="text"
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value)
                                setQrId(null)
                            }}
                            className="w-full h-12 px-4 rounded-xl bg-background/50 border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-muted-foreground/50"
                            placeholder="https://exemplo.com.br"
                        />
                    </div>

                    {qrId && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs font-medium uppercase tracking-wider text-blue-400">Seu Link Permanente</label>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={publicUrl}
                                    className="flex-1 h-10 px-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs text-blue-300 outline-none"
                                />
                                <button
                                    onClick={() => copyToClipboard(publicUrl)}
                                    className="px-3 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                                >
                                    {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {qrId && (
                        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold text-center animate-bounce">
                            ✓ QR Code salvo e sincronizado com seu Dashboard!
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            onClick={downloadQR}
                            disabled={isSaving}
                            className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {qrId ? "Baixar Novamente" : "Gerar e Baixar SVG"}
                        </button>
                        {!qrId && (
                            <button
                                onClick={saveToDb}
                                disabled={isSaving}
                                className="px-4 h-12 rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                                {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-blue-400" />}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-2xl border border-dashed border-white/10 aspect-square">
                <div className="bg-white p-6 rounded-2xl shadow-2xl relative group">
                    <QRCodeSVG
                        ref={qrRef}
                        value={qrId ? publicUrl : content}
                        size={240}
                        level="H"
                        includeMargin={false}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                        <RefreshCw className="text-white w-8 h-8 animate-spin-slow" />
                    </div>
                </div>
                <p className="mt-6 text-xs text-muted-foreground uppercase tracking-[0.2em]">Preview em tempo real</p>
            </div>
        </div>
    )
}
