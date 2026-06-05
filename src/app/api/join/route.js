import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, phone, birthdate, instagram, interests, selfie_url } = body;

    // Simple backend email format validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    // Insert waitlist details into Supabase
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

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Supabase Database API error:", error);
    return NextResponse.json(
      { error: "Error joining waitlist. Please try again." },
      { status: 500 }
    );
  }
}
