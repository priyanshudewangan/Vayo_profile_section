export const runtime = 'edge';

import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminPassword = process.env.ADMIN_PASSWORD || "vayo_admin_secure";

    if (!authHeader || authHeader !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const body = await request.json();
    const { email, status } = body;

    if (!email || !status) {
      return NextResponse.json({ error: "Email and status are required." }, { status: 400 });
    }

    const { error } = await supabase
      .from("waitlist")
      .update({ status })
      .eq("email", email);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Update status API error:", error);
    return NextResponse.json(
      { error: "Error updating candidate status." },
      { status: 500 }
    );
  }
}
