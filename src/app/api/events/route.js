export const runtime = "edge";

import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const [eventsRes, rsvpsRes] = await Promise.all([
      supabase
        .from("events")
        .select("*")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true }),
      supabase
        .from("rsvps")
        .select("event_id")
    ]);

    if (eventsRes.error) {
      console.error("Supabase GET events error:", eventsRes.error.code, eventsRes.error.message);
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    // Count RSVPs per event_id
    const countMap = {};
    for (const row of rsvpsRes.data || []) {
      countMap[row.event_id] = (countMap[row.event_id] || 0) + 1;
    }

    const events = (eventsRes.data || []).map(evt => ({
      ...evt,
      participant_count: countMap[evt.event_id] ?? 0,
    }));

    console.log("Supabase events returned:", events.length, "rows");
    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error("Fetch Supabase Events Error:", error);
    return NextResponse.json({ events: [], error: "Failed to fetch events." }, { status: 200 });
  }
}

export async function PATCH(request) {
  try {
    const { event_id, lat, lng, venue } = await request.json();
    if (!event_id) return NextResponse.json({ error: "event_id required" }, { status: 400 });

    const { data, error } = await supabase
      .from("events")
      .update({ lat, lng, venue })
      .eq("event_id", event_id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Update location error:", error);
    return NextResponse.json({ error: "Failed to update location." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const eventId = `evt_${Date.now()}`;

    const { data, error } = await supabase
      .from("events")
      .insert([{
        event_id: eventId,
        title: body.title,
        description: body.description || null,
        host_id: body.host_id,
        event_date: body.event_date,
        city: body.city,
        venue: body.venue || null,
        category: body.category || "social",
        interest_tags: body.interest_tags || [],
        min_karma_required: body.min_karma_required || 0,
        entry_fee: body.entry_fee || 0,
        max_participants: body.max_participants || null,
        cover_image_url: body.cover_image_url || null,
        lat: body.lat || null,
        lng: body.lng || null,
        status: "active"
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ event_id: data.event_id, ...data }, { status: 200 });
  } catch (error) {
    console.error("Create Event Error:", error);
    return NextResponse.json({ error: "Failed to create event." }, { status: 500 });
  }
}
