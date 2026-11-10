// api/auto-fulfillment.js
// ระบบเตรียมพร้อมเชื่อมต่อ API บอทเติมเกมอัตโนมัติ 100% (Game Top-up Provider Gateway)
// รองรับการต่อ API จาก WonDD (Member: Thanphoom) และผู้ให้บริการราคาส่งอื่นๆ
// ปลอดภัย 100%: หากยังไม่ได้ใส่ API Key จริง ระบบจะบันทึกสถานะรอแอดมินเติมมือโดยอัตโนมัติ ไม่กระทบระบบเดิม

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  // รองรับ GET เพื่อเช็กสถานะการเชื่อมต่อบอท API
  if (req.method === 'GET') {
    const hasApiKey = !!process.env.WONDD_API_KEY || !!process.env.GAME_PROVIDER_API_KEY;
    const providerName = process.env.WONDD_API_KEY ? 'WonDD API Gateway (Thanphoom)' : (process.env.GAME_PROVIDER_NAME || 'ยังไม่ได้ตั้งค่า API Key (Manual Admin Mode)');

    return res.status(200).json({
      status: 'ready',
      message: 'ระบบ Auto-Fulfillment API สแตนด์บายพร้อมใช้งาน',
      provider: providerName,
      isConfigured: hasApiKey,
      instructions: hasApiKey
        ? 'พร้อมยิงคำสั่งเติมเกมอัตโนมัติ 100% ผ่าน WonDD API'
        : 'ขณะนี้อยู่ในโหมดแอดมินเติมมือ เมื่อแอดมิน WonDD ส่ง API Key มา ให้เพิ่มใน Vercel: WONDD_API_KEY, WONDD_API_SECRET และ WONDD_MEMBER_ID (Thanphoom)'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const {
      orderId,
      gameId,
      gameName,
      packageId,
      packageName,
      playerId,
      zoneId,
      server,
      price,
      customerContact
    } = req.body || {};

    const WONDD_KEY = process.env.WONDD_API_KEY || process.env.GAME_PROVIDER_API_KEY;
    const WONDD_SECRET = process.env.WONDD_API_SECRET || process.env.GAME_PROVIDER_SECRET;
    const WONDD_MEMBER_ID = process.env.WONDD_MEMBER_ID || 'Thanphoom';
    const PROVIDER_ENDPOINT = process.env.WONDD_API_ENDPOINT || process.env.GAME_PROVIDER_ENDPOINT;

    const DB_URL = 'https://cyber-topup-game-default-rtdb.asia-southeast1.firebasedatabase.app';

    // กรณีที่ยังไม่ได้ตั้งค่า API Key จาก WonDD (โหมดสแตนด์บายปลอดภัย 100%)
    if (!WONDD_KEY || !PROVIDER_ENDPOINT) {
      console.log(`[Auto-Fulfillment] ออเดอร์ ${orderId} (${gameName}): ยังไม่ได้ใส่ API Key จาก WonDD จัดส่งเข้าคิวแอดมินดูแลเติมมือตามปกติ`);

      return res.status(200).json({
        success: true,
        mode: 'manual_pending',
        message: 'บันทึกออเดอร์เข้าคิวแอดมินเติมมือเรียบร้อย (ระบบพร้อมยิง API อัตโนมัติทันทีเมื่อแอดมิน WonDD ส่งคีย์มา)',
        orderId: orderId,
        detail: {
          game: gameName,
          package: packageName,
          player: playerId,
          server: server || '-'
        }
      });
    }

    // กรณีที่มี API Key จาก WonDD เรียบร้อยแล้ว: ยิงคำสั่งซื้ออัตโนมัติ 100%
    console.log(`[Auto-Fulfillment] กำลังยิง API อัตโนมัติไปยัง WonDD สำหรับออเดอร์: ${orderId}`);

    const payload = {
      member_id: WONDD_MEMBER_ID,
      api_key: WONDD_KEY,
      order_id: orderId,
      game_code: gameId,
      package_code: packageId,
      player_id: playerId,
      server_id: server || zoneId || '',
      callback_url: 'https://game-topup-shop-one.vercel.app/api/auto-fulfillment-callback'
    };

    const providerResponse = await fetch(PROVIDER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WONDD_KEY}`,
        'X-API-Secret': WONDD_SECRET || ''
      },
      body: JSON.stringify(payload)
    });

    const result = await providerResponse.json().catch(() => ({}));

    if (providerResponse.ok && (result.success || result.status === 'success' || result.code === 200 || result.status_code === '00')) {
      // WonDD เติมสำเร็จทันที -> อัปเดตสถานะใน Firebase ให้ลูกค้าเห็นว่า "✅ เติมเข้าเกมสำเร็จแล้ว (AUTO 100%)"
      if (orderId) {
        try {
          const snapshot = await fetch(`${DB_URL}/orders.json`);
          if (snapshot.ok) {
            const allOrders = await snapshot.json();
            const matchingKey = Object.keys(allOrders || {}).find(k => allOrders[k]?.id === orderId);
            if (matchingKey) {
              await fetch(`${DB_URL}/orders/${matchingKey}/status.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify('✅ เติมเข้าไอดีเกมสำเร็จเรียบร้อยแล้ว (AUTO 100%)')
              });
            }
          }
        } catch (dbErr) {
          console.warn('Auto status update note:', dbErr);
        }
      }

      return res.status(200).json({
        success: true,
        mode: 'auto_completed',
        message: 'ยิงบอทเติมเกมผ่าน WonDD อัตโนมัติสำเร็จเรียบร้อยแล้ว!',
        providerResult: result
      });
    } else {
      // หากเครดิตใน WonDD ไม่พอ หรือระบบเกมปิดปรับปรุง -> ส่งเข้าคิวแอดมินเติมมือแทนทันที เงินไม่หาย ออเดอร์ไม่หลุด
      console.warn('[Auto-Fulfillment] WonDD provider response warning, falling back to manual admin:', result);
      return res.status(200).json({
        success: true,
        mode: 'fallback_manual',
        message: 'ระบบส่งต่อให้แอดมินดูแลเติมมือแทนเนื่องจากเซิร์ฟเวอร์ WonDD แจ้งว่า: ' + (result.message || 'ติดขัดชั่วคราว'),
        errorDetail: result
      });
    }
  } catch (error) {
    console.error('[Auto-Fulfillment Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการประมวลผล: ' + error.message
    });
  }
}
