import { mpClient } from "@/lib/mercadopago";
import { PreApproval } from "mercadopago";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Configuração dos planos
const PLANS: Record<string, { reason: string; frequency: number; frequencyType: "months"; amount: number }> = {
    mensal: {
        reason: "QR Code da Fortuna — Plano Mensal (TESTE)",
        frequency: 1,
        frequencyType: "months",
        amount: 1,
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
};

export async function POST(req: Request) {
    const { planType } = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!mpClient) {
        return NextResponse.json({ error: "Mercado Pago não configurado" }, { status: 500 });
    }

    const plan = PLANS[planType];
    if (!plan) {
        return NextResponse.json({ error: "Tipo de plano inválido" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl || !siteUrl.startsWith("http")) {
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
                payer_email: user.email || "",
                external_reference: user.id,
            },
        });
        console.log("Mercado Pago PreApproval Result:", JSON.stringify(result, null, 2));

        return NextResponse.json({ url: result.init_point });
    } catch (err: any) {
        console.error("Erro MP:", err);
        const errorMessage =
            err?.message ||
            err?.response?.data?.message ||
            err?.cause?.[0]?.description ||
            (typeof err === 'string' ? err : JSON.stringify(err)) ||
            "Erro ao processar assinatura";
            
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
