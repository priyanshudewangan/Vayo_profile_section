export const runtime = 'edge';

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { sha256 } from "@/lib/crypto";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists and is approved/sent status
    const { data: user, error: fetchError } = await supabase
      .from("waitlist")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const statusNormalized = (user.status || "Pending").trim().toLowerCase();
    if (statusNormalized !== "sent" && statusNormalized !== "approved") {
      return NextResponse.json(
        { error: "Access not yet approved for this account." },
        { status: 403 }
      );
    }

    // Generate a temporary password
    const tempPassword = `Vayo-${Math.floor(1000 + Math.random() * 9000)}`;
    const hashedPassword = await sha256(tempPassword);

    // Initialize Resend
    const resendApiKey = process.env.RESEND_API_KEY || "";
    if (!resendApiKey || resendApiKey === "re_placeholder") {
      return NextResponse.json(
        { error: "Email service configuration missing." },
        { status: 500 }
      );
    }
    
    const resend = new Resend(resendApiKey);

    // Send the password reset email
    const { error: mailError } = await resend.emails.send({
      from: "VAYO Support <onboarding@resend.dev>",
      to: [normalizedEmail],
      subject: "Your VAYO Password Reset 💙",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
          <h2 style="color: #6366f1; text-align: center;">Password Reset Request</h2>
          <p>Hi there,</p>
          <p>We received a request to reset your VAYO password. Here is your new temporary password:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0; text-align: center;">
            <p style="margin: 5px 0; color: #64748b; font-size: 0.9em;">TEMPORARY PASSWORD</p>
            <code style="background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 6px; font-size: 1.4em; font-weight: bold; letter-spacing: 1px;">${tempPassword}</code>
          </div>

          <p>Please use this password to log in. You can change your password anytime from your profile settings after logging in.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://vayo.bangalore/" style="background-color: #6366f1; color: white; padding: 12px 28px; border-radius: 30px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 14px;">
              Log in to VAYO
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;" />
          <p style="font-size: 0.85em; color: #94a3b8; text-align: center;">
            If you did not request a password reset, please secure your account or contact support. <br />
            &copy; 2026 VAYO Commune.
          </p>
        </div>
      `,
    });

    // Update the database with the new hashed temporary password
    const { error: updateError } = await supabase
      .from("waitlist")
      .update({ password: hashedPassword })
      .eq("email", normalizedEmail);

    if (updateError) throw updateError;

    // Log the password for the developer (ALWAYS log so testing is easy)
    console.log("\n------------------------------------------------");
    console.log(`\u2705 PASSWORD RESET SUCCESSFUL`);
    console.log(`Email: ${normalizedEmail}`);
    console.log(`New Temp Password: [ ${tempPassword} ]`);
    console.log("------------------------------------------------\n");

    if (mailError) {
      console.warn("Resend was unable to send the email (Sandbox mode?). Continuing anyway for testing.");
      return NextResponse.json({ 
        success: true, 
        message: "Reset initiated. Since the mail service is in sandbox, please check the server logs for your password.",
        isSandbox: true
      }, { status: 200 });
    }

    return NextResponse.json({ success: true, message: "Reset password sent to email." }, { status: 200 });
  } catch (error) {
    console.error("Forgot Password API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during password reset." },
      { status: 500 }
    );
  }
}
