export const runtime = 'edge';

import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const past = searchParams.get("past") === "true";

    const windowStart = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

    const [eventsRes, rsvpsRes, checkinRes] = await Promise.all([
      past
        ? supabase.from("events").select("*").lt("event_date", windowStart).order("event_date", { ascending: false })
        : supabase.from("events").select("*").gte("event_date", windowStart).order("event_date", { ascending: true }),
      supabase.from("rsvps").select("event_id"),
      supabase.from("rsvps").select("event_id").eq("attendance_status", true),
    ]);

    if (eventsRes.error) {
      console.error("Supabase GET events error:", eventsRes.error.code, eventsRes.error.message);
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    const rsvpMap = {};
    for (const row of rsvpsRes.data || []) {
      rsvpMap[row.event_id] = (rsvpMap[row.event_id] || 0) + 1;
    }
    const checkinMap = {};
    for (const row of checkinRes.data || []) {
      checkinMap[row.event_id] = (checkinMap[row.event_id] || 0) + 1;
    }

    const now = Date.now();
    const events = (eventsRes.data || []).map(evt => {
      const evtMs = new Date(evt.event_date).getTime();
      const isLive = now >= evtMs && now <= evtMs + 3 * 60 * 60 * 1000;
      return {
        ...evt,
        participant_count: rsvpMap[evt.event_id] ?? 0,
        checked_in_count: checkinMap[evt.event_id] ?? 0,
        is_live: isLive,
      };
    });

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

export async function DELETE(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminPassword = process.env.ADMIN_PASSWORD || "vayo_admin_secure";
    if (!authHeader || authHeader !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const { event_id } = await request.json();
    if (!event_id) return NextResponse.json({ error: "event_id required" }, { status: 400 });

    await supabase.from("rsvps").delete().eq("event_id", event_id);
    const { error } = await supabase.from("events").delete().eq("event_id", event_id);
    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete Event Error:", error);
    return NextResponse.json({ error: "Failed to delete event." }, { status: 500 });
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
