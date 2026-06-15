import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, currentPassword, newPassword } = body;

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // 1. Fetch user from waitlist
    const { data: user, error: fetchError } = await supabase
      .from("waitlist")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // 2. Verify current password
    const hashedCurrent = crypto.createHash("sha256").update(currentPassword).digest("hex");
    
    if (user.password !== hashedCurrent) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    // 3. Hash and update new password
    const hashedNew = crypto.createHash("sha256").update(newPassword).digest("hex");
    
    const { error: updateError } = await supabase
      .from("waitlist")
      .update({ password: hashedNew })
      .eq("email", email.trim().toLowerCase());

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: "Password updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Change Password API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error while changing password." },
      { status: 500 }
    );
  }
}
