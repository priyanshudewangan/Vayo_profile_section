import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  const { data, error } = await supabase
    .from("waitlist")
    .select("email, name, status, password")
    .limit(10);
    
  if (error) {
    console.error("Error fetching waitlist:", error);
  } else {
    console.log("Waitlist entries:");
    console.table(data);
  }
}

test();
