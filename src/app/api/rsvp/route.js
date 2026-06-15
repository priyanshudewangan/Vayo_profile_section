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

    return NextResponse.json({ rsvps: data || [] }, { status: 200 });
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
