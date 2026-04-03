import { Resend } from "resend";

let resend;

function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

async function sendEmail(to, subject, text) {
  try {
    const resendClient = getResend();

    await resendClient.emails.send({
      from: "GoToGo <hello@gotogocar.com>",
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error("Email send failed:", err);
  }
}

export default sendEmail;