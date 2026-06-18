import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Helper: Haversine Formula to calculate distance in meters
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, eventId, userLat, userLng } = body;

    if (!email || !eventId || !userLat || !userLng) {
      return NextResponse.json({ error: "Missing required check-in data." }, { status: 400 });
    }

    // 1. Fetch the event details to get venue coordinates
    // We check both lat/lng and latitude/longitude to be compatible with different schema versions
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("event_id, lat, lng, latitude, longitude, title, event_date")
      .eq("event_id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const vLat = event.lat !== null && event.lat !== undefined ? event.lat : event.latitude;
    const vLng = event.lng !== null && event.lng !== undefined ? event.lng : event.longitude;

    if (vLat === null || vLat === undefined || vLng === null || vLng === undefined) {
      return NextResponse.json({ error: "Venue coordinates not set for this event." }, { status: 400 });
    }

    // 2. Calculate Distance
    const distance = calculateDistance(userLat, userLng, vLat, vLng);
    const THRESHOLD = 250; // 250 meters tolerance (accounts for GPS drift and urban buildings)

    if (distance > THRESHOLD) {
      return NextResponse.json({ 
        success: false, 
        distance: Math.round(distance),
        error: `You are too far from the venue (${Math.round(distance)}m away). Please try again when you arrive at the entrance.` 
      }, { status: 403 });
    }

    // 3. Mark as Attended in Database
    const { error: updateError } = await supabase
      .from("rsvps")
      .update({ 
        status: "Attended"
      })
      .eq("user_email", email)
      .eq("event_id", eventId);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      success: true, 
      message: `Verification successful! Welcome to ${event.title}.`,
      distance: Math.round(distance)
    }, { status: 200 });

  } catch (error) {
    console.error("Check-in API Error:", error);
    return NextResponse.json({ error: "Internal Server Error during check-in." }, { status: 500 });
  }
}
