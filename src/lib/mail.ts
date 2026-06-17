import nodemailer from 'nodemailer';

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

  const mailOptions = {
    from: `"${name} (Portfolio)" <${smtpUser}>`,
    to: 'mehmetkerem2109@gmail.com',
    replyTo: email,
    subject: `Yeni Portfolyo Mesajı: ${name}`,
    text: `Gönderen Adı: ${name}\nGönderen E-Posta: ${email}\n\nMesaj:\n${content}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="border-bottom: 2px solid #eee; padding-bottom: 10px;">Yeni Portfolyo Mesajı</h2>
        <p><strong>Gönderen Adı:</strong> ${name}</p>
        <p><strong>Gönderen E-Posta:</strong> <a href="mailto:${email}">${email}</a></p>
        <br/>
        <p><strong>Mesaj:</strong></p>
        <p style="white-space: pre-wrap; background-color: #f9f9f9; padding: 15px; border-radius: 5px; line-height: 1.6;">${content}</p>
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
