export const runtime = "edge";

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminPassword = process.env.ADMIN_PASSWORD || "vayo_admin_secure";

    if (!authHeader || authHeader !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const body = await request.json();
    const { email, simulate } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Initialize Resend
    const resendApiKey = process.env.RESEND_API_KEY || "";
    if (!resendApiKey || resendApiKey === "re_placeholder") {
      return NextResponse.json(
        { error: "Email service configuration missing." },
        { status: 500 }
      );
    }
    
    const resend = new Resend(resendApiKey);

    // If not simulating, send the actual email
    if (!simulate) {
      const { error: mailError } = await resend.emails.send({
        from: "VAYO Support <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to VAYO! \ud83d\udc99",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2 style="color: #6366f1; text-align: center;">Welcome to the Commune</h2>
            <p>Hi there,</p>
            <p>Your member application for VAYO has been approved! You can now secure your account and access the member portal.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://vayo.bangalore/" style="background-color: #6366f1; color: white; padding: 12px 28px; border-radius: 30px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 14px;">
                Log in to VAYO
              </a>
            </div>

            <p style="font-size: 0.9em; color: #64748b;">Simply enter your email on the home page, and you will be prompted to set your secure password.</p>

            <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;" />
            <p style="font-size: 0.85em; color: #94a3b8; text-align: center;">
              &copy; 2026 VAYO Commune.
            </p>
          </div>
        `,
      });

      if (mailError) {
        console.error("Resend Invite Error:", mailError);
        return NextResponse.json({ error: "Failed to send invitation email." }, { status: 500 });
      }
    }

    // Update user invite status in database to 'Sent'
    const { error: dbError } = await supabase
      .from("waitlist")
      .update({ status: "Sent" })
      .eq("email", email);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, simulated: !!simulate }, { status: 200 });
  } catch (error) {
    console.error("Invite API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error while sending invitation." },
      { status: 500 }
    );
  }
}
