const nodemailer = require('nodemailer');

// Use Gmail SMTP with App Password
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMail({ to, subject, html, text }) {
  const info = await transporter.sendMail({
    from: `AI Kannada <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
  return info;
}

module.exports = { transporter, sendMail };
