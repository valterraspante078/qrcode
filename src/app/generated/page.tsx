"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react"
import { Download, Copy, Check, ArrowLeft, Sparkles, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"

interface QRData {
  qrId: string
  publicUrl: string
  content: string
  name: string
}

export default function GeneratedPage() {
  const router = useRouter()
  const [qrData, setQrData] = useState<QRData | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const qrRef = useRef<SVGSVGElement>(null)
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem("generatedQR")
    if (!raw) {
      router.replace("/")
      return
    }
    try {
      const data: QRData = JSON.parse(raw)
      if (!data.qrId || !data.publicUrl) {
        router.replace("/")
        return
      }
      setQrData(data)
      setMounted(true)
    } catch {
      router.replace("/")
    }
  }, [router])

  const copyToClipboard = async () => {
    if (!qrData) return
    try {
      await navigator.clipboard.writeText(qrData.publicUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error("Erro ao copiar", err)
    }
  }

  const downloadQR = (format: "png" | "svg" = "png") => {
    if (!qrData) return
    if (format === "svg") {
      if (!qrRef.current) return
      const svgData = new XMLSerializer().serializeToString(qrRef.current)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const url = URL.createObjectURL(svgBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `gerador-qrcode-${qrData.qrId}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else {
      if (!qrCanvasRef.current) return
      const url = qrCanvasRef.current.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = url
      link.download = `gerador-qrcode-${qrData.qrId}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleNewQR = () => {
    sessionStorage.removeItem("generatedQR")
    router.push("/")
  }

  if (!mounted || !qrData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/8 blur-[150px] rounded-full -z-10" />

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Zap className="text-white w-5 h-5 fill-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Gerador de Qr Code</span>
        </Link>
      </nav>

      {/* Success card */}
      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Success badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold">
            <Check className="w-4 h-4" />
            QR Code criado com sucesso!
          </div>
        </div>

        {/* Card */}
        <div className="p-8 md:p-10 rounded-3xl bg-card/60 backdrop-blur-xl border border-white/5 shadow-2xl shadow-blue-500/5 space-y-8">
          {/* QR Code display */}
          <div className="flex flex-col items-center gap-6">
            <div className="bg-white p-5 rounded-2xl shadow-xl">
              <QRCodeSVG
                ref={qrRef}
                value={qrData.publicUrl}
                size={200}
                level="H"
                includeMargin={false}
              />
              <div className="hidden">
                <QRCodeCanvas
                  ref={qrCanvasRef}
                  value={qrData.publicUrl}
                  size={1024}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>

            {qrData.name && (
              <p className="text-sm font-medium text-muted-foreground">
                {qrData.name}
              </p>
            )}
          </div>

          {/* Permanent link */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-blue-400">
              Link Permanente
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={qrData.publicUrl}
                title="Link Permanente"
                placeholder="Link Permanente"
                aria-label="Link Permanente gerado do QR Code"
                className="flex-1 h-11 px-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-sm text-blue-300 outline-none font-mono"
              />
              <button
                onClick={copyToClipboard}
                aria-label="Copiar link permanente"
                className="px-4 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all flex items-center justify-center"
              >
                {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
              </button>
            </div>
          </div>

          {/* Destination URL */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Destino
            </label>
            <p className="text-sm text-muted-foreground truncate">
              {qrData.content}
            </p>
          </div>

          {/* Download buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => downloadQR("png")}
              className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Baixar PNG
            </button>
            <button
              onClick={() => downloadQR("svg")}
              className="px-5 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-muted-foreground hover:text-white transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center"
            >
              SVG
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-white/5" />

          {/* New QR button */}
          <button
            onClick={handleNewQR}
            className="w-full h-12 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium flex items-center justify-center gap-2 transition-colors text-muted-foreground hover:text-white"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            Gerar Novo QR Code
          </button>
        </div>

        {/* Upsell CTA for Account Creation */}
        <div className="mt-6 p-6 md:p-8 rounded-3xl bg-blue-600/10 border border-blue-500/30 text-center space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Não deixe seu QR Code expirar!
            </h3>
            <p className="text-sm text-blue-100/70 max-w-sm mx-auto">
              Seu QR Code público expira em 14 dias. Crie uma conta agora para acompanhar estatísticas de acesso e ter a opção de mantê-lo ativo permanentemente.
            </p>
          </div>
          <Link
            href="/login?mode=signup"
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
          >
            Criar Conta e Acompanhar QR
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </main>
  )
}
