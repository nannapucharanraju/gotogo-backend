const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS instead of SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function sendEmail(to, subject, text) {
  await transporter.sendMail({
    from: '"GoToGo" <verify@gotogocar.com>',
    to,
    subject,
    text,
  });
}

module.exports = sendEmail;
