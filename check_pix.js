require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPix() {
  const { data, error } = await supabase
    .from("profiles")
    .select("pix_key")
    .limit(1);

  if (error) {
    console.error("Error accessing pix_key:", error.message);
  } else {
    console.log("pix_key column exists.");
  }
}

checkPix();
