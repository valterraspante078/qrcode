import { createClient } from "@/lib/supabase/server"
import { isTrustedOriginRequest, readJsonObject } from "@/lib/server/security"
import { QR_EXPIRATION_DAYS, isUuid, normalizeOptionalText, parseOptionalIsoDate } from "@/lib/validation"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    if (!isUuid(id)) {
        return NextResponse.json({ error: "QR Code inválido" }, { status: 400 })
    }

    if (!isTrustedOriginRequest(request)) {
        return NextResponse.json({ error: "Origem da requisição não permitida" }, { status: 403 })
    }

    const body = await readJsonObject(request)
    if (!body) {
        return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const updateData: { name?: string; expires_at?: string | null; is_active?: boolean } = {}
    let isPro = false

    if (body.name !== undefined) {
        const name = normalizeOptionalText(body.name, 100)
        if (!name) {
            return NextResponse.json({ error: "Nome inválido" }, { status: 400 })
        }
        updateData.name = name
    }

    if (body.expires_at !== undefined) {
        const expiresAt = parseOptionalIsoDate(body.expires_at)
        if (expiresAt === undefined) {
            return NextResponse.json({ error: "Data de expiração inválida" }, { status: 400 })
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("subscription_status, subscription_tier")
            .eq("id", user.id)
            .maybeSingle()

        isPro = profile?.subscription_status === "active" && profile?.subscription_tier === "pro"

        if (expiresAt === null) {
            if (!isPro) {
                return NextResponse.json({ error: "Plano Pro necessário para reativação permanente" }, { status: 403 })
            }
        } else if (!isPro) {
            const maxFreeExpiration = new Date()
            maxFreeExpiration.setDate(maxFreeExpiration.getDate() + QR_EXPIRATION_DAYS)

            if (new Date(expiresAt) > maxFreeExpiration) {
                return NextResponse.json({ error: "Plano Pro necessário para expiração acima de 14 dias" }, { status: 403 })
            }
        }

        updateData.expires_at = expiresAt
        updateData.is_active = expiresAt === null || new Date(expiresAt) > new Date()
    }

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: "Nenhum campo válido para atualizar" }, { status: 400 })
    }

    const { data, error } = await supabase
        .from("qr_codes")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle()

    if (error) {
        console.error("QR update error:", error)
        return NextResponse.json({ error: "Não foi possível atualizar o QR Code" }, { status: 500 })
    }
    if (!data) return NextResponse.json({ error: "QR Code não encontrado" }, { status: 404 })

    return NextResponse.json({ success: true })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    if (!isUuid(id)) {
        return NextResponse.json({ error: "QR Code inválido" }, { status: 400 })
    }

    if (!isTrustedOriginRequest(request)) {
        return NextResponse.json({ error: "Origem da requisição não permitida" }, { status: 403 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { data, error } = await supabase
        .from("qr_codes")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle()

    if (error) {
        console.error("QR delete error:", error)
        return NextResponse.json({ error: "Não foi possível excluir o QR Code" }, { status: 500 })
    }
    if (!data) return NextResponse.json({ error: "QR Code não encontrado" }, { status: 404 })

    return NextResponse.json({ success: true })
}
