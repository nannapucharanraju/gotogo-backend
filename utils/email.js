const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, text) {
  try {
    await resend.emails.send({
      from: "GoToGo <onboarding@resend.dev>",
      to: to,
      subject: subject,
      text: text,
    });

    console.log("Email sent to:", to);
  } catch (err) {
    console.error("Email send failed:", err);
  }
}

module.exports = sendEmail;
