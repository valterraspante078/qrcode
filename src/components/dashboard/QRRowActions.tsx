"use client"

import { useState, useRef } from "react"
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react"
import { Download, ExternalLink, Trash2, Eye, EyeOff, Loader2, Image as ImageIcon, Clock, Play } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { isAfter, parseISO } from "date-fns"

interface QRRowActionsProps {
    id: string
    content: string
    name: string
    publicUrl: string
    expiresAt?: string | null
    isPro?: boolean
}

export function QRRowActions({ id, content, name, publicUrl, expiresAt, isPro }: QRRowActionsProps) {
    const [showPreview, setShowPreview] = useState(false)
    const [showDownloadMenu, setShowDownloadMenu] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isExpiring, setIsExpiring] = useState(false)
    const qrSvgRef = useRef<SVGSVGElement>(null)
    const qrCanvasRef = useRef<HTMLCanvasElement>(null)
    const router = useRouter()

    const isActive = !expiresAt || isAfter(parseISO(expiresAt), new Date())

    const downloadSVG = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!qrSvgRef.current) return

        const svgData = new XMLSerializer().serializeToString(qrSvgRef.current)
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
        const url = URL.createObjectURL(svgBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `qr-${name.toLowerCase().replace(/\s+/g, "-") || id}.svg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setShowDownloadMenu(false)
    }

    const downloadPNG = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!qrCanvasRef.current) return

        const url = qrCanvasRef.current.toDataURL("image/png")
        const link = document.createElement("a")
        link.href = url
        link.download = `qr-${name.toLowerCase().replace(/\s+/g, "-") || id}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setShowDownloadMenu(false)
    }

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm("Tem certeza que deseja excluir este QR Code?")) return

        setIsDeleting(true)
        try {
            const res = await fetch(`/api/qr/${id}`, {
                method: "DELETE",
            })
            if (res.ok) {
                router.refresh()
            }
        } catch (err) {
            console.error("Erro ao excluir", err)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleToggleExpiration = async (e: React.MouseEvent) => {
        e.stopPropagation()
        const action = isActive ? "expirar" : "reativar"
        if (!confirm(`Tem certeza que deseja ${action} este QR Code?`)) return

        setIsExpiring(true)
        try {
            const newExpiresAt = isActive ? new Date().toISOString() : null
            const res = await fetch(`/api/qr/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ expires_at: newExpiresAt }),
            })
            if (res.ok) {
                router.refresh()
            }
        } catch (err) {
            console.error(`Erro ao ${action}`, err)
        } finally {
            setIsExpiring(false)
        }
    }

    return (
        <div className="flex justify-end gap-3 relative items-center">
            {/* Hidden QR for Captures */}
            <div className="hidden">
                <QRCodeSVG
                    ref={qrSvgRef}
                    value={publicUrl}
                    size={512}
                    level="H"
                />
                <QRCodeCanvas
                    ref={qrCanvasRef}
                    value={publicUrl}
                    size={1024}
                    level="H"
                />
            </div>

            {/* Preview Popover */}
            {showPreview && (
                <div className="absolute bottom-full right-0 mb-4 z-50 animate-in zoom-in-95 fade-in duration-200">
                    <div className="p-4 bg-white rounded-2xl shadow-2xl border border-white/10 flex flex-col items-center gap-3">
                        <div className="bg-white p-2 rounded-lg">
                            <QRCodeSVG
                                value={publicUrl}
                                size={160}
                                level="M"
                            />
                        </div>
                        <p className="text-[10px] text-black font-black uppercase tracking-widest opacity-50">Preview Real</p>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full right-6 w-3 h-3 bg-white rotate-45 -translate-y-1.5 shadow-xl" />
                </div>
            )}

            {/* Action Group with Titles */}
            <div className="flex items-center gap-2">
                {/* PREVIEW */}
                <div className="flex flex-col items-center gap-1 group/item">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/0 group-hover/item:text-muted-foreground/60 transition-all">Preview</span>
                    <button
                        onClick={() => {
                            setShowPreview(!showPreview)
                            setShowDownloadMenu(false)
                        }}
                        className={cn(
                            "p-3 rounded-xl transition-all shadow-lg active:scale-90 outline-none border",
                            showPreview
                                ? "bg-blue-600 border-blue-400 text-white"
                                : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10 hover:border-white/10"
                        )}
                    >
                        {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                {/* DOWNLOAD WITH MENU */}
                <div className="flex flex-col items-center gap-1 group/item relative">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/0 group-hover/item:text-muted-foreground/60 transition-all">Download</span>
                    <button
                        onClick={() => {
                            setShowDownloadMenu(!showDownloadMenu)
                            setShowPreview(false)
                        }}
                        className={cn(
                            "p-3 rounded-xl transition-all shadow-lg active:scale-90 outline-none border",
                            showDownloadMenu
                                ? "bg-green-600 border-green-400 text-white"
                                : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10 hover:border-white/10"
                        )}
                    >
                        <Download className="w-4 h-4" />
                    </button>

                    {/* Expandable Download Menu */}
                    {showDownloadMenu && (
                        <div className="absolute top-full right-0 mt-2 z-50 w-32 animate-in slide-in-from-top-2 fade-in duration-200">
                            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 shadow-2xl overflow-hidden p-1">
                                <button
                                    onClick={downloadSVG}
                                    className="w-full h-10 px-3 flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <div className="w-6 h-6 rounded-md bg-green-500/20 text-green-500 flex items-center justify-center text-[8px]">SVG</div>
                                    Vetor (Alta)
                                </button>
                                <button
                                    onClick={downloadPNG}
                                    className="w-full h-10 px-3 flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-500 flex items-center justify-center text-[8px]">PNG</div>
                                    Imagem (HD)
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* VIEW LINK */}
                <div className="flex flex-col items-center gap-1 group/item">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/0 group-hover/item:text-muted-foreground/60 transition-all">Link</span>
                    <a
                        href={publicUrl}
                        target="_blank"
                        className="p-3 bg-white/5 border border-white/5 text-muted-foreground hover:bg-blue-600 hover:border-blue-400 hover:text-white rounded-xl transition-all shadow-lg active:scale-90 outline-none"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>

                {/* EXPIRAR / REATIVAR */}
                <div className="flex flex-col items-center gap-1 group/item">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/0 group-hover/item:text-muted-foreground/60 transition-all">
                        {isActive ? "Expirar" : "Ativar"}
                    </span>
                    <button
                        onClick={handleToggleExpiration}
                        disabled={isExpiring}
                        className={cn(
                            "p-3 rounded-xl transition-all shadow-lg active:scale-90 outline-none border",
                            isActive 
                                ? "bg-white/5 border-white/5 text-muted-foreground hover:bg-orange-600 hover:border-orange-400 hover:text-white"
                                : "bg-orange-600/20 border-orange-500/50 text-orange-400 hover:bg-orange-600 hover:border-orange-400 hover:text-white"
                        )}
                    >
                        {isExpiring ? <Loader2 className="w-4 h-4 animate-spin" /> : isActive ? <Clock className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                </div>

                {/* DELETE */}
                <div className="flex flex-col items-center gap-1 group/item">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/0 group-hover/item:text-red-400/60 transition-all">Excluir</span>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-3 bg-white/5 border border-white/5 text-muted-foreground hover:bg-red-600 hover:border-red-400 hover:text-white rounded-xl transition-all shadow-lg active:scale-90 outline-none disabled:opacity-50"
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    )
}
