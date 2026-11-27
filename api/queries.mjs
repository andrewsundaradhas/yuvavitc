
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { message, email, website } = req.body || {};

    // Honeypot spam protection
    if (website) {
      return res.status(200).json({ success: true });
    }

    // Validate message
    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 600
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid message",
      });
    }

    // Validate optional email
    if (
      email &&
      (typeof email !== "string" ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    if (!process.env.RESEND_API_KEY) {
      throw new Error("Resend API key is missing");
    }

    const { data, error } = await resend.emails.send({
      from: "YUVA Website <onboarding@resend.dev>",
      to: ["yuvavitc@gmail.com"],
      replyTo: email || undefined,
      subject: "New Query - YUVA VIT Chennai Website",
      text: `
New query received!

Visitor Email: ${email || "Not provided"}

Message:
${message.trim()}

Received At: ${new Date().toISOString()}
      `,
    });

    if (error) {
      console.error("Resend error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to send email",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Query sent successfully",
      id: data.id,
    });

  } catch (error) {
    console.error("API error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}
