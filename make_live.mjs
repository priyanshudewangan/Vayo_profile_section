import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const supabase = createClient(
  "https://lbfqxxfixpmxnlvmomdh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZnF4eGZpeHBteG5sdm1vbWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDgwOTY0MCwiZXhwIjoyMDk2Mzg1NjQwfQ.SNwulJ7grZC_b_6gbDU90ipnGxBQR7Gt2F8OMohNjDY",
  { realtime: { transport: ws } }
);

// 5 minutes ago — firmly inside the live window
const liveDate = new Date(Date.now() - 5 * 60 * 1000).toISOString();

// 1. Reset event_date on the events table
const { error: evtErr } = await supabase
  .from("events")
  .update({ event_date: liveDate })
  .eq("event_id", "evt_1781531360029");
if (evtErr) { console.error("events error:", evtErr.message); process.exit(1); }

// 2. Upsert RSVP — reset window + clear any previous check-in
const { error: rsvpErr } = await supabase
  .from("rsvps")
  .upsert({
    user_email: "tosaran09@gmail.com",
    event_id: "evt_1781531360029",
    event_title: "Meditation",
    event_date: liveDate,
    event_location: "VAYO Hub, Chennai",
    status: "confirmed",
    attendance_status: false,
    checkin_timestamp: null,
  }, { onConflict: "user_email,event_id" });
if (rsvpErr) { console.error("rsvp error:", rsvpErr.message); process.exit(1); }

const windowEnd = new Date(new Date(liveDate).getTime() + 3 * 60 * 60 * 1000);
console.log("Live window reset. Event started:", liveDate);
console.log("Check-in window open until:", windowEnd.toISOString());
console.log("'Mark Attendance' button is ready on the profile.");
