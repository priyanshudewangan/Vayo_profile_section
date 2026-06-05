import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Hash the password with SHA-256
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    // Retrieve and verify applicant status first
    const { data: user, error: fetchError } = await supabase
      .from("waitlist")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const statusNormalized = (user.status || "Pending").trim().toLowerCase();
    if (statusNormalized !== "sent" && statusNormalized !== "approved") {
      return NextResponse.json(
        { error: "Your waitlist application is not approved yet." },
        { status: 403 }
      );
    }

    // Save the hashed password to the database
    const { error: updateError } = await supabase
      .from("waitlist")
      .update({ password: hashedPassword })
      .eq("email", email.trim().toLowerCase());

    if (updateError) throw updateError;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error setting password:", error);
    return NextResponse.json(
      { error: "Failed to set password. Please try again." },
      { status: 500 }
    );
  }
}
