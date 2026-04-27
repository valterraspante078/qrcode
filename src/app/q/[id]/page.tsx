import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isAfter, parseISO } from "date-fns";

export default async function QRRedirectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    // Use Service Role to bypass RLS for public redirect engine
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: qr, error } = await supabaseAdmin
        .from("qr_codes")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !qr) {
        return redirect("/?error=not-found");
    }

    // Silent Expiration Logic:
    // 1. If user is PRO (active subscription), never expires.
    // 2. If free/public, check if expires_at has passed.

    const hasExpired = qr.expires_at && isAfter(new Date(), parseISO(qr.expires_at));

    if (hasExpired) {
        // Redirect to a dedicated expiration page with upgrade CTA
        return redirect(`/expired?id=${id}`);
    }

    // Record scan (Analytics)
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "unknown";
    const referer = headersList.get("referer") || "direct";
    const ip = headersList.get("x-forwarded-for")?.split(',')[0] || "unknown";

    await supabaseAdmin.from("scans").insert({
        qr_id: id,
        user_agent: userAgent,
        referer: referer,
        ip_address: ip,
    });

    return redirect(qr.content);
}
