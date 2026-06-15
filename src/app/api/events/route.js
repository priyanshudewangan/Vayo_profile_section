import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) {
      // If table doesn't exist yet, return empty list gracefully
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return NextResponse.json({ events: [] }, { status: 200 });
      }
      throw error;
    }

    return NextResponse.json({ events: data || [] }, { status: 200 });
  } catch (error) {
    console.error("Fetch Supabase Events Error:", error);
    return NextResponse.json({ error: "Failed to fetch events." }, { status: 500 });
  }
}
