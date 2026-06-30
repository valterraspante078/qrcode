import { mpClient } from "@/lib/mercadopago";
import { PreApproval } from "mercadopago";
import { createClient } from "@/lib/supabase/server";
import { isTrustedOriginRequest } from "@/lib/server/security";
import { getQrExpirationDate } from "@/lib/validation";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    if (!isTrustedOriginRequest(req)) {
        return NextResponse.json({ error: "Origem da requisição não permitida" }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!mpClient) {
        return NextResponse.json({ error: "Mercado Pago não configurado" }, { status: 500 });
    }

    try {
        // Buscar o perfil do usuário
        const { data: profile } = await supabase
            .from("profiles")
            .select("mp_subscription_id, subscription_status")
            .eq("id", user.id)
            .single();

        // Se o usuário não é PRO e nem tem assinatura, não há o que cancelar
        if (profile?.subscription_status !== "active" && !profile?.mp_subscription_id) {
            return NextResponse.json(
                { error: "Nenhuma assinatura ativa encontrada para este usuário" },
                { status: 400 }
            );
        }

        // Se houver um ID de assinatura do Mercado Pago, tentamos cancelar lá
        if (profile?.mp_subscription_id) {
            try {
                const preapproval = new PreApproval(mpClient);
                await preapproval.update({
                    id: profile.mp_subscription_id,
                    body: { status: "cancelled" },
                });
            } catch (mpError) {
                console.error("Erro ao cancelar no Mercado Pago:", mpError);
                // Mesmo que o MP falhe (ex: já estava cancelada ou foi compra avulsa via preference hack), continuamos e downgradeamos no DB
            }
        }

        // Atualizar perfil localmente (downgrade para FREE)
        const { error: profileError } = await supabase
            .from("profiles")
            .update({
                subscription_status: "inactive",
                subscription_tier: "free",
                mp_subscription_id: null,
            })
            .eq("id", user.id);

        if (profileError) throw profileError;

        const { error: qrError } = await supabase
            .from("qr_codes")
            .update({ expires_at: getQrExpirationDate() })
            .eq("user_id", user.id);

        if (qrError) throw qrError;

        return NextResponse.json({ success: true, message: "Assinatura cancelada com sucesso" });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
