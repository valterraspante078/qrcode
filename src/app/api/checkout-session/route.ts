import { mpClient } from "@/lib/mercadopago";
import { PreApproval, Preference } from "mercadopago";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Configuração dos planos
const PLANS: Record<string, { reason: string; frequency?: number; frequencyType?: "months"; amount: number }> = {
    mensal: {
        reason: "Plano Mensal - QR Code da Fortuna",
        amount: 5,
    },
    trimestral: {
        reason: "Plano Trimestral - QR Code da Fortuna",
        frequency: 3,
        frequencyType: "months",
        amount: 75,
    },
    anual: {
        reason: "Plano Anual - QR Code da Fortuna",
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
        // Se for o plano mensal (nosso plano de teste atual), vamos usar PREFERENCE (pagamento único)
        // Isso ajuda a passar pelo anti-fraude que costuma barrar assinaturas recorrentes novas.
        if (planType === "mensal") {
            const preference = new Preference(mpClient);
            const result = await preference.create({
                body: {
                    items: [
                        {
                            id: "mensal",
                            title: plan.reason,
                            quantity: 1,
                            unit_price: plan.amount,
                            currency_id: "BRL",
                        }
                    ],
                    back_urls: {
                        success: `${siteUrl}/dashboard?success=true`,
                        failure: `${siteUrl}/dashboard?error=payment_failed`,
                        pending: `${siteUrl}/dashboard?status=pending`,
                    },
                    auto_return: "approved",
                    external_reference: user.id,
                    payer: {
                        email: user.email || "",
                    }
                }
            });

            console.log("Mercado Pago Preference Result:", JSON.stringify(result, null, 2));
            return NextResponse.json({ url: result.init_point });
        } 
        
        // Para os outros planos, mantemos a Assinatura Recorrente (PreApproval)
        const preapproval = new PreApproval(mpClient);
        const result = await preapproval.create({
            body: {
                reason: plan.reason,
                auto_recurring: {
                    frequency: plan.frequency!,
                    frequency_type: plan.frequencyType!,
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
