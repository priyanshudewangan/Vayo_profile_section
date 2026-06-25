import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, eventId, eventTitle, eventDate, eventLocation } = body;

    if (!email || !eventId) {
      return NextResponse.json({ error: "Email and Event ID are required." }, { status: 400 });
    }

    // 1. Save the RSVP in Supabase
    // Using upsert so a user can't RSVP to the same event twice
    const { error } = await supabase
      .from("rsvps")
      .upsert({
        user_email: email.trim().toLowerCase(),
        event_id: eventId,
        event_title: eventTitle,
        event_date: eventDate,
        event_location: eventLocation,
        status: 'confirmed',
        created_at: new Date().toISOString()
      }, { onConflict: 'user_email,event_id' });

    if (error) {
      console.error("Supabase RSVP Error:", error);
      return NextResponse.json({ error: "Failed to save ticket. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Ticket generated successfully!" }, { status: 200 });
  } catch (error) {
    console.error("RSVP API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during RSVP." },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("rsvps")
      .select("*")
      .eq("user_email", email.trim().toLowerCase())
      .order("event_date", { ascending: true });

    if (error) throw error;

    // Enrich tickets with coordinates from events table
    const enrichedTickets = [];
    if (data && data.length > 0) {
      const eventIds = data.map(r => r.event_id).filter(Boolean);
      
      let eventsMap = {};
      let eventsTableExists = false;
      
      // 1. Try querying details from Supabase events table first (primary database)
      try {
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("event_id, lat, lng, venue, status, cover_image_url, event_date")
          .in("event_id", eventIds);
          
        if (!eventsError) {
          eventsTableExists = true;
          if (eventsData) {
            eventsData.forEach(evt => {
              eventsMap[evt.event_id] = {
                lat: evt.lat !== undefined && evt.lat !== null ? evt.lat : evt.latitude,
                lng: evt.lng !== undefined && evt.lng !== null ? evt.lng : evt.longitude,
                venue: evt.venue,
                status: evt.status,
                image: evt.cover_image_url,
                event_date: evt.event_date
              };
            });
          }
        }
      } catch (err) {
        // Ignore table errors
      }

      // 2. Try querying details from the Python backend (local Postgres database) for any missing events
      const missingFromSupabase = eventIds.filter(id => !eventsMap[id]);
      if (missingFromSupabase.length > 0) {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
        for (const eventId of missingFromSupabase) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 800);
            const response = await fetch(`${backendUrl}/api/v1/events/${eventId}`, { 
              signal: controller.signal 
            });
            clearTimeout(timeoutId);
            if (response.ok) {
              const evt = await response.json();
              eventsMap[eventId] = {
                lat: evt.latitude !== undefined && evt.latitude !== null ? evt.latitude : evt.lat,
                lng: evt.longitude !== undefined && evt.longitude !== null ? evt.longitude : evt.lng,
                venue: evt.venue,
                status: evt.status,
                image: evt.cover_image_url || evt.image,
                event_date: evt.event_date || evt.date
              };
              eventsTableExists = true; // A valid events database source is active
            }
          } catch (err) {
            // Ignore and fall back to JSON file
          }
        }
      }

      // 3. Try querying details from the local JSON file for any remaining missing events
      const stillMissing = eventIds.filter(id => !eventsMap[id]);
      if (stillMissing.length > 0) {
        try {
          const fs = require("fs");
          const path = require("path");
          const localDbPath = path.resolve(process.cwd(), "scratch/events_db.json");
          if (fs.existsSync(localDbPath)) {
            const fileData = fs.readFileSync(localDbPath, "utf8");
            const localEvents = JSON.parse(fileData) || [];
            localEvents.forEach(evt => {
              if (stillMissing.includes(evt.event_id)) {
                eventsMap[evt.event_id] = {
                  lat: evt.lat !== undefined && evt.lat !== null ? evt.lat : evt.latitude,
                  lng: evt.lng !== undefined && evt.lng !== null ? evt.lng : evt.longitude,
                  venue: evt.venue,
                  status: evt.status,
                  image: evt.cover_image_url || evt.image,
                  event_date: evt.event_date || evt.date
                };
              }
            });
            eventsTableExists = true;
          }
        } catch (err) {
          console.error("Failed to read local JSON database for ticket lookup:", err);
        }
      }

      data.forEach(tkt => {
        const evtCoords = eventsMap[tkt.event_id];
        // Strict Filter: Skip RSVP ticket if the event is not found or is cancelled
        if (!evtCoords || (evtCoords.status || "").toLowerCase() === "cancelled" || (evtCoords.status || "").toLowerCase() === "canceled") {
          return;
        }
        
        enrichedTickets.push({
          ...tkt,
          lat: evtCoords.lat !== undefined && evtCoords.lat !== null ? evtCoords.lat : 12.9716, // Default Bangalore fallback
          lng: evtCoords.lng !== undefined && evtCoords.lng !== null ? evtCoords.lng : 77.6212, // Default Bangalore fallback
          event_location: evtCoords.venue || tkt.event_location,
          image: evtCoords.image || "/assets/events/something.jpg",
          event_date: evtCoords.event_date || tkt.event_date
        });
      });
    } else {
      return NextResponse.json({ rsvps: [] }, { status: 200 });
    }

    return NextResponse.json({ rsvps: enrichedTickets }, { status: 200 });
  } catch (error) {
    console.error("Fetch RSVPs Error:", error);
    return NextResponse.json({ error: "Failed to fetch your tickets." }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const eventId = searchParams.get("eventId");

    if (!email || !eventId) {
      return NextResponse.json({ error: "Email and Event ID are required." }, { status: 400 });
    }

    const { error } = await supabase
      .from("rsvps")
      .delete()
      .eq("user_email", email.trim().toLowerCase())
      .eq("event_id", eventId);

    if (error) {
      console.error("Supabase RSVP Delete Error:", error);
      return NextResponse.json({ error: "Failed to cancel RSVP." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "RSVP cancelled successfully." }, { status: 200 });
  } catch (error) {
    console.error("Delete RSVP API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during cancellation." },
      { status: 500 }
    );
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
    const { email, eventId, status } = body;

    if (!email || !eventId || !status) {
      return NextResponse.json({ error: "Email, Event ID, and Status are required." }, { status: 400 });
    }

    const { error } = await supabase
      .from("rsvps")
      .update({ status: status })
      .eq("user_email", email.trim().toLowerCase())
      .eq("event_id", eventId);

    if (error) {
      console.error("Supabase RSVP Update Error:", error);
      return NextResponse.json({ error: "Failed to update RSVP status." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Status updated!" }, { status: 200 });
  } catch (error) {
    console.error("Update RSVP API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during status update." },
      { status: 500 }
    );
  }
}
