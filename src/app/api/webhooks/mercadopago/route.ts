import { NextResponse } from "next/server";
import { mpClient } from "@/lib/mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";
import { readJsonObject } from "@/lib/server/security";
import { getQrExpirationDate, isUuid } from "@/lib/validation";
import { InvalidWebhookSignatureError, Payment, PreApproval, WebhookSignatureValidator } from "mercadopago";

export const dynamic = "force-dynamic";

type WebhookBody = {
    type?: unknown;
    action?: unknown;
    data?: { id?: unknown };
    id?: unknown;
};

function normalizeString(value: unknown) {
    if (typeof value === "string") return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    return "";
}

function getWebhookDataId(req: Request, body: WebhookBody) {
    const queryDataId = new URL(req.url).searchParams.get("data.id");
    return normalizeString(queryDataId) || normalizeString(body.data?.id) || normalizeString(body.id);
}

function validateWebhookSignature(req: Request, dataId: string) {
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (!secret) return;

    WebhookSignatureValidator.validate({
        xSignature: req.headers.get("x-signature"),
        xRequestId: req.headers.get("x-request-id"),
        dataId,
        secret,
        toleranceSeconds: 300,
    });
}

async function markUserAsPro(supabaseAdmin: ReturnType<typeof createAdminClient>, userId: string, subscriptionId?: string) {
    await supabaseAdmin
        .from("profiles")
        .update({
            ...(subscriptionId ? { mp_subscription_id: subscriptionId } : {}),
            subscription_status: "active",
            subscription_tier: "pro",
        })
        .eq("id", userId);

    await supabaseAdmin
        .from("qr_codes")
        .update({ is_active: true, expires_at: null })
        .eq("user_id", userId);
}

async function markSubscriptionAsInactive(supabaseAdmin: ReturnType<typeof createAdminClient>, subscriptionId: string) {
    const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("mp_subscription_id", subscriptionId);

    await supabaseAdmin
        .from("profiles")
        .update({ subscription_status: "inactive", subscription_tier: "free" })
        .eq("mp_subscription_id", subscriptionId);

    await Promise.all((profiles ?? []).map((profile) =>
        supabaseAdmin
            .from("qr_codes")
            .update({ expires_at: getQrExpirationDate() })
            .eq("user_id", profile.id)
    ));
}

async function recordAffiliateCommission(
    supabaseAdmin: ReturnType<typeof createAdminClient>,
    userId: string,
    amount: number | undefined
) {
    if (!amount || amount <= 0) return;

    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("referred_by")
        .eq("id", userId)
        .single();

    if (!isUuid(profile?.referred_by)) return;

    await supabaseAdmin.from("commissions").insert({
        affiliate_id: profile.referred_by,
        buyer_id: userId,
        amount: amount * 0.40,
        status: "pending",
    });
}

export async function POST(req: Request) {
    const supabaseAdmin = createAdminClient();

    if (!mpClient) {
        return NextResponse.json({ error: "Mercado Pago não configurado" }, { status: 500 });
    }

    try {
        const body = await readJsonObject(req) as WebhookBody | null;
        if (!body) {
            return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
        }

        const eventType = normalizeString(body.type) || normalizeString(body.action);
        const dataId = getWebhookDataId(req, body);

        if (!dataId) {
            return NextResponse.json({ received: true }); // Ignora notificações sem ID
        }

        validateWebhookSignature(req, dataId);

        // --- CASO 1: ASSINATURA RECORRENTE ---
        if (eventType.includes("subscription_preapproval") || eventType.includes("preapproval")) {
            const preapproval = new PreApproval(mpClient);
            const subscription = await preapproval.get({ id: dataId });

            const userId = subscription.external_reference;
            const status = subscription.status;

            if (!isUuid(userId)) {
                return NextResponse.json({ error: "external_reference ausente ou inválido" }, { status: 400 });
            }

            if (status === "authorized") {
                await markUserAsPro(supabaseAdmin, userId, dataId);
                await recordAffiliateCommission(supabaseAdmin, userId, subscription.auto_recurring?.transaction_amount);
            } else if (status === "cancelled" || status === "paused") {
                await markSubscriptionAsInactive(supabaseAdmin, dataId);
            }
        }

        // --- CASO 2: PAGAMENTO ÚNICO (PREFERENCE/PIX/TESTE) ---
        if (eventType === "payment" || eventType.startsWith("payment.")) {
            const payment = new Payment(mpClient);
            const paymentData = await payment.get({ id: dataId });

            const userId = paymentData.external_reference;
            const status = paymentData.status;

            if (isUuid(userId) && status === "approved") {
                await markUserAsPro(supabaseAdmin, userId);
                await recordAffiliateCommission(supabaseAdmin, userId, paymentData.transaction_amount);
            }
        }

        return NextResponse.json({ received: true });
    } catch (err: unknown) {
        if (err instanceof InvalidWebhookSignatureError) {
            console.warn("Webhook MP signature rejected:", err.reason);
            return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
        }

        console.error("Webhook MP error:", err);
        return NextResponse.json({ error: "Não foi possível processar o webhook" }, { status: 400 });
    }
}
