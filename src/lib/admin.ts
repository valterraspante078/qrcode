import { createClient } from "@/lib/supabase/server";

export async function isAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) return false;

    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    return adminEmails.includes(user.email.toLowerCase());
}
