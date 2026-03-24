import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { content, name } = await request.json();

    // For public users (no auth), we just create the record.
    // The default in DB will be expires_at = now() + 14 days.

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from("qr_codes")
        .insert({
            content,
            name: name || "QR Público",
            user_id: user?.id || null,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
