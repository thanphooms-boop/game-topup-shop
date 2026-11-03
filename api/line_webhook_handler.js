// api/line-webhook.js
// รองรับ Node.js Serverless Function บน Vercel / Netlify

export default async function handler(req, res) {
  // อนุญาต CORS ให้หน้าเว็บเรียกใช้งานได้
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // รองรับกรณีเปิดผ่าน Browser หรือ LINE Health Check
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'active', message: 'CYBER TOPUP LINE Webhook is running.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST is accepted.' });
  }

  try {
    const body = req.body || {};

    // 1. ตรวจจับกรณีเป็นการกดปุ่ม "Verify" จาก LINE Developers Console
    // LINE Developers จะส่ง { events: [] } หรือ { destination: ... } มาตรวจสอบ
    if (body.events && Array.isArray(body.events)) {
      console.log('✅ [LINE Webhook Verify Ping]: Received verify event from LINE.');
      return res.status(200).json({ success: true, message: 'Webhook verified successfully' });
    }

    // 2. ดึงข้อมูลคำสั่งซื้อจากหน้าเว็บ
    const { orderId, game, packageName, price, player, gameChar, paymentMethod, deliveredCode } = body;

    // Channel Access Token และ User ID (33 ตัวอักษร)
    const LINE_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "9cStmt35M+TLQvjPu4x03AUkf1scR00IuXaEcmtDQFfZAtkKyZTUUFYKhLCgOQL/FDvEVJ1/js9VwITmdEL8KilZN6pJdkq+FyvTuxjs2pii6irmjbJa84+7A/JG5Di+EqeazToW1wZ01oX91ItM9QdB04t89/1O/w1cDnyilFU=";
    const TARGET_USER_ID = process.env.LINE_ADMIN_USER_ID || "U04dd8c6f41cf65e939e9843bee1f6223";

    // จัดรูปแบบข้อความแจ้งเตือนเข้าแชท LINE
    const messageText = 
`🔔 [แจ้งเตือนออร์เดอร์ใหม่ 24 ชม.]
━━━━━━━━━━━━━━━━
📦 เลขที่ออร์เดอร์: ${orderId || 'ORD-' + Math.floor(10000 + Math.random() * 90000)}
🎮 เกม: ${game || '-'}
💎 แพ็กเกจ: ${packageName || '-'}
💰 ยอดเงิน: ฿${price ? Number(price).toLocaleString() : '0'}
💳 ช่องทางชำระ: ${paymentMethod || 'QR PromptPay (AUTO)'}
👤 ลูกค้า: ${player || '-'}
🎯 ตัวละคร / UID: ${gameChar || '-'}
🔑 โค้ดที่ส่งมอบ: ${deliveredCode ? deliveredCode : '(รอส่งมอบ/ยังไม่มีในสต็อก)'}
⏰ เวลา: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
━━━━━━━━━━━━━━━━
✅ ระบบตรวจสอบสลิป & ดำเนินการอัตโนมัติ`;

    // ยิง Push Message ตรงเข้า User ID ของคุณใน LINE
    const lineResponse = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_ACCESS_TOKEN.trim()}`
      },
      body: JSON.stringify({
        to: TARGET_USER_ID.trim(),
        messages: [
          {
            type: 'text',
            text: messageText
          }
        ]
      })
    });

    const result = await lineResponse.json().catch(() => ({}));

    if (!lineResponse.ok) {
      console.error('❌ [LINE API Error Details]:', result);
      return res.status(lineResponse.status).json({
        success: false,
        error: 'LINE API Rejected',
        details: result
      });
    }

    console.log('✅ [LINE Sent Success]:', result);
    return res.status(200).json({ 
      success: true, 
      message: 'LINE notification sent successfully!', 
      data: result 
    });

  } catch (error) {
    console.error('❌ [Server Error sending LINE]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
