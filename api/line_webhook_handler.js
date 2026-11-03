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
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST is accepted.' });
  }

  try {
    const { orderId, game, packageName, price, player, gameChar, paymentMethod, deliveredCode } = req.body;

    // 👉 ใส่ Token และ User ID จาก LINE Developers ของคุณเรียบร้อยแล้ว
    const LINE_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "9cStmt35M+TLQvjPu4x03AUkf1scR00IuXaEcmtDQFfZAtkKyZTUUFYKhLCgOQL/FDvEVJ1/js9VwITmdEL8KilZN6pJdkq+FyvTuxjs2pii6irmjbJa84+7A/JG5Di+EqeazToW1wZ01oX91ItM9QdB04t89/1O/w1cDnyilFU=";
    const TARGET_USER_ID = process.env.LINE_ADMIN_USER_ID || "U04dd8c6f41cf65e939e9843bee1f6223";

    if (!LINE_ACCESS_TOKEN || !TARGET_USER_ID) {
      console.warn("⚠️ [LINE Webhook] ไม่พบ LINE_ACCESS_TOKEN หรือ TARGET_USER_ID กรุณาตรวจสอบการตั้งค่า");
      return res.status(400).json({ 
        success: false, 
        message: 'กรุณาใส่ LINE_CHANNEL_ACCESS_TOKEN และ TARGET_USER_ID (ขึ้นต้นด้วย U...)' 
      });
    }

    // ข้อความที่จะส่งเข้า LINE
    const messageText = 
`🔔 [แจ้งเตือนออร์เดอร์ใหม่ 24 ชม.]
━━━━━━━━━━━━━━━━
📦 เลขที่ออร์เดอร์: ${orderId || '-'}
🎮 เกม: ${game || '-'}
💎 แพ็กเกจ: ${packageName || '-'}
💰 ยอดเงิน: ฿${price ? Number(price).toLocaleString() : '0'}
💳 ช่องทางชำระ: ${paymentMethod || '-'}
👤 ลูกค้า: ${player || '-'}
🎯 ตัวละคร / UID: ${gameChar || '-'}
🔑 โค้ดที่ส่งมอบ: ${deliveredCode ? deliveredCode : '(รอส่งมอบ/ยังไม่มีในสต็อก)'}
⏰ เวลา: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
━━━━━━━━━━━━━━━━
✅ ระบบตรวจสอบสลิป & ดำเนินการอัตโนมัติ`;

    // ยิงข้อความเข้า LINE Messaging API แบบ Push Message
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

    // หาก LINE API ตอบกลับว่า Error (เช่น Token ผิด หรือ ID ผิด)
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
