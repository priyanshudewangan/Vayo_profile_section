import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, bio, instagram, linkedin, twitter, github, bizzSkills, bizzRole, bizzCompany, inboxShield } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Prepare update object
    const updateData = {
      // The bio field in waitlist table will store the social bio
      bio: bio || undefined,
      instagram: instagram || undefined,
      linkedin: linkedin || undefined,
      twitter: twitter || undefined,
      github: github || undefined,
      inbox_shield: inboxShield !== undefined ? inboxShield : undefined,
    };

    // Update the waitlist table in Supabase
    const { error: updateError } = await supabase
      .from("waitlist")
      .update(updateData)
      .eq("email", email.trim().toLowerCase());

    if (updateError) {
      console.error("Supabase Update Error Detail:", updateError);
      return NextResponse.json({ 
        error: updateError.message || "Database update failed.",
        code: updateError.code,
        hint: "Check if the column exists in your Supabase table."
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Update Profile API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error while updating profile." },
      { status: 500 }
    );
  }
}
