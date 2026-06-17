export const runtime = 'edge';

import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, imageUrl, caption, location, imageColor } = body;

    if (!email || !imageUrl) {
      return NextResponse.json({ error: "Email and Image URL are required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("moments")
      .insert({
        user_email: email.trim().toLowerCase(),
        imageUrl,
        caption,
        location,
        imageColor: imageColor || 'from-indigo-500 to-purple-600'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, moment: data }, { status: 200 });
  } catch (error) {
    console.error("Save Moment Error:", error);
    return NextResponse.json({ error: "Failed to save memory." }, { status: 500 });
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
      .from("moments")
      .select("*")
      .eq("user_email", email.trim().toLowerCase())
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ moments: data || [] }, { status: 200 });
  } catch (error) {
    console.error("Fetch Moments Error:", error);
    return NextResponse.json({ error: "Failed to fetch memories." }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (!id || !email) {
      return NextResponse.json({ error: "ID and Email are required." }, { status: 400 });
    }

    const { error } = await supabase
      .from("moments")
      .delete()
      .eq("id", id)
      .eq("user_email", email.trim().toLowerCase());

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete Moment Error:", error);
    return NextResponse.json({ error: "Failed to delete memory." }, { status: 500 });
  }
}
