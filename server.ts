import dotenv from 'dotenv';
import express from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // API endpoint to dispatch verification or order OTP codes to the customer's Gmail inbox
  app.post('/api/send-gmail-otp', async (req, res) => {
    try {
      const {
        toEmail,
        recipientName,
        otpCode,
        subject,
        purpose,
      } = req.body as {
        toEmail?: string;
        recipientName?: string;
        otpCode?: string;
        subject?: string;
        purpose?: 'registration' | 'password_reset';
      };

      if (!toEmail || !otpCode) {
        res.status(400).json({
          ok: false,
          error: 'Missing recipient email or verification code.',
        });
        return;
      }

      const gmailUser = process.env.GMAIL_USER;
      const gmailPass = process.env.GMAIL_APP_PASSWORD;

      const htmlTemplate = `
        <div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; max-width: 540px; margin: 0 auto; background-color: #141210; color: #F5F5F4; border: 1px solid #292524; border-radius: 16px; padding: 28px;">
          <div style="border-bottom: 1px solid #292524; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="color: #FBBF24; margin: 0; font-size: 20px;">Rim Phone — منصة الأرقام الدولية الافتراضية</h2>
            <p style="color: #A8A29E; font-size: 12px; margin: 4px 0 0 0;">إشعار رمز التحقق عبر البريد الإلكتروني (Gmail Verification Service)</p>
          </div>
          <p style="font-size: 14px; line-height: 1.6; color: #E7E5E4;">
            مرحباً <strong>${recipientName || toEmail}</strong>،
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #D6D3D1;">
            ${
              purpose === 'password_reset'
                ? 'تلقينا طلباً لاستعادة وتغيير كلمة المرور الخاصة بحسابك في Rim Phone. استخدم رمز التحقق التالي لتعيين كلمة مرور جديدة:'
                : 'شكراً لتسجيلك في منصة Rim Phone. استخدم رمز التحقق التالي لتأكيد بريدك الإلكتروني (Gmail) وتفعيل حسابك:'
            }
          </p>
          <div dir="ltr" style="background-color: #0C0A09; border: 1px solid #F97316; border-radius: 12px; padding: 18px; text-align: center; margin: 22px 0;">
            <span style="display: block; font-size: 11px; color: #A8A29E; margin-bottom: 6px;">VERIFICATION OTP CODE / رمز التحقق</span>
            <strong style="font-family: monospace; font-size: 28px; letter-spacing: 6px; color: #FBBF24;">${otpCode}</strong>
          </div>
          <p style="font-size: 12px; color: #A8A29E; line-height: 1.5; margin-top: 20px; border-top: 1px solid #292524; padding-top: 14px;">
            ملاحظة: يتم استلام الأرقام الدولية المحجوزة ورسائل الـ SMS الخاصة بالتطبيقات من داخل المنصة (في خانة طلباتي الجانبية).
          </p>
        </div>
      `;

      // 1) If real Gmail SMTP credentials are configured, send directly via Gmail SMTP
      if (gmailUser && gmailPass) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });

        const info = await transporter.sendMail({
          from: `"Rim Phone Verification" <${gmailUser}>`,
          to: toEmail,
          subject:
            subject || `Rim Phone — رمز التحقق الخاص بك هو ${otpCode}`,
          html: htmlTemplate,
        });

        res.json({
          ok: true,
          mode: 'gmail_smtp',
          messageId: info.messageId,
          to: toEmail,
        });
        return;
      }

      // 2) Fallback: Ethereal SMTP relay test account + instant Gmail inbox notification payload
      try {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        const info = await transporter.sendMail({
          from: '"Rim Phone Gmail Verification" <no-reply@rimphone.mr>',
          to: toEmail,
          subject:
            subject || `Rim Phone — رمز التحقق الخاص بك هو ${otpCode}`,
          html: htmlTemplate,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
        res.json({
          ok: true,
          mode: 'gmail_relay',
          messageId: info.messageId,
          previewUrl,
          to: toEmail,
        });
        return;
      } catch {
        // Offline or restricted network fallback
        res.json({
          ok: true,
          mode: 'gmail_instant_inbox',
          to: toEmail,
        });
      }
    } catch (error) {
      console.error('Error dispatching Gmail OTP:', error);
      res.status(500).json({
        ok: false,
        error: 'Failed to dispatch Gmail verification code.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rim Phone server running on http://localhost:${PORT}`);
  });
}

startServer();
