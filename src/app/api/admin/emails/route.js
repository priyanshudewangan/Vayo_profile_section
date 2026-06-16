export const runtime = "edge";

import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminPassword = process.env.ADMIN_PASSWORD || "vayo_admin_secure";

    if (!authHeader || authHeader !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    // Fetch waitlist details from Supabase
    const { data: waitlistData, error: dbError } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) throw dbError;

    // Enhance data: If they have a password, they are effectively "Joined" members
    const enhancedData = waitlistData.map(user => {
      if (user.password) {
        return { ...user, status: "Joined" };
      }
      return user;
    });

    return NextResponse.json({ emails: enhancedData }, { status: 200 });
  } catch (error) {
    console.error("Admin Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch waitlist emails." },
      { status: 500 }
    );
  }
}
