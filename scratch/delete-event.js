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

  const eventId = "evt_c90d9bde80";
  console.log(`\nDeleting event and RSVPs for ID "${eventId}" from Supabase...`);

  // 1. Delete RSVPs
  const { data: rsvpsDeleted, error: rsvpError } = await supabase
    .from("rsvps")
    .delete()
    .eq("event_id", eventId)
    .select();

  if (rsvpError) {
    console.error("Error deleting RSVPs from Supabase:", rsvpError.message);
  } else {
    console.log(`Successfully deleted ${rsvpsDeleted ? rsvpsDeleted.length : 0} RSVPs from Supabase.`);
  }

  // 2. Delete Event
  const { data: eventsDeleted, error: eventError } = await supabase
    .from("events")
    .delete()
    .eq("event_id", eventId)
    .select();

  if (eventError) {
    console.error("Error deleting event from Supabase:", eventError.message);
  } else {
    console.log(`Successfully deleted ${eventsDeleted ? eventsDeleted.length : 0} events from Supabase.`);
  }
}

main().catch(console.error);
