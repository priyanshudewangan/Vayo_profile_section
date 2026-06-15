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

    return NextResponse.json({ rsvps: data || [] }, { status: 200 });
  } catch (error) {
    console.error("Admin Fetch RSVPs Error:", error);
    return NextResponse.json({ error: "Failed to fetch all RSVPs." }, { status: 500 });
  }
}
