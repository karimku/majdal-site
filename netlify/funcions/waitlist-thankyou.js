export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const SENDER_EMAIL = process.env.SENDER_EMAIL;
  const SENDER_NAME = process.env.SENDER_NAME || "The Majdal Team";

  if (!BREVO_API_KEY || !SENDER_EMAIL) {
    return { statusCode: 500, body: "Missing environment variables." };
  }

  let data = {};
  try {
    data = JSON.parse(event.body || "{}");
  } catch {}

  const email =
    data?.payload?.data?.email ||
    data?.data?.email ||
    data?.email;

  if (!email) {
    return { statusCode: 200, body: "No email found." };
  }

  const subject = "Welcome to Majdal — you’re on the list 🤍";

  const htmlContent = `
    <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6">
      <p>Hi there,</p>
      <p><strong>Thank you for joining the Majdal waitlist.</strong></p>
      <p>
        We are currently working on our first ever drop, and your support at this early
        stage genuinely means everything to us.
      </p>
      <p>You’ll be the first to know the moment our first drop goes live.</p>
      <p>
        With gratitude,<br>
        <strong>${SENDER_NAME}</strong> 🤍
      </p>
    </div>
  `;

  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: SENDER_EMAIL, name: SENDER_NAME },
      to: [{ email }],
      subject,
      htmlContent,
    }),
  });

  return { statusCode: 200, body: "OK" };
}
