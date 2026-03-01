const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('SMTP is not fully configured (SMTP_HOST/SMTP_USER/SMTP_PASS). Email notifications will be logged only.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

/**
 * Send a basic email. If SMTP is not configured, logs instead of sending.
 */
async function sendEmail({ to, subject, text, html }) {
  if (!to) {
    console.warn('sendEmail called without recipient');
    return;
  }

  const tx = getTransporter();
  const from = process.env.SMTP_FROM || 'no-reply@rideserene.com';

  // Fallback when SMTP is not configured
  if (!tx) {
    console.log('📧 [DEV] Email notification (simulated):', {
      from,
      to,
      subject,
      text,
    });
    return;
  }

  try {
    const info = await tx.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    console.log('📧 Email sent:', info.messageId);
  } catch (err) {
    console.error('❌ Error sending email:', err);
  }
}

/**
 * Send password reset email. If SMTP not configured, logs the reset link in development.
 */
async function sendPasswordResetEmail({ to, resetUrl, isChauffeur }) {
  const subject = 'Reset your password – RideSerene';
  const text = `You requested a password reset. Click the link below to set a new password:\n\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`;
  const html = `
    <p>You requested a password reset for your ${isChauffeur ? 'chauffeur' : 'customer'} account.</p>
    <p><a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:8px;">Reset password</a></p>
    <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
  `;
  await sendEmail({ to, subject, text, html });
}

module.exports = { sendEmail, sendPasswordResetEmail };

