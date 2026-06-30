import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isTrustedOriginRequest, readJsonObject } from "@/lib/server/security";
import { getQrExpirationDate, normalizeQrName, parseHttpUrl } from "@/lib/validation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    if (!isTrustedOriginRequest(request)) {
        return NextResponse.json({ error: "Origem da requisição não permitida" }, { status: 403 });
    }

    const supabase = await createClient();
    const body = await readJsonObject(request);
    if (!body) {
        return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    const content = parseHttpUrl(body.content);
    if (!content) {
        return NextResponse.json({ error: "Informe uma URL válida começando com http:// ou https://" }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();

    let isPro = false;
    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("subscription_status, subscription_tier")
            .eq("id", user.id)
            .maybeSingle();

        isPro = profile?.subscription_status === "active" && profile?.subscription_tier === "pro";
    }

    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
        .from("qr_codes")
        .insert({
            content,
            name: normalizeQrName(body.name, user ? "QR Dashboard" : "QR Público"),
            user_id: user?.id || null,
            expires_at: isPro ? null : getQrExpirationDate(),
            is_active: true,
        })
        .select()
        .single();

    if (error) {
        console.error("QR create error:", error);
        return NextResponse.json({ error: "Não foi possível criar o QR Code" }, { status: 500 });
    }

    return NextResponse.json(data);
}
