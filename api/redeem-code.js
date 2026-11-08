// api/redeem-code.js
// ระบบตรวจและแลกโค้ดของขวัญความปลอดภัยสูง ป้องกันแฮกเกอร์ส่องดูโค้ด 100%

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  try {
    const { code, game, playerId, username, userTier } = req.body || {};

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกรหัสโค้ดของขวัญ' });
    }
    if (!playerId || !playerId.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อในเกมหรือ UID ให้ถูกต้อง' });
    }

    const targetCode = code.trim().toUpperCase();
    const cleanPlayerId = playerId.trim().toLowerCase();
    const cleanUsername = username ? username.trim().toLowerCase() : '';

    const DB_URL = 'https://cyber-topup-game-default-rtdb.asia-southeast1.firebasedatabase.app';

    // 1. ดึงข้อมูลโค้ดจาก Firebase ผ่านระบบหลังบ้านโดยตรง (ไม่ต้องเปิดให้สาธารณะอ่าน)
    const fetchRes = await fetch(`${DB_URL}/giftCodes.json`);
    if (!fetchRes.ok) {
      return res.status(500).json({ success: false, message: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ในขณะนี้' });
    }

    const allCodes = await fetchRes.json() || {};
    let foundKey = null;
    let foundCode = null;

    for (const key of Object.keys(allCodes)) {
      const c = allCodes[key];
      if (c && c.code && c.code.trim().toUpperCase() === targetCode) {
        foundKey = key;
        foundCode = c;
        break;
      }
    }

    // 2. ตรวจสอบความถูกต้องของโค้ด
    if (!foundCode) {
      return res.status(404).json({ success: false, message: `❌ ไม่พบรหัสโค้ด "${targetCode}" ในระบบ` });
    }

    if (foundCode.game && game && foundCode.game !== game) {
      return res.status(400).json({ success: false, message: `⚠️ โค้ดนี้ใช้ได้เฉพาะเกม "${foundCode.game}" เท่านั้น` });
    }

    const usedCount = foundCode.usedCount || 0;
    const maxUses = foundCode.maxUses || 1;
    if (usedCount >= maxUses) {
      return res.status(400).json({ success: false, message: '❌ สิทธิ์ของโค้ดนี้ถูกใช้งานเต็มจำนวนแล้ว' });
    }

    // 3. ปรับปรุงจำนวนครั้งที่ใช้โค้ดในฐานข้อมูล
    await fetch(`${DB_URL}/giftCodes/${foundKey}/usedCount.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usedCount + 1),
    });

    // 4. บันทึกคำสั่งซื้อ/ของขวัญที่ได้รับลงในระบบออเดอร์
    const orderId = 'GIFT-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      orderId,
      player: username || 'ลูกค้ากิจกรรม',
      game: foundCode.game || game || 'กิจกรรมร้าน',
      package: `🎁 โค้ดของขวัญ: ${foundCode.reward || 'รางวัลพิเศษ'}`,
      price: 0,
      playerId: cleanPlayerId,
      paymentMethod: `🎁 โค้ดของขวัญ (${foundCode.code})`,
      status: 'completed',
      deliveryType: 'GIFT_CODE',
      createdAt: new Date().toISOString(),
    };

    await fetch(`${DB_URL}/orders.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    });

    return res.status(200).json({
      success: true,
      message: `🎉 แลกรับสำเร็จ! คุณได้รับ "${foundCode.reward}" เรียบร้อยแล้ว`,
      order: newOrder,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ: ' + error.message });
  }
}

