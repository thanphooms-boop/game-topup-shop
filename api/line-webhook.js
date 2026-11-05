// api/line-webhook.js
// ระบบแจ้งเตือนออเดอร์ และแจ้งเตือนเมื่อลูกค้ากด "ติดต่อแอดมิน" สำหรับร้าน Cyber Topup

export default async function handler(req, res) {
  // CORS Headers
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

  // รองรับการกด Verify จากหน้า LINE Developers Console
  if (req.method === 'GET') {
    return res.status(200).send('LINE Webhook is active and running.');
  }

  try {
    const CHANNEL_ACCESS_TOKEN =
      process.env.LINE_CHANNEL_ACCESS_TOKEN ||
      '9cStmt35M+TLQvjPu4x03AUkf1scR00IuXaEcmtDQFfZAtkKyZTUUFYKhLCgOQL/FDvEVJ1/js9VwITmdEL8KilZN6pJdkq+FyvTuxjs2pii6irmjbJa84+7A/JG5Di+EqeazToW1wZ01oX91ItM9QdB04t89/1O/w1cDnyilFU=';
    const ADMIN_LINE_USER_ID =
      process.env.ADMIN_LINE_USER_ID || 'U04dd8c6f41cf65e939e9843bee1f6223';

    // 1. ตรวจจับข้อความจากลูกค้าใน LINE (LINE Webhook Events)
    if (req.body && Array.isArray(req.body.events)) {
      for (const event of req.body.events) {
        if (event.type === 'message' && event.message && event.message.type === 'text') {
          const userText = (event.message.text || '').trim();

          // เด้งเตือนเฉพาะกรณีที่ลูกค้ากด "ติดต่อแอดมิน" หรือพิมพ์หาแอดมิน
          if (userText.includes('ติดต่อแอดมิน') || userText === 'แอดมิน') {
            const time = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

            const alertAdminMsg =
              `🚨 [แจ้งเตือน: มีลูกค้าติดต่อแอดมิน!]\n` +
              `━━━━━━━━━━━━━━━━━━━━\n` +
              `⏰ เวลา: ${time}\n` +
              `💬 ลูกค้ากด: "${userText}"\n\n` +
              `👉 คลิกเพื่อเข้าตอบแชทลูกค้าได้ทันที:\n` +
              `https://chat.line.biz/\n` +
              `━━━━━━━━━━━━━━━━━━━━`;

            await fetch('https://api.line.me/v2/bot/message/push', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
              },
              body: JSON.stringify({
                to: ADMIN_LINE_USER_ID,
                messages: [
                  {
                    type: 'text',
                    text: alertAdminMsg,
                  },
                ],
              }),
            });
          }
        }
      }
      return res.status(200).json({ status: 'ok', message: 'Events processed' });
    }

    // 2. กรณีหน้าเว็บส่งข้อมูลรายการสั่งซื้อ/เติมเงินมาแจ้งเตือน
    const order = req.body || {};
    const orderId = order.orderId || order.id || 'ORD-' + Math.floor(10000 + Math.random() * 90000);
    const game = order.game || order.service || 'เติมเงินร้าน';
    const pkg = order.packageName || order.package || 'แพ็กเกจ';
    const price = order.price ? `฿${parseFloat(order.price).toLocaleString()}` : '-';
    const player = order.player || 'ลูกค้า';
    const gameChar = order.gameChar || order.playerId || '-';
    const paymentMethod = order.paymentMethod || 'โอนเงินธนาคาร';
    const time = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

    const notificationMessage =
      `🔔 มีรายการออเดอร์ใหม่!\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🆔 รหัสออเดอร์: ${orderId}\n` +
      `🎮 รายการ: ${game}\n` +
      `📦 แพ็กเกจ: ${pkg}\n` +
      `💰 ยอดเงิน: ${price}\n` +
      `👤 ลูกค้า: ${player}\n` +
      `🎯 UID/ไอดีเกม: ${gameChar}\n` +
      `💳 ช่องทาง: ${paymentMethod}\n` +
      `⏱️ เวลา: ${time}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `⚡ ระบบกำลังดำเนินการ`;

    const lineResponse = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: ADMIN_LINE_USER_ID,
        messages: [
          {
            type: 'text',
            text: notificationMessage,
          },
        ],
      }),
    });

    if (lineResponse.ok) {
      return res.status(200).json({ success: true, message: 'แจ้งเตือนไปยัง LINE แอดมินสำเร็จ' });
    } else {
      const errText = await lineResponse.text();
      console.error('LINE Push Error:', errText);
      return res.status(500).json({ success: false, error: errText });
    }
  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
