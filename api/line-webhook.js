export default async function handler(req, res) {
  // รับเฉพาะคำขอแบบ POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // ดึงข้อมูลที่ส่งมาจากหน้าเว็บ React
  const { game, package: pkg, price, customerId } = req.body;

  // ดึงค่า Token และ User ID จาก Vercel Environment Variables
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const adminId = process.env.ADMIN_LINE_USER_ID;

  // จัดรูปแบบข้อความแจ้งเตือน
  const messageText = `🟢 [ CYBER TOPUP - แจ้งเตือนทดลอง ]\n🎮 เกม: ${game || 'VALORANT'}\n📦 แพ็กเกจ: ${pkg || '1,000 VP'}\n💰 ยอดเงิน: ${price || '300'} บาท\n🆔 บัญชีลูกค้า: ${customerId || 'DemoUser123'}\n⏳ สถานะ: ทดสอบระบบสำเร็จ!`;

  try {
    // ยิง Push Message ตรงไปที่ LINE ของคุณ
    const lineRes = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        to: adminId,
        messages: [{ type: 'text', text: messageText }]
      })
    });

    if (lineRes.ok) {
      return res.status(200).json({ success: true, message: 'Send LINE Success!' });
    } else {
      const errData = await lineRes.json();
      return res.status(500).json({ success: false, error: errData });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
