import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key starts with:", supabaseAnonKey ? supabaseAnonKey.slice(0, 15) : "undefined");

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  try {
    const { data, error } = await supabase
      .from("waitlist")
      .select("id, email, status, password");
      
    if (error) {
      console.error("Supabase returned error details:", error);
    } else {
      console.log("Success! Fetched rows:", data);
    }
  } catch (err) {
    console.error("Caught error during request:", err);
  }
}

runTest();

