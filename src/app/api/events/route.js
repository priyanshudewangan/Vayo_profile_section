import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import fs from "fs";
import path from "path";

const localDbPath = path.resolve(process.cwd(), "scratch/events_db.json");

function getLocalEvents() {
  try {
    if (fs.existsSync(localDbPath)) {
      const data = fs.readFileSync(localDbPath, "utf8");
      return JSON.parse(data) || [];
    }
  } catch (err) {
    console.error("Failed to read local events DB:", err);
  }
  return [];
}

function saveLocalEvents(events) {
  try {
    const dir = path.dirname(localDbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(localDbPath, JSON.stringify(events, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write local events DB:", err);
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    let finalEvents = [];

    if (error && (error.code === '42P01' || error.code === 'PGRST116' || error.message.includes('does not exist'))) {
      // Fallback to local JSON file
      finalEvents = getLocalEvents();
    } else if (error) {
      throw error;
    } else {
      finalEvents = data || [];
    }

    // Count RSVPs dynamically from Supabase rsvps table
    const { data: rsvps } = await supabase.from("rsvps").select("event_id");
    const rsvpCounts = {};
    if (rsvps) {
      rsvps.forEach(r => {
        if (r.event_id) {
          rsvpCounts[r.event_id] = (rsvpCounts[r.event_id] || 0) + 1;
        }
      });
    }

    const enrichedEvents = finalEvents.map(evt => ({
      ...evt,
      participant_count: rsvpCounts[evt.event_id] || 0
    }));

    return NextResponse.json({ events: enrichedEvents }, { status: 200 });
  } catch (error) {
    console.error("Fetch Supabase Events Error:", error);
    return NextResponse.json({ error: "Failed to fetch events." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminPassword = process.env.ADMIN_PASSWORD || "vayo_admin_secure";

    if (!authHeader || authHeader !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }
    
    const body = await request.json();
    const { 
      event_id, eventId, title, venue, lat, lng, latitude, longitude,
      description, city, status, category, host_id, cover_image_url,
      interest_tags, min_karma_required, entry_fee, max_participants, event_date
    } = body;

    const finalEventId = eventId || event_id || `evt_${Math.random().toString(36).substring(2, 12)}`;
    const finalLat = lat !== undefined ? lat : latitude;
    const finalLng = lng !== undefined ? lng : longitude;

    const insertPayload = {
      event_id: finalEventId,
      title: title || "Untitled Event",
      venue: venue || "",
      lat: finalLat,
      lng: finalLng,
      latitude: finalLat,
      longitude: finalLng,
      event_date: event_date || body.event_date || new Date().toISOString(),
      city: city || "Bangalore",
      description: description || "",
      status: status || "active",
      category: category || "social",
      host_id: host_id || "admin",
      cover_image_url: cover_image_url || "/assets/events/something.jpg",
      interest_tags: interest_tags || [],
      min_karma_required: min_karma_required || 0,
      entry_fee: entry_fee || 0,
      max_participants: max_participants || null
    };

    const { data, error } = await supabase
      .from("events")
      .insert([insertPayload])
      .select();

    if (error) {
      console.warn("Supabase insert event error (checking fallback):", error.message, error.code);
      if (error.code === '42P01' || error.code === 'PGRST116' || (error.message && error.message.includes('does not exist'))) {
        // Fallback: save to local JSON file
        const localEvents = getLocalEvents();
        localEvents.push(insertPayload);
        saveLocalEvents(localEvents);

        return NextResponse.json(
          { 
            success: true, 
            message: "Table 'events' does not exist in Supabase. Event saved to local JSON.",
            event: insertPayload 
          }, 
          { status: 201 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, event: data?.[0] || insertPayload }, { status: 201 });
  } catch (error) {
    console.error("Create Event Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create event." }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminPassword = process.env.ADMIN_PASSWORD || "vayo_admin_secure";

    if (!authHeader || authHeader !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const body = await request.json();
    const { event_id, eventId, venue, lat, lng, latitude, longitude, status } = body;
    
    const finalEventId = eventId || event_id;
    if (!finalEventId) {
      return NextResponse.json({ error: "Event ID is required for updating." }, { status: 400 });
    }

    const finalLat = lat !== undefined ? lat : latitude;
    const finalLng = lng !== undefined ? lng : longitude;

    const updatePayload = {};
    if (venue !== undefined) updatePayload.venue = venue;
    if (finalLat !== undefined) {
      updatePayload.lat = finalLat;
      updatePayload.latitude = finalLat;
    }
    if (finalLng !== undefined) {
      updatePayload.lng = finalLng;
      updatePayload.longitude = finalLng;
    }
    if (status !== undefined) updatePayload.status = status;

    const { data, error } = await supabase
      .from("events")
      .update(updatePayload)
      .eq("event_id", finalEventId)
      .select();

    if (error) {
      console.warn("Supabase update event error (checking fallback):", error.message, error.code);
      if (error.code === '42P01' || error.code === 'PGRST116' || (error.message && error.message.includes('does not exist'))) {
        // Fallback: update in local JSON file
        const localEvents = getLocalEvents();
        const idx = localEvents.findIndex(e => e.event_id === finalEventId);
        if (idx !== -1) {
          localEvents[idx] = {
            ...localEvents[idx],
            ...updatePayload
          };
          saveLocalEvents(localEvents);
          return NextResponse.json({ success: true, event: localEvents[idx] }, { status: 200 });
        }
        return NextResponse.json({ error: "Event not found locally." }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, event: data?.[0] }, { status: 200 });
  } catch (error) {
    console.error("Update Event Location Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update event location." }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminPassword = process.env.ADMIN_PASSWORD || "vayo_admin_secure";

    if (!authHeader || authHeader !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    // 1. Delete associated RSVPs from Supabase rsvps table
    const { error: rsvpError } = await supabase
      .from("rsvps")
      .delete()
      .eq("event_id", eventId);

    if (rsvpError) {
      console.warn("Supabase RSVP delete warning during event deletion:", rsvpError);
    }

    // 2. Delete the event from Supabase events table
    const { data, error } = await supabase
      .from("events")
      .delete()
      .eq("event_id", eventId)
      .select();

    if (error) {
      console.warn("Supabase delete event error (checking fallback):", error.message, error.code);
      if (error.code === '42P01' || error.code === 'PGRST116' || (error.message && error.message.includes('does not exist'))) {
        // Fallback: delete from local JSON file
        const localEvents = getLocalEvents();
        const filtered = localEvents.filter(e => e.event_id !== eventId);
        if (localEvents.length !== filtered.length) {
          saveLocalEvents(filtered);
          return NextResponse.json({ success: true, message: "Event deleted from local JSON." }, { status: 200 });
        }
        return NextResponse.json({ error: "Event not found locally." }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, message: "Event and associated RSVPs deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Delete Event Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete event." }, { status: 500 });
  }
}
