import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { mpClient } from "@/lib/mercadopago";
import { PreApproval } from "mercadopago";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (!mpClient) {
        return NextResponse.json({ error: "Mercado Pago não configurado" }, { status: 500 });
    }

    try {
        const body = await req.json();
        console.log("Mercado Pago Webhook Received:", JSON.stringify(body, null, 2));

        // Mercado Pago envia notificações com type e data.id
        const { type, data } = body;

        if (type === "subscription_preapproval") {
            const preapproval = new PreApproval(mpClient);
            const subscription = await preapproval.get({ id: data.id });

            const userId = subscription.external_reference;
            const status = subscription.status;

            if (!userId) {
                return NextResponse.json({ error: "external_reference ausente" }, { status: 400 });
            }

            if (status === "authorized") {
                // Assinatura ativada — upgrade para PRO
                await supabaseAdmin
                    .from("profiles")
                    .update({
                        mp_subscription_id: data.id,
                        subscription_status: "active",
                        subscription_tier: "pro",
                    })
                    .eq("id", userId);

                // Reativar todos os QR Codes do usuário
                await supabaseAdmin
                    .from("qr_codes")
                    .update({ is_active: true })
                    .eq("user_id", userId);

                // --- SISTEMA DE AFILIADOS / COMISSÃO ---
                const { data: profile } = await supabaseAdmin
                    .from("profiles")
                    .select("referred_by")
                    .eq("id", userId)
                    .single();

                if (profile?.referred_by && subscription.auto_recurring?.transaction_amount) {
                    // 40% de comissão
                    const commissionAmount = subscription.auto_recurring.transaction_amount * 0.40;

                    // Registra comissão
                    await supabaseAdmin
                        .from("commissions")
                        .insert({
                            affiliate_id: profile.referred_by,
                            buyer_id: userId,
                            amount: commissionAmount,
                            status: "pending"
                        });
                }

            } else if (status === "cancelled" || status === "paused") {
                // Assinatura cancelada ou pausada — downgrade para FREE
                await supabaseAdmin
                    .from("profiles")
                    .update({
                        subscription_status: "inactive",
                        subscription_tier: "free",
                    })
                    .eq("mp_subscription_id", data.id);
            }
        }

        return NextResponse.json({ received: true });
    } catch (err: unknown) {
        console.error("Webhook MP error:", err);
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
