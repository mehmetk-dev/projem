import nodemailer from 'nodemailer';

// Ziyaretçiden gelen metin e-posta HTML'ine eklenmeden önce kaçışlanır
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

export async function sendContactEmail(name: string, email: string, content: string) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 587;

  if (!smtpUser || !smtpPass) {
    console.log('SMTP user or password not configured in .env. Skipping email delivery.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const safe = { name: escapeHtml(name), email: escapeHtml(email), content: escapeHtml(content) };

  const mailOptions = {
    from: `"${name} (Portfolio)" <${smtpUser}>`,
    to: 'mehmetkerem2109@gmail.com',
    replyTo: email,
    subject: `Yeni Portfolyo Mesajı: ${name}`,
    text: `Gönderen Adı: ${name}\nGönderen E-Posta: ${email}\n\nMesaj:\n${content}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="border-bottom: 2px solid #eee; padding-bottom: 10px;">Yeni Portfolyo Mesajı</h2>
        <p><strong>Gönderen Adı:</strong> ${safe.name}</p>
        <p><strong>Gönderen E-Posta:</strong> <a href="mailto:${safe.email}">${safe.email}</a></p>
        <br/>
        <p><strong>Mesaj:</strong></p>
        <p style="white-space: pre-wrap; background-color: #f9f9f9; padding: 15px; border-radius: 5px; line-height: 1.6;">${safe.content}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Contact email sent successfully.');
  } catch (error) {
    console.error('Error sending contact email via SMTP:', error);
  }
}

/** SMTP ayarlıysa yeniden kullanılabilir taşıyıcı; değilse null */
function createNewsletterTransport() {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpUser || !smtpPass) return null;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  return {
    from: smtpUser,
    transporter: nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: smtpPort,
      secure: smtpPort === 465,
      pool: true,
      maxConnections: 1,
      auth: { user: smtpUser, pass: smtpPass },
    }),
  };
}

export interface NewsletterMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  unsubscribeUrl: string;
}

/**
 * Bülteni alıcılara tek tek gönderir (alıcılar birbirini görmez).
 * SMTP sağlayıcılarının hız sınırına takılmamak için gönderimler sıralıdır.
 */
export async function sendNewsletterMessages(messages: NewsletterMessage[]) {
  const smtp = createNewsletterTransport();
  if (!smtp) return { sent: 0, failed: messages.length, configured: false };

  let sent = 0;
  let failed = 0;
  for (const message of messages) {
    try {
      await smtp.transporter.sendMail({
        from: `"Mehmet Kerem" <${smtp.from}>`,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        list: { unsubscribe: message.unsubscribeUrl },
      });
      sent++;
    } catch (error) {
      failed++;
      console.error('Newsletter send error:', message.to, error);
    }
  }
  smtp.transporter.close();
  return { sent, failed, configured: true };
}
