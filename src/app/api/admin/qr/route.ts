import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { isTrustedOriginRequest, readJsonObject } from "@/lib/server/security";
import { getQrExpirationDate, isUuid } from "@/lib/validation";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'registered' or 'public'

    try {
        const supabase = createAdminClient();
        
        let query = supabase
            .from("qr_codes")
            .select(`
                *,
                profiles!qr_codes_user_id_fkey(display_name, email),
                scans(count)
            `)
            .order("created_at", { ascending: false });

        if (type === "public") {
            query = query.is("user_id", null);
        } else if (type === "registered") {
            query = query.not("user_id", "is", null);
        }

        const { data: qrs, error } = await query;

        if (error) throw error;

        return NextResponse.json(qrs);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isTrustedOriginRequest(req)) {
        return NextResponse.json({ error: "Origem da requisição não permitida" }, { status: 403 });
    }

    const body = await readJsonObject(req);
    if (!body || !isUuid(body.id)) {
        return NextResponse.json({ error: "QR Code inválido" }, { status: 400 });
    }

    const action = typeof body.action === "string" ? body.action : "";
    const expiresAt = typeof body.expiresAt === "string" ? body.expiresAt : "";
    const supabase = createAdminClient();

    try {
        const updateData: { expires_at?: string | null; is_active?: boolean } = {};

        if (action === "extend") {
            updateData.expires_at = getQrExpirationDate();
            updateData.is_active = true;
        } else if (action === "toggle") {
            if (expiresAt === "deactivate") {
                updateData.expires_at = new Date().toISOString();
                updateData.is_active = false;
            } else if (expiresAt === "activate") {
                updateData.expires_at = null;
                updateData.is_active = true;
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
        }

        const { error } = await supabase
            .from("qr_codes")
            .update(updateData)
            .eq("id", body.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
