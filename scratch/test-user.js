import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser(email) {
  const { data, error } = await supabase
    .from("waitlist")
    .select("*")
    .eq("email", email)
    .maybeSingle();
    
  if (error) {
    console.error("Error fetching user:", error);
  } else {
    console.log("User entry:", data);
  }
}

checkUser("tester@vayo.com");
