import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function GET(request, { params }) {
  const { event_id } = await params;
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("event_id", event_id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    return NextResponse.json({ event: data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
