export const runtime = 'edge';

import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { BACKEND_URL } from "@/lib/constants";

export async function POST(request) {
  try {
    const body = await request.json();
    let { email, name, phone, birthdate, instagram, interests, selfie_url } = body;

    // Simple backend email format validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    // Normalize email for consistency
    email = email.trim().toLowerCase();

    // Insert details into the waitlist table
    const { data, error } = await supabase
      .from("waitlist")
      .insert([
        {
          email,
          name: name || null,
          phone: phone || null,
          birthdate: birthdate || null,
          instagram: instagram || null,
          interests: interests || [],
          selfie_url: selfie_url || null,
          status: "Pending"
        }
      ])
      .select();

    if (error) {
      // Handle Postgres unique constraint violation error code (23505)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This email is already on the waitlist!" },
          { status: 409 }
        );
      }
      throw error;
    }

    // Trigger the matching background process on FastAPI backend
    try {
      await fetch(`${BACKEND_URL}/api/v1/match`, {
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
    console.error("Supabase Database API error:", error);
    return NextResponse.json(
      { error: "Error joining waitlist. Please try again." },
      { status: 500 }
    );
  }
}
