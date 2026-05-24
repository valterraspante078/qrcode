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
        
        // Fetch all profiles
        const { data: users, error: usersError } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (usersError) throw usersError;

        return NextResponse.json(users);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
