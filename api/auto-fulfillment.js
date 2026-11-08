// api/auto-fulfillment.js
// ระบบเตรียมพร้อมเชื่อมต่อ API บอทเติมเกมอัตโนมัติ 100% (Game Top-up Provider Gateway)
// รองรับการต่อ API จากผู้ให้บริการราคาส่ง (LnwTrue, SEAGM, SmileOne, UniPin ฯลฯ)
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
    const hasApiKey = !!process.env.GAME_PROVIDER_API_KEY;
    const providerName = process.env.GAME_PROVIDER_NAME || 'ยังไม่ได้ตั้งค่าผู้ให้บริการ (Manual Admin Mode)';

    return res.status(200).json({
      status: 'ready',
      message: 'ระบบ Auto-Fulfillment API สแตนด์บายพร้อมใช้งาน',
      provider: providerName,
      isConfigured: hasApiKey,
      instructions: hasApiKey
        ? 'พร้อมยิงคำสั่งเติมเกมอัตโนมัติ 100%'
        : 'ขณะนี้อยู่ในโหมดแอดมินเติมมือ เมื่อมี API Key ให้เพิ่มใน Vercel Environment Variables: GAME_PROVIDER_API_KEY และ GAME_PROVIDER_SECRET'
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

    const API_KEY = process.env.GAME_PROVIDER_API_KEY;
    const API_SECRET = process.env.GAME_PROVIDER_SECRET;
    const PROVIDER_ENDPOINT = process.env.GAME_PROVIDER_ENDPOINT; // เช่น https://api.provider.com/v1/order

    const DB_URL = 'https://cyber-topup-game-default-rtdb.asia-southeast1.firebasedatabase.app';

    // กรณีที่ยังไม่ได้ตั้งค่า API Key จากผู้ให้บริการจริง (โหมดเตรียมพร้อม)
    if (!API_KEY || !PROVIDER_ENDPOINT) {
      console.log(`[Auto-Fulfillment] ออเดอร์ ${orderId} (${gameName}): ยังไม่มี API Key ระบบจัดส่งเข้าคิวแอดมินเติมมือตามปกติ`);

      return res.status(200).json({
        success: true,
        mode: 'manual_pending',
        message: 'บันทึกออเดอร์เข้าคิวแอดมินเติมมือเรียบร้อย (ระบบพร้อมเชื่อมต่อ API ทันทีเมื่อใส่คีย์)',
        orderId: orderId,
        detail: {
          game: gameName,
          package: packageName,
          player: playerId,
          server: server || '-'
        }
      });
    }

    // กรณีที่มี API Key จากผู้ให้บริการแล้ว: ทำการยิงคำสั่งซื้ออัตโนมัติ 100%
    console.log(`[Auto-Fulfillment] กำลังยิง API อัตโนมัติไปยังผู้ให้บริการสำหรับออเดอร์: ${orderId}`);

    const payload = {
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
        'Authorization': `Bearer ${API_KEY}`,
        'X-API-Secret': API_SECRET || ''
      },
      body: JSON.stringify(payload)
    });

    const result = await providerResponse.json().catch(() => ({}));

    if (providerResponse.ok && (result.success || result.status === 'success' || result.code === 200)) {
      // ผู้ให้บริการเติมสำเร็จทันที -> อัปเดต Firebase ให้ลูกค้าเป็น "✅ เติมเข้าเกมสำเร็จแล้ว (AUTO 100%)"
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
        message: 'ยิงบอทเติมเกมอัตโนมัติสำเร็จเรียบร้อยแล้ว!',
        providerResult: result
      });
    } else {
      // หากทางผู้ให้บริการแจ้งยอดเงินสำรองหมดหรือติดขัด -> ส่งเข้าคิวแอดมินเติมมือแทนทันที ไม่ทำให้ออเดอร์สูญหาย
      console.warn('[Auto-Fulfillment] Provider error, falling back to manual admin:', result);
      return res.status(200).json({
        success: true,
        mode: 'fallback_manual',
        message: 'ระบบส่งต่อให้แอดมินดูแลเติมมือแทนเนื่องจากเซิร์ฟเวอร์ผู้ให้บริการติดขัด',
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
