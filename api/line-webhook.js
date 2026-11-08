// api/line-webhook.js
// ระบบแจ้งเตือนออเดอร์ และแจ้งเตือนเข้า "กลุ่มแอดมิน" เมื่อลูกค้ากด "ติดต่อแอดมิน" สำหรับร้าน Cyber Topup

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method === 'GET') {
    const url = new URL(req.url, 'http://localhost');
    if (url.searchParams.get('test') === '1') {
      try {
        const CHANNEL_ACCESS_TOKEN =
          process.env.LINE_CHANNEL_ACCESS_TOKEN ||
          '9cStmt35M+TLQvjPu4x03AUkf1scR00IuXaEcmtDQFfZAtkKyZTUUFYKhLCgOQL/FDvEVJ1/js9VwITmdEL8KilZN6pJdkq+FyvTuxjs2pii6irmjbJa84+7A/JG5Di+EqeazToW1wZ01oX91ItM9QdB04t89/1O/w1cDnyilFU=';
        const ADMIN_GROUP_ID =
          process.env.ADMIN_LINE_GROUP_ID ||
          process.env.ADMIN_LINE_USER_ID ||
          'Cdb2e928ae1941ef9f45380b4ef386387';

        const testRes = await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            to: ADMIN_GROUP_ID,
            messages: [{ type: 'text', text: '🔔 ทดสอบการเชื่อมต่อ LINE Webhook สำเร็จเรียบร้อย! ระบบแจ้งเตือนพร้อมใช้งาน 100%' }],
          }),
        });

        const testData = await testRes.json().catch(() => ({}));
        if (!testRes.ok) {
          return res.status(testRes.status).json({
            success: false,
            message: 'LINE API Error: ' + (testData.message || JSON.stringify(testData)),
            status: testRes.status,
            debug: { targetId: ADMIN_GROUP_ID, hasToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN }
          });
        }
        return res.status(200).json({ success: true, message: 'ส่งข้อความทดสอบเข้า LINE สำเร็จเรียบร้อยแล้ว!' });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }
    return res.status(200).send('LINE Webhook is active and running. (เข้า /api/line-webhook?test=1 เพื่อทดสอบยิงข้อความ)');
  }

  try {
    const CHANNEL_ACCESS_TOKEN =
      process.env.LINE_CHANNEL_ACCESS_TOKEN ||
      '9cStmt35M+TLQvjPu4x03AUkf1scR00IuXaEcmtDQFfZAtkKyZTUUFYKhLCgOQL/FDvEVJ1/js9VwITmdEL8KilZN6pJdkq+FyvTuxjs2pii6irmjbJa84+7A/JG5Di+EqeazToW1wZ01oX91ItM9QdB04t89/1O/w1cDnyilFU=';

    // รหัสกลุ่มแอดมิน [ALERT] ติดต่อแอดมิน CYBER TOPUP
    const ADMIN_GROUP_ID =
      process.env.ADMIN_LINE_GROUP_ID ||
      process.env.ADMIN_LINE_USER_ID ||
      'Cdb2e928ae1941ef9f45380b4ef386387';

    // 1. ตรวจจับเหตุการณ์จาก LINE (LINE Webhook Events)
    if (req.body && Array.isArray(req.body.events)) {
      for (const event of req.body.events) {
        if (event.type === 'message' && event.message && event.message.type === 'text') {
          const userText = (event.message.text || '').trim();
          const sourceType = event.source?.type; // 'user' หรือ 'group'

          // กรณีลูกค้ากด "ติดต่อแอดมิน" ในห้องแชทของร้าน (sourceType === 'user')
          if (sourceType === 'user' && (userText.includes('ติดต่อแอดมิน') || userText === 'แอดมิน')) {
            const time = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
            const userId = event.source?.userId;

            // ดึงชื่อโปรไฟล์ LINE ของลูกค้าอัตโนมัติ
            let customerName = 'ลูกค้า';
            if (userId) {
              try {
                const profileRes = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
                  headers: {
                    Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
                  },
                });
                if (profileRes.ok) {
                  const profileData = await profileRes.json();
                  customerName = profileData.displayName || 'ลูกค้า';
                }
              } catch (profileErr) {
                console.error('Fetch profile error:', profileErr);
              }
            }

            const alertGroupMsg =
              `🚨 [มีลูกค้าติดต่อแอดมิน!]\n` +
              `━━━━━━━━━━━━━━━━━━━━\n` +
              `👤 ลูกค้า: คุณ ${customerName}\n` +
              `⏰ เวลา: ${time}\n` +
              `💬 ข้อความลูกค้า: "${userText}"\n\n` +
              `💻 ตอบแชทบนคอม: https://chat.line.biz/\n` +
              `📱 ตอบแชทบนมือถือ: เปิดแอป LINE Official Account\n` +
              `━━━━━━━━━━━━━━━━━━━━`;

            // ยิงแจ้งเตือนพร้อมเสียงเข้ากลุ่มแอดมินทันที
            await fetch('https://api.line.me/v2/bot/message/push', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
              },
              body: JSON.stringify({
                to: ADMIN_GROUP_ID,
                messages: [
                  {
                    type: 'text',
                    text: alertGroupMsg,
                  },
                ],
              }),
            });
          }
        }
      }
      return res.status(200).json({ status: 'ok', message: 'Events processed' });
    }

    // 2. แจ้งเตือนออเดอร์ใหม่จากหน้าเว็บไซต์
    const order = req.body || {};
    const orderId = order.orderId || order.id || 'ORD-' + Math.floor(10000 + Math.random() * 90000);
    const game = order.game || order.service || 'เติมเงินร้าน';
    const pkg = order.packageName || order.package || 'แพ็กเกจ';
    const price = order.price ? `฿${parseFloat(order.price).toLocaleString()}` : '-';
    const player = order.player || 'ลูกค้า';
    const gameChar = order.gameChar || order.playerId || '-';
    const paymentMethod = order.paymentMethod || 'โอนเงินธนาคาร';
    const time = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
    const truemoneyCardText = order.truemoneyCard
      ? `🎟️ รหัสบัตรทรูมันนี่ 14 หลัก: ${order.truemoneyCard}\n` + (order.feeAmount ? `🏷️ ค่าธรรมเนียมบัตร (+${order.feePercent || 0}%): +฿${order.feeAmount}\n` : '')
      : '';

    const isWalletTopup = order.type === 'wallet' || (game && game.includes('เติมเครดิต'));

    const notificationMessage = isWalletTopup
      ? `💰 มีรายการเติมเครดิตร้านใหม่ (Cyber Wallet)!\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🆔 รหัสออเดอร์: ${orderId}\n` +
        `👤 บัญชีลูกค้า: ${player}\n` +
        `💵 จำนวนเงินที่เติม: ${price}\n` +
        `💳 ช่องทาง: ${paymentMethod}\n` +
        truemoneyCardText +
        `📌 สถานะ: ${order.status || 'เติมเครดิตสำเร็จ'}\n` +
        `⏱️ เวลา: ${time}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `⚡ ยอดเงินเข้าบัญชีร้านเรียบร้อยแล้ว`
      : `🔔 มีรายการออเดอร์ใหม่!\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🆔 รหัสออเดอร์: ${orderId}\n` +
        `🎮 รายการ: ${game}\n` +
        `📦 แพ็กเกจ: ${pkg}\n` +
        `💰 ยอดเงิน: ${price}\n` +
        `👤 ลูกค้า: ${player}\n` +
        `🎯 UID/ไอดีเกม: ${gameChar}\n` +
        `💳 ช่องทาง: ${paymentMethod}\n` +
        truemoneyCardText +
        (order.catCoinGiftAlert ? `🎁 ของขวัญ: ${order.catCoinGiftAlert}\n` : '') +
        `⏱️ เวลา: ${time}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `⚡ ระบบกำลังดำเนินการ`;

    const lineRes = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: ADMIN_GROUP_ID,
        messages: [{ type: 'text', text: notificationMessage }],
      }),
    });

    const lineData = await lineRes.json().catch(() => ({}));
    if (!lineRes.ok) {
      console.error('LINE Push Error:', lineRes.status, lineData);
      return res.status(lineRes.status).json({
        success: false,
        message: 'LINE API ส่งไม่ผ่าน: ' + (lineData.message || JSON.stringify(lineData)),
        errorDetail: lineData,
        targetId: ADMIN_GROUP_ID
      });
    }

    return res.status(200).json({ success: true, message: 'แจ้งเตือนสำเร็จ' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
