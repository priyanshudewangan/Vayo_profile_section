import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, phone, birthdate, instagram, interests, selfie_url, vayo_id, profession, food_preferences, weekend_activities } = body;

    // Simple backend email format validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    // Insert details into the waitlist table (try with extended fields first)
    const fullPayload = {
      email,
      name: name || null,
      phone: phone || null,
      birthdate: birthdate || null,
      instagram: instagram || null,
      interests: interests || [],
      selfie_url: selfie_url || null,
      vayo_id: vayo_id || null,
      profession: profession || null,
      food_preferences: food_preferences || [],
      weekend_activities: weekend_activities || [],
      status: "Pending"
    };

    let { data, error } = await supabase.from("waitlist").insert([fullPayload]).select();

    // If new columns don't exist yet (42703 = undefined_column), retry with base fields only
    if (error && (error.code === "42703" || error.message?.includes("column") || error.message?.includes("does not exist"))) {
      const basePayload = { email, name: name || null, phone: phone || null, birthdate: birthdate || null, instagram: instagram || null, interests: interests || [], selfie_url: selfie_url || null, status: "Pending" };
      ({ data, error } = await supabase.from("waitlist").insert([basePayload]).select());
    }

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "This email is already on the waitlist!" }, { status: 409 });
      }
      throw error;
    }

    // Trigger the matching background process on FastAPI backend
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      await fetch(`${backendUrl}/api/v1/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: email,
          bio: `Hey, I'm ${name || 'Vayo Member'}! I'm excited to join the Vayo Commune and meet people who are into ${(interests || []).join(", ")}.`,
          interest_tags: interests || [],
          city: "Bengaluru",
          timezone: "Asia/Kolkata"
        })
      });
    } catch (err) {
      console.warn("FastAPI backend is offline or unreachable. Match task not registered.", err);
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Supabase Database API error:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: error?.message || "Error joining waitlist. Please try again." },
      { status: 500 }
    );
  }
}
