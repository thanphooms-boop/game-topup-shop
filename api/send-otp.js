// api/send-otp.js
// ระบบส่งรหัส OTP 6 หลักเข้าอีเมลลูกค้าจริง สำหรับการกู้คืนรหัสผ่าน (MEOW TOPUP)
// รองรับทั้ง Google Apps Script (ฟรีผ่าน Gmail), Brevo API (ฟรี 300 ฉบับ/วัน) และ Resend API (ไม่ต้องลงแพ็กเกจเสริม)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { email, username, otp } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน (ต้องมีอีเมลและรหัส OTP)' });
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const GOOGLE_SCRIPT_EMAIL_URL = process.env.GOOGLE_SCRIPT_EMAIL_URL;
    const SENDER_EMAIL = process.env.SENDER_EMAIL || 'thanphooms@gmail.com';
    const SENDER_NAME = 'MEOW TOPUP';

    const subject = `[MEOW TOPUP] รหัส OTP สำหรับเปลี่ยนรหัสผ่าน: ${otp}`;
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; border-radius: 16px; padding: 28px; border: 1.5px solid #9333ea;">
        <div style="text-align: center; margin-bottom: 18px;">
          <h2 style="margin: 0; color: #c084fc; font-size: 22px;">🐱 MEOW TOPUP</h2>
          <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;">คำขอตั้งรหัสผ่านใหม่ (Forgot Password)</p>
        </div>
        <div style="background-color: #1e293b; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #334155;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #e2e8f0;">
            สวัสดีคุณ <b>${username || 'ลูกค้า'}</b>, รหัสยืนยัน OTP 6 หลักของคุณคือ:
          </p>
          <div style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; background-color: #020617; padding: 14px 10px; border-radius: 10px; border: 1.5px dashed #38bdf8; display: inline-block; margin: 8px 0;">
            ${otp}
          </div>
          <p style="margin: 12px 0 0 0; font-size: 12px; color: #fbbf24;">
            ⏳ รหัสนี้มีอายุการใช้งาน 5 นาที (จำกัดการเปลี่ยนรหัสผ่าน 1 ครั้ง/วัน)
          </p>
        </div>
        <p style="margin: 18px 0 0 0; font-size: 11px; color: #64748b; text-align: center; line-height: 1.5;">
          หากคุณไม่ได้เป็นผู้ทำรายการ กรุณาเพิกเฉยต่ออีเมลนี้และห้ามส่งรหัสนี้ให้ผู้อื่นโดยเด็ดขาด
        </p>
      </div>
    `;

    // 1. กรณีใช้ Google Apps Script (ส่งฟรีจาก Gmail ร้านโดยตรง)
    if (GOOGLE_SCRIPT_EMAIL_URL) {
      const gsRes = await fetch(GOOGLE_SCRIPT_EMAIL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, subject, html: htmlContent, otp, username })
      });
      if (gsRes.ok) {
        return res.status(200).json({ success: true, provider: 'gmail_apps_script', message: 'ส่งรหัส OTP ไปยังอีเมลเรียบร้อยแล้ว' });
      }
    }

    // 2. กรณีใช้ Brevo API (ฟรี 300 ฉบับ/วัน ส่งเข้าอีเมลลูกค้าได้ทุกเจ้า)
    if (BREVO_API_KEY) {
      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: SENDER_NAME, email: SENDER_EMAIL },
          to: [{ email, name: username || email }],
          subject,
          htmlContent
        })
      });
      const brevoData = await brevoRes.json().catch(() => ({}));
      if (brevoRes.ok) {
        return res.status(200).json({ success: true, provider: 'brevo', message: 'ส่งรหัส OTP ไปยังอีเมลเรียบร้อยแล้ว' });
      }
      return res.status(400).json({ success: false, message: 'ส่งอีเมลไม่สำเร็จ: ' + (brevoData.message || 'Brevo Error') });
    }

    // 3. กรณีใช้ Resend API
    if (RESEND_API_KEY) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${SENDER_NAME} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
          to: [email],
          subject,
          html: htmlContent
        })
      });
      const resendData = await resendRes.json().catch(() => ({}));
      if (resendRes.ok) {
        return res.status(200).json({ success: true, provider: 'resend', message: 'ส่งรหัส OTP ไปยังอีเมลเรียบร้อยแล้ว' });
      }
      return res.status(400).json({ success: false, message: 'ส่งอีเมลไม่สำเร็จ: ' + (resendData.message || 'Resend Error') });
    }

    // 4. กรณียังไม่ได้ตั้งค่าตัวแปรส่งอีเมลใน Vercel
    return res.status(400).json({
      success: false,
      notConfigured: true,
      message: 'ยังไม่ได้ตั้งค่าระบบส่งอีเมลใน Vercel (กรุณาเพิ่ม BREVO_API_KEY หรือ GOOGLE_SCRIPT_EMAIL_URL ใน Environment Variables)'
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการส่งอีเมล OTP: ' + error.message
    });
  }
}
