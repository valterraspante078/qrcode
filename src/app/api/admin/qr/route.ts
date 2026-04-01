import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
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
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, action, expiresAt } = await req.json();
    const supabase = createAdminClient();

    try {
        let updateData: any = {};

        if (action === "extend") {
            // Extend 14 days from now or from current expiration?
            // Usually from now is safer for "manual extension"
            const newExpiry = new Date();
            newExpiry.setDate(newExpiry.getDate() + 14);
            updateData.expires_at = newExpiry.toISOString();
        } else if (action === "toggle") {
            // If we have expiresAt, we can toggle it
            // Logic: if expiresAt is in the past or exists, we set it to null (infinite) or...
            // Actually the user wants to "desativar, ativar ou estender".
            // "Ativar" = set expires_at to null (or far future). 
            // "Desativar" = set expires_at to now.
            if (expiresAt === "deactivate") {
                updateData.expires_at = new Date().toISOString();
            } else if (expiresAt === "activate") {
                updateData.expires_at = null;
            }
        }

        const { error } = await supabase
            .from("qr_codes")
            .update(updateData)
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
