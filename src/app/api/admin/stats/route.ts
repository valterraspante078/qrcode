import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const supabase = createAdminClient();
        
        // Parallel fetch for stats
        const [usersCount, qrsCount, activeQrs, publicQrs] = await Promise.all([
            supabase.from("profiles").select("*", { count: "exact", head: true }),
            supabase.from("qr_codes").select("*", { count: "exact", head: true }),
            supabase.from("qr_codes").select("*", { count: "exact", head: true }).is("expires_at", null),
            supabase.from("qr_codes").select("*", { count: "exact", head: true }).is("user_id", null),
        ]);

        return NextResponse.json({
            totalUsers: usersCount.count || 0,
            totalQrs: qrsCount.count || 0,
            activeQrs: activeQrs.count || 0,
            publicQrs: publicQrs.count || 0,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
