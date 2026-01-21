// netlify/functions/waitlist-thankyou.js

exports.handler = async (event) => {
  try {
    // We only accept POST from Netlify form webhook
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ ok: false, message: "Method not allowed" }),
      };
    }

    // Netlify sends JSON for form submission webhooks
    const payload = JSON.parse(event.body || "{}");

    // Netlify form webhook email field is usually here:
    // payload.payload.data.email
    const email =
      payload?.payload?.data?.email ||
      payload?.payload?.data?.Email ||
      payload?.email;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, message: "Missing/invalid email" }),
      };
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const SENDER_EMAIL = process.env.SENDER_EMAIL;
    const SENDER_NAME = process.env.SENDER_NAME || "Majdal";

    if (!BREVO_API_KEY || !SENDER_EMAIL) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          ok: false,
          message: "Missing BREVO_API_KEY or SENDER_EMAIL env vars",
        }),
      };
    }

    const subject = "You’re on the Majdal waitlist 🤍";

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color:#1f2937;">
        <h2 style="margin:0 0 12px 0;">Thank you for signing up 🤍</h2>
        <p style="margin:0 0 10px 0;">
          From all of us at <strong>Majdal</strong>, thank you for joining our waitlist.
        </p>
        <p style="margin:0 0 10px 0;">
          Your support truly means the world to us — we’re putting a lot of love into our first drop,
          and we can’t wait to share it with you.
        </p>
        <p style="margin:0 0 14px 0;">
          We’ll email you the moment it goes live.
        </p>
        <p style="margin:0;">
          With gratitude,<br/>
          <strong>The Majdal Team</strong>
        </p>
      </div>
    `;

    const textContent =
      "Thank you for signing up.\n\n" +
      "From all of us at Majdal, thank you for joining our waitlist. " +
      "Your support truly means the world to us — we’re putting a lot of love into our first drop, " +
      "and we can’t wait to share it with you.\n\n" +
      "We’ll email you the moment it goes live.\n\n" +
      "With gratitude,\nThe Majdal Team";

    // Send email using Brevo Transactional API
    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email }],
        subject,
        htmlContent,
        textContent,
      }),
    });

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      console.error("Brevo error:", brevoRes.status, errText);
      return {
        statusCode: 502,
        body: JSON.stringify({
          ok: false,
          message: "Brevo send failed",
          status: brevoRes.status,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, emailed: email }),
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, message: "Server error" }),
    };
  }
};
