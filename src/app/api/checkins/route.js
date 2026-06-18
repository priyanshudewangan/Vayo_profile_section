export const runtime = 'edge';

import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("rsvps")
      .select("id, user_email, event_id, event_title, checkin_timestamp, attendance_status")
      .eq("attendance_status", true)
      .order("checkin_timestamp", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ checkins: data || [] }, { status: 200 });
  } catch (err) {
    console.error("Checkins fetch error:", err);
    return NextResponse.json({ checkins: [] }, { status: 200 });
  }
}
