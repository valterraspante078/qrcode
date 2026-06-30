import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { isUuid, parseHttpUrl } from "@/lib/validation";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isAfter, parseISO } from "date-fns";

function truncate(value: string, maxLength: number) {
    return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function hashIpAddress(value: string) {
    if (!value || value === "unknown") return "unknown";

    const salt = process.env.IP_HASH_SALT ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    return createHash("sha256").update(`${salt}:${value}`).digest("hex");
}

export default async function QRRedirectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!isUuid(id)) {
        return redirect("/?error=not-found");
    }

    const supabaseAdmin = createAdminClient();

    const { data: qr, error } = await supabaseAdmin
        .from("qr_codes")
        .select("id, content, expires_at, is_active")
        .eq("id", id)
        .maybeSingle();

    if (error || !qr) {
        return redirect("/?error=not-found");
    }

    if (qr.is_active === false) {
        return redirect(`/expired?id=${id}`);
    }

    const hasExpired = qr.expires_at && isAfter(new Date(), parseISO(qr.expires_at));

    if (hasExpired) {
        return redirect(`/expired?id=${id}`);
    }

    const destination = parseHttpUrl(qr.content);
    if (!destination) {
        console.error("QR redirect blocked invalid destination:", { id });
        return redirect("/?error=invalid-destination");
    }

    const headersList = await headers();
    const userAgent = truncate(headersList.get("user-agent") || "unknown", 500);
    const referer = truncate(headersList.get("referer") || "direct", 2048);
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    const { error: scanError } = await supabaseAdmin.from("scans").insert({
        qr_id: id,
        user_agent: userAgent,
        referer: referer,
        ip_address: hashIpAddress(ip),
    });

    if (scanError) {
        console.error("QR scan insert error:", scanError);
    }

    return redirect(destination);
}
