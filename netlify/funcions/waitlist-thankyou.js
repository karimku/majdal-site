import fetch from "node-fetch";

export async function handler(event) {
  try {
    const data = JSON.parse(event.body);

    const email =
      data.payload?.email ||
      data.payload?.data?.email;

    if (!email) {
      return {
        statusCode: 400,
        body: "No email provided",
      };
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: process.env.SENDER_EMAIL,
          name: process.env.SENDER_NAME,
        },
        to: [{ email }],
        subject: "Thank you for joining the Majdal waitlist 🤍",
        htmlContent: `
          <div style="font-family:Arial,serif;line-height:1.6">
            <h2>Thank you for being here 🤍</h2>
            <p>
              We’re currently working on our very first drop, and we truly
              appreciate you taking the time to join our waitlist.
            </p>
            <p>
              Your support means more to us than words can express.
              You’ll be the first to know when our first collection goes live.
            </p>
            <p style="margin-top:24px">
              With gratitude,<br/>
              <strong>The Majdal Team</strong>
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(err);
      return { statusCode: 500, body: "Email failed" };
    }

    return {
      statusCode: 200,
      body: "Thank you email sent",
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: "Server error",
    };
  }
}
