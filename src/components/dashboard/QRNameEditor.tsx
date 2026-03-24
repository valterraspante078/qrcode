"use client"
import { useState } from "react"
import { Pencil, Check, X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function QRNameEditor({ id, initialName }: { id: string, initialName: string }) {
    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState(initialName)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSave = async (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation()
        }
        setLoading(true)
        try {
            const res = await fetch(`/api/qr/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            })
            if (res.ok) {
                setIsEditing(false)
                router.refresh()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full max-w-[200px]"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave()
                        if (e.key === 'Escape') {
                            setIsEditing(false)
                            setName(initialName)
                        }
                    }}
                />
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="p-1 rounded bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsEditing(false)
                        setName(initialName)
                    }}
                    className="p-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        )
    }

    return (
        <div
            className="group/name flex items-center gap-2 font-bold text-white hover:text-blue-400 transition-colors uppercase tracking-tighter cursor-pointer"
            onClick={() => setIsEditing(true)}
            title="Clique para editar o nome"
        >
            {name || "QR SEM NOME"}
            <Pencil className="w-3 h-3 text-muted-foreground/50 group-hover/name:text-blue-400 transition-colors" />
        </div>
    )
}
