import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

const CHECKIN_RADIUS_METERS = 200;
const CHECKIN_WINDOW_AFTER_MS = 3 * 60 * 60 * 1000; // 3 hours after event start

// Karma points by event category (VAYO Karma spec)
const GPS_KARMA_BY_TYPE = { meetup: 3, event: 5, experience_trip: 12 };

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6_371_000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dPhi = ((lat2 - lat1) * Math.PI) / 180;
  const dLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function POST(request) {
  try {
    // 1. Parse and validate body
    const body = await request.json();
    const { email: rawEmail, eventId, userLat, userLng } = body;
    const email = rawEmail?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required." }, { status: 400 });
    }
    if (typeof userLat !== "number" || !isFinite(userLat) ||
        typeof userLng !== "number" || !isFinite(userLng)) {
      return NextResponse.json({ error: "Valid userLat and userLng are required." }, { status: 400 });
    }

    // 3. Fetch event
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("event_id, lat, lng, event_date, title, category")
      .eq("event_id", eventId)
      .maybeSingle();

    if (eventErr || !event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }
    if (event.lat === null || event.lng === null) {
      return NextResponse.json(
        { error: "This event has no GPS location. Check-in unavailable." },
        { status: 400 }
      );
    }

    // 4. Time window check (event_start → event_start + 3hr)
    const eventDate = new Date(event.event_date);
    const now = Date.now();
    if (now < eventDate.getTime()) {
      return NextResponse.json({ error: "Event hasn't started yet." }, { status: 400 });
    }
    if (now > eventDate.getTime() + CHECKIN_WINDOW_AFTER_MS) {
      return NextResponse.json({ error: "Check-in window has closed." }, { status: 400 });
    }

    // 5. Verify RSVP exists
    const { data: rsvp, error: rsvpErr } = await supabase
      .from("rsvps")
      .select("id, attendance_status")
      .eq("user_email", email)
      .eq("event_id", eventId)
      .maybeSingle();

    if (rsvpErr || !rsvp) {
      return NextResponse.json(
        { error: "You must RSVP to this event before checking in." },
        { status: 403 }
      );
    }

    // 6. Haversine distance check
    const distance = haversineDistance(userLat, userLng, event.lat, event.lng);
    if (distance > CHECKIN_RADIUS_METERS) {
      return NextResponse.json(
        {
          error: `Too far from event. You are ${Math.round(distance)}m away (must be within ${CHECKIN_RADIUS_METERS}m).`,
          distance_meters: Math.round(distance),
        },
        { status: 400 }
      );
    }

    // 7. Atomic update — only succeeds if not already checked in
    const { data: updated, error: updateErr } = await supabase
      .from("rsvps")
      .update({
        attendance_status: true,
        checkin_timestamp: new Date().toISOString(),
      })
      .eq("user_email", email)
      .eq("event_id", eventId)
      .eq("attendance_status", false)
      .select();

    if (updateErr) {
      console.error("Checkin update error:", updateErr);
      return NextResponse.json({ error: "Failed to record check-in." }, { status: 500 });
    }
    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: "You have already checked in to this event." },
        { status: 409 }
      );
    }

    // 8. Determine karma points by event category
    const category = (event.category || "event").toLowerCase().replace(/\s+/g, "_");
    const karmaEarned = GPS_KARMA_BY_TYPE[category] ?? GPS_KARMA_BY_TYPE.event;

    return NextResponse.json(
      {
        success: true,
        distance_meters: Math.round(distance),
        karma_earned: karmaEarned,
        message: `Attendance marked! +${karmaEarned} karma earned.`,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Checkin API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
