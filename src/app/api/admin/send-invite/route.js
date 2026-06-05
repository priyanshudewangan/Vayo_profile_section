import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

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

    // Generate a temporary 4-digit numeric password
    const tempPassword = `Vayo-${Math.floor(1000 + Math.random() * 9000)}`;
    const whatsappLink = process.env.WHATSAPP_LINK || "https://chat.whatsapp.com/example";
    
    // If simulation mode is explicitly requested, bypass Resend sending and directly update DB status
    if (simulate) {
      const { error: dbError } = await supabase
        .from("waitlist")
        .update({ status: "Sent" })
        .eq("email", email);

      if (dbError) throw dbError;

      return NextResponse.json({ success: true, password: tempPassword, simulated: true }, { status: 200 });
    }

    // Initialize Resend with env key
    const resendApiKey = process.env.RESEND_API_KEY || "";
    if (!resendApiKey || resendApiKey === "re_placeholder") {
      return NextResponse.json(
        { error: "Resend API key is missing. Please set it in your .env.local file." },
        { status: 500 }
      );
    }
    
    const resend = new Resend(resendApiKey);

    // Send the onboarding email
    const { error: mailError } = await resend.emails.send({
      from: "VAYO Onboarding <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to VAYO! Your login credentials & WhatsApp group invite 💙",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
          <h2 style="color: #0066FF; text-align: center;">Welcome to the VAYO Commune!</h2>
          <p>Hi there,</p>
          <p>We are thrilled to welcome you to early access! Here are your temporary credentials to log into our community portal:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Username / Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #eef; padding: 2px 6px; border-radius: 3px; font-size: 1.1em;">${tempPassword}</code></p>
          </div>

          <p>Please use these credentials to sign in. Next, click the button below to join our official WhatsApp Community and connect with other members offline:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${whatsappLink}" style="background-color: #25D366; color: white; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-weight: bold; display: inline-block;">
              Join WhatsApp Group 🟢
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;" />
          <p style="font-size: 0.85em; color: #666; text-align: center;">
            If you did not sign up for VAYO, you can ignore this email. <br />
            &copy; 2026 VAYO Commune. Powered by Laneway.
          </p>
        </div>
      `,
    });

    if (mailError) {
      console.error("Resend Mailer Error:", mailError);
      
      const isSandboxError = mailError.message && (
        mailError.message.includes("testing emails") || 
        mailError.message.includes("verify a domain")
      );

      if (isSandboxError) {
        return NextResponse.json({
          error: mailError.message,
          sandboxRestriction: true,
          verifiedEmail: "chatandewangan@gmail.com"
        }, { status: 403 });
      }

      return NextResponse.json({ error: `Mail delivery failed: ${mailError.message}` }, { status: 500 });
    }

    // Update waitlist email invite status in database to 'Sent'
    const { error: dbError } = await supabase
      .from("waitlist")
      .update({ status: "Sent" })
      .eq("email", email);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, password: tempPassword }, { status: 200 });
  } catch (error) {
    console.error("Invite API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error while sending invitation." },
      { status: 500 }
    );
  }
}
