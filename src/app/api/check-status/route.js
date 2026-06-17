export const runtime = 'edge';

import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || supabaseUrl.includes("placeholder") || !supabaseAnonKey || supabaseAnonKey.includes("placeholder")) {
      return NextResponse.json(
        { error: "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing or misconfigured in your deployment environment." },
        { status: 500 }
      );
    }

    // Query waitlist details from Supabase
    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ status: "unregistered" }, { status: 200 });
    }

    // Determine verification status
    // Default to "Pending" if missing
    const dbStatus = data.status || "Pending";
    const statusNormalized = dbStatus.trim().toLowerCase();

    // "Sent" (meaning invitation credentials sent) or "Approved" are treated as approved
    if (statusNormalized === "sent" || statusNormalized === "approved") {
      return NextResponse.json({ 
        status: "approved", 
        user: data,
        hasPassword: !!data.password
      }, { status: 200 });
    } else {
      return NextResponse.json({ status: "pending", user: data }, { status: 200 });
    }
  } catch (error) {
    console.error("Error in check-status API:", error);
    return NextResponse.json(
      { error: `Error checking status: ${error.message || error}` },
      { status: 500 }
    );
  }
}
