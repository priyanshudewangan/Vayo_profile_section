const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Parse .env.local manually
const envPath = path.resolve(__dirname, "../.env.local");
let supabaseUrl = "";
let supabaseAnonKey = "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      if (key === "NEXT_PUBLIC_SUPABASE_URL" || key === "SUPABASE_URL") {
        supabaseUrl = val;
      }
      if (key === "NEXT_PUBLIC_SUPABASE_ANON_KEY" || key === "SUPABASE_ANON_KEY") {
        supabaseAnonKey = val;
      }
    }
  }
}

async function main() {
  console.log("Connecting to Supabase at:", supabaseUrl);
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching events:", error.message);
  } else {
    console.log("Events in Database:");
    console.log(JSON.stringify(events.map(e => ({
      event_id: e.event_id,
      title: e.title,
      event_date: e.event_date,
      status: e.status
    })), null, 2));
  }
}

main().catch(console.error);
