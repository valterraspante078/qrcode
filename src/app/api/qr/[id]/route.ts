import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { name, expires_at } = await request.json()
    const supabase = await createClient()

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (expires_at !== undefined) updateData.expires_at = expires_at

    const { error } = await supabase
        .from("qr_codes")
        .update(updateData)
        .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
        .from("qr_codes")
        .delete()
        .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
