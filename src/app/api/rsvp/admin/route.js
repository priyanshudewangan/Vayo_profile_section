import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminPassword = process.env.ADMIN_PASSWORD || "vayo_admin_secure";

    if (!authHeader || authHeader !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    // Fetch all RSVPs for admin view
    const { data, error } = await supabase
      .from("rsvps")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Enrich with waitlist profile data
    const emails = [...new Set((data || []).map(r => r.user_email).filter(Boolean))];
    let profileMap = {};
    if (emails.length > 0) {
      const { data: wlData } = await supabase
        .from("waitlist")
        .select("email, name, phone, birthdate, instagram, interests, selfie_url, vayo_id, profession, food_preferences, weekend_activities, status")
        .in("email", emails);
      (wlData || []).forEach(w => { profileMap[w.email] = w; });
    }

    const enriched = (data || []).map(r => ({
      ...r,
      profile: profileMap[r.user_email] || null,
    }));

    return NextResponse.json({ rsvps: enriched }, { status: 200 });
  } catch (error) {
    console.error("Admin Fetch RSVPs Error:", error);
    return NextResponse.json({ error: "Failed to fetch all RSVPs." }, { status: 500 });
  }
}
