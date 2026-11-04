// api/line-webhook.js
// ระบบแจ้งเตือนออเดอร์และยอดเงินเข้า LINE แอดมินอัตโนมัติ (Cyber Topup)

export default async function handler(req, res) {
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

  // รองรับการกด Verify จาก LINE Developers
  if (req.method === 'GET') {
    return res.status(200).send('LINE Webhook is active and running.');
  }

  try {
    const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '9cStmt35M+TLQvjPu4x03AUkf1scR00IuXaEcmtDQFfZAtkKyZTUUFYKhLCgOQL/FDvEVJ1/js9VwITmdEL8KilZN6pJdkq+FyvTuxjs2pii6irmjbJa84+7A/JG5Di+EqeazToW1wZ01oX91ItM9QdB04t89/1O/w1cDnyilFU=';
    const ADMIN_LINE_USER_ID = process.env.ADMIN_LINE_USER_ID || 'U04dd8c6f41cf65e939e9843bee1f6223';

    // กรณี LINE Developers ยิงทดสอบระบบ
    if (req.body && req.body.events !== undefined) {
      return res.status(200).json({ status: 'ok', message: 'Webhook verified' });
    }

    // ข้อมูลออเดอร์หรือการเติมเงินที่ส่งมาจากหน้าเว็บ
    const order = req.body || {};
    const orderId = order.orderId || order.id || 'ORD-' + Math.floor(10000 + Math.random() * 90000);
    const game = order.game || order.service || 'เติมเงินร้าน';
    const pkg = order.packageName || order.package || 'แพ็กเกจ';
    const price = order.price ? `฿${parseFloat(order.price).toLocaleString()}` : '-';
    const player = order.player || 'ลูกค้า';
    const gameChar = order.gameChar || order.playerId || '-';
    const paymentMethod = order.paymentMethod || 'โอนเงินธนาคาร';
    const time = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

    const notificationMessage = `🔔 มีรายการใหม่ในร้าน Cyber Topup!\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🆔 รหัสออเดอร์: ${orderId}\n` +
      `🎮 รายการ: ${game}\n` +
      `📦 แพ็กเกจ: ${pkg}\n` +
      `💰 ยอดเงิน: ${price}\n` +
      `👤 ลูกค้า: ${player}\n` +
      `🎯 ไอดีเกม/UID: ${gameChar}\n` +
      `💳 ช่องทาง: ${paymentMethod}\n` +
      `⏱️ เวลา: ${time}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `⚡ ระบบดำเนินการเรียบร้อยแล้ว`;

    // ส่งข้อความตรงเข้า LINE แอดมินทันที
    const lineResponse = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
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
      return res.status(200).json({ success: true, message: 'แจ้งเตือนเข้า LINE สำเร็จ' });
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
