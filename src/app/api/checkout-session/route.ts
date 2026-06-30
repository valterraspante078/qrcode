import { mpClient } from "@/lib/mercadopago";
import { PreApproval } from "mercadopago";
import { createClient } from "@/lib/supabase/server";
import { getConfiguredSiteOrigin, isTrustedOriginRequest, readJsonObject } from "@/lib/server/security";
import { parseHttpUrl } from "@/lib/validation";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Configuração dos planos oficiais
const PLANS = {
    mensal: {
        reason: "QR Code da Fortuna — Plano Mensal",
        frequency: 1,
        frequencyType: "months",
        amount: 50,
    },
    trimestral: {
        reason: "QR Code da Fortuna — Plano Trimestral",
        frequency: 3,
        frequencyType: "months",
        amount: 75,
    },
    anual: {
        reason: "QR Code da Fortuna — Plano Anual",
        frequency: 12,
        frequencyType: "months",
        amount: 150,
    },
} satisfies Record<string, { reason: string; frequency: number; frequencyType: "months"; amount: number }>;

type PlanType = keyof typeof PLANS;

function isPlanType(value: unknown): value is PlanType {
    return typeof value === "string" && value in PLANS;
}

function getMercadoPagoErrorMessage(err: unknown) {
    if (err instanceof Error && err.message) return err.message;

    if (typeof err === "object" && err !== null) {
        const errorObj = err as {
            message?: unknown;
            response?: { data?: { message?: unknown } };
            cause?: Array<{ description?: unknown }>;
        };

        if (typeof errorObj.message === "string") return errorObj.message;
        if (typeof errorObj.response?.data?.message === "string") return errorObj.response.data.message;
        if (typeof errorObj.cause?.[0]?.description === "string") return errorObj.cause[0].description;
    }

    return "Erro ao processar assinatura";
}

export async function POST(req: Request) {
    if (!isTrustedOriginRequest(req)) {
        return NextResponse.json({ error: "Origem da requisição não permitida" }, { status: 403 });
    }

    const body = await readJsonObject(req);
    if (!body || !isPlanType(body.planType)) {
        return NextResponse.json({ error: "Tipo de plano inválido" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!mpClient) {
        return NextResponse.json({ error: "Mercado Pago não configurado" }, { status: 500 });
    }

    const plan = PLANS[body.planType];

    const siteUrl = getConfiguredSiteOrigin() ?? (process.env.NODE_ENV === "development" ? new URL(req.url).origin : null);
    if (!siteUrl) {
        return NextResponse.json({ error: "NEXT_PUBLIC_SITE_URL inválida ou ausente." }, { status: 500 });
    }

    try {
        const preapproval = new PreApproval(mpClient);
        const result = await preapproval.create({
            body: {
                reason: plan.reason,
                auto_recurring: {
                    frequency: plan.frequency,
                    frequency_type: plan.frequencyType,
                    transaction_amount: plan.amount,
                    currency_id: "BRL",
                },
                back_url: `${siteUrl}/dashboard?success=true`,
                external_reference: user.id,
                payer_email: user.email,
            },
        });

        const checkoutUrl = parseHttpUrl(result.init_point);
        if (!checkoutUrl) {
            console.error("Mercado Pago returned invalid init_point:", result.init_point);
            return NextResponse.json({ error: "Mercado Pago não retornou uma URL de checkout válida" }, { status: 502 });
        }

        return NextResponse.json({ url: checkoutUrl });

    } catch (err) {
        console.error("Erro MP:", err);
        return NextResponse.json({ error: getMercadoPagoErrorMessage(err) }, { status: 500 });
    }
}
