import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature")!;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    const session = event.data.object as any;

    if (event.type === "checkout.session.completed") {
        const customerId = session.customer as string;
        const userId = session.client_reference_id as string;

        // Update profile
        await supabaseAdmin
            .from("profiles")
            .update({
                stripe_customer_id: customerId,
                subscription_status: "active",
                subscription_tier: "pro",
            })
            .eq("id", userId);

        // Reactivate all QR codes of this user if needed (though they probably won't have expired ones if just signed up)
        // But as per flow: "paga para reativar"
        await supabaseAdmin
            .from("qr_codes")
            .update({ is_active: true })
            .eq("user_id", userId);
    }

    if (event.type === "customer.subscription.deleted") {
        const customerId = session.customer as string;

        await supabaseAdmin
            .from("profiles")
            .update({
                subscription_status: "inactive",
                subscription_tier: "free",
            })
            .eq("stripe_customer_id", customerId);
    }

    return NextResponse.json({ received: true });
}
