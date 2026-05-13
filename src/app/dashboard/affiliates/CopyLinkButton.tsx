"use client"
import { useState } from "react"
import { Copy } from "lucide-react"

export function CopyLinkButton({ link }: { link: string }) {
    const [copied, setCopied] = useState(false)
    
    return (
        <button 
            type="button"
            onClick={async () => {
                await navigator.clipboard.writeText(link);
                setCopied(true);
                setTimeout(() => { setCopied(false) }, 2000);
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shrink-0"
        >
            <Copy className="w-4 h-4" />
            {copied ? "Copiado!" : "Copiar"}
        </button>
    )
}
