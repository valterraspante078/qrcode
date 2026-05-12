import { mpClient } from "@/lib/mercadopago";
import { PreApproval } from "mercadopago";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!mpClient) {
        return NextResponse.json({ error: "Mercado Pago não configurado" }, { status: 500 });
    }

    try {
        // Buscar o mp_subscription_id do perfil
        const { data: profile } = await supabase
            .from("profiles")
            .select("mp_subscription_id")
            .eq("id", user.id)
            .single();

        if (!profile?.mp_subscription_id) {
            return NextResponse.json(
                { error: "Nenhuma assinatura encontrada para este usuário" },
                { status: 400 }
            );
        }

        // Cancelar assinatura via API do Mercado Pago
        const preapproval = new PreApproval(mpClient);
        await preapproval.update({
            id: profile.mp_subscription_id,
            body: { status: "cancelled" },
        });

        // Atualizar perfil localmente
        await supabase
            .from("profiles")
            .update({
                subscription_status: "inactive",
                subscription_tier: "free",
            })
            .eq("id", user.id);

        return NextResponse.json({ success: true, message: "Assinatura cancelada com sucesso" });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
