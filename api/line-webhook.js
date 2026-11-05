// api/line-webhook.js
// ระบบแจ้งเตือนออเดอร์ และแจ้งเตือนเข้า "กลุ่มแอดมิน" เมื่อลูกค้ากด "ติดต่อแอดมิน"

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'GET') return res.status(200).send('LINE Webhook is active and running.');

  try {
    const CHANNEL_ACCESS_TOKEN =
      process.env.LINE_CHANNEL_ACCESS_TOKEN ||
      '9cStmt35M+TLQvjPu4x03AUkf1scR00IuXaEcmtDQFfZAtkKyZTUUFYKhLCgOQL/FDvEVJ1/js9VwITmdEL8KilZN6pJdkq+FyvTuxjs2pii6irmjbJa84+7A/JG5Di+EqeazToW1wZ01oX91ItM9QdB04t89/1O/w1cDnyilFU=';
    
    // ใส่รหัสกลุ่มแอดมิน หรือ User ID
    const ADMIN_TARGET_ID =
      process.env.ADMIN_LINE_GROUP_ID ||
      process.env.ADMIN_LINE_USER_ID ||
      'U04dd8c6f41cf65e939e9843bee1f6223';

    // 1. ตรวจจับเหตุการณ์จาก LINE (LINE Webhook Events)
    if (req.body && Array.isArray(req.body.events)) {
      for (const event of req.body.events) {
        if (event.type === 'message' && event.message && event.message.type === 'text') {
          const userText = (event.message.text || '').trim();
          const sourceType = event.source?.type; // 'user' หรือ 'group'

          // เช็ครหัสกลุ่ม: พิมพ์ #id ในกลุ่มแอดมิน บอทจะตอบรหัสกลุ่มออกมาทันที
          if (sourceType === 'group' && (userText === '#id' || userText === 'เช็คไอดี')) {
            const currentGroupId = event.source.groupId;
            await fetch('https://api.line.me/v2/bot/message/reply', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
              },
              body: JSON.stringify({
                replyToken: event.replyToken,
                messages: [
                  {
                    type: 'text',
                    text: `✅ รหัสกลุ่มแอดมิน (Group ID) คือ:\n${currentGroupId}`,
                  },
                ],
              }),
            });
            continue;
          }

          // กรณีลูกค้ากด "ติดต่อแอดมิน" ในแชทร้าน
          if (sourceType === 'user' && (userText.includes('ติดต่อแอดมิน') || userText === 'แอดมิน')) {
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
                to: ADMIN_TARGET_ID,
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

    // 2. แจ้งเตือนออเดอร์ใหม่จากหน้าเว็บ
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

    await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: ADMIN_TARGET_ID,
        messages: [{ type: 'text', text: notificationMessage }],
      }),
    });

    return res.status(200).json({ success: true, message: 'แจ้งเตือนสำเร็จ' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
