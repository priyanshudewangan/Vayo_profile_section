import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function GET(request, { params }) {
  const { event_id } = await params;
  const { data, error } = await supabase
    .from("split_sessions")
    .select("*")
    .eq("event_id", event_id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session: data || null }, { status: 200 });
}

export async function PUT(request, { params }) {
  const { event_id } = await params;
  const body = await request.json();
  const { event_name, members, expenses, paid } = body;

  const { data, error } = await supabase
    .from("split_sessions")
    .upsert({
      event_id,
      event_name: event_name || "",
      members:    members   || [],
      expenses:   expenses  || [],
      paid:       paid      || {},
      updated_at: new Date().toISOString(),
    }, { onConflict: "event_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session: data }, { status: 200 });
}
