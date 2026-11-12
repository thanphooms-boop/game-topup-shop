// api/auto-fulfillment.js
// เชื่อมต่อ WonDD Game TOPUP API (อ้างอิงเอกสาร game_api_003.pdf Version 0.03)
// Endpoint: https://www.wondd.com/member/bot-game.php (POST x-www-form-urlencoded)
// ปลอดภัย 100%: หากยังไม่ได้ตั้งค่า WONDD_USERNAME / WONDD_PASSWORD ใน Vercel หรือยังไม่มีรหัส packcode ของเกมนั้น
// ระบบจะส่งเข้าโหมดรอแอดมินเติมมือ (manual_pending) โดยไม่กระทบการขายหน้าเว็บ

const WONDD_API_URL = 'https://www.wondd.com/member/bot-game.php';
const DB_URL = 'https://cyber-topup-game-default-rtdb.asia-southeast1.firebasedatabase.app';

// ตารางจับคู่รหัสเกมและแพ็กเกจ WonDD (อ้างอิงตัวอย่างจากเอกสารหน้า 3 สำหรับ RoV: serviceid 9601)
// เกมอื่นๆ สามารถนำ serviceid และ packcode จาก https://www.wondd.com/member/bot-game-packlist-new.php มาเติมเพิ่มได้ทันที
const WONDD_PACK_MAP = {
  rov: {
    servicecode: '9601',
    packs: {
      r1: 'R00011',
      r2: 'R00024',
      r3: 'R00060',
      r4: 'R00110',
      r5: 'R00185',
      r6: 'R00370',
      r7: 'R00370',
      r8: 'R00620',
      r9: 'R01240',
    },
  },
};

async function postToWonDD(paramsObj) {
  const body = new URLSearchParams();
  Object.entries(paramsObj).forEach(([k, v]) => {
    if (v !== undefined && v !== null) body.append(k, String(v));
  });

  const resp = await fetch(WONDD_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const text = await resp.text();
  try {
    return { ok: resp.ok, status: resp.status, data: JSON.parse(text) };
  } catch {
    return { ok: resp.ok, status: resp.status, data: { raw: text } };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  const WONDD_USERNAME = process.env.WONDD_USERNAME || process.env.WONDD_MEMBER_ID;
  const WONDD_PASSWORD = process.env.WONDD_PASSWORD;
  const isConfigured = !!(WONDD_USERNAME && WONDD_PASSWORD);

  // GET: เช็กสถานะการเชื่อมต่อ, เช็กยอดเงิน (balance), หรือดึงราคาแพ็กเกจ (pricelist)
  if (req.method === 'GET') {
    const { action, servicecode, orderid } = req.query || {};

    if (!isConfigured) {
      return res.status(200).json({
        status: 'standby',
        isConfigured: false,
        provider: 'WonDD Game TOPUP API v0.03 (Manual Admin Standby)',
        message: 'ยังไม่ได้ตั้งค่า WONDD_USERNAME และ WONDD_PASSWORD ใน Vercel (โหมดแอดมินเติมมือทำงานปกติ)',
      });
    }

    if (action === 'balance') {
      const r = await postToWonDD({ method: 'balance', username: WONDD_USERNAME, password: WONDD_PASSWORD });
      return res.status(200).json({ success: r.data?.errorcode === '00', ...r.data });
    }

    if (action === 'pricelist' && servicecode) {
      const r = await postToWonDD({
        method: 'pricelist',
        username: WONDD_USERNAME,
        password: WONDD_PASSWORD,
        servicecode,
      });
      return res.status(200).json({ success: Array.isArray(r.data), data: r.data });
    }

    if (action === 'checkstatus' && orderid) {
      const r = await postToWonDD({
        method: 'checkstatus',
        username: WONDD_USERNAME,
        password: WONDD_PASSWORD,
        orderid,
      });
      return res.status(200).json({ success: r.data?.errorcode === '00', ...r.data });
    }

    return res.status(200).json({
      status: 'ready',
      isConfigured: true,
      provider: 'WonDD Game TOPUP API v0.03',
      endpoint: WONDD_API_URL,
      username: WONDD_USERNAME,
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
      servicecode: customServiceCode,
      packcode: customPackCode,
    } = req.body || {};

    // โหมดสแตนด์บายปลอดภัยหากยังไม่ได้ใส่ Username/Password ใน Vercel
    if (!isConfigured) {
      return res.status(200).json({
        success: true,
        mode: 'manual_pending',
        message: 'บันทึกออเดอร์เข้าคิวแอดมินเติมมือเรียบร้อย (รอตั้งค่า WONDD_USERNAME / WONDD_PASSWORD ใน Vercel)',
        orderId,
      });
    }

    const mappedGame = WONDD_PACK_MAP[gameId];
    const servicecode = customServiceCode || mappedGame?.servicecode;
    const packcode = customPackCode || mappedGame?.packs?.[packageId];

    // หากเกม/แพ็กเกจนี้ยังไม่มี servicecode หรือ packcode ให้ส่งเข้าคิวแอดมินเติมมือแทน ไม่ให้ค้าง
    if (!servicecode || !packcode) {
      return res.status(200).json({
        success: true,
        mode: 'manual_pending',
        message: `ยังไม่มีรหัสแพ็กเกจ WonDD สำหรับ ${gameName || gameId} (${packageName || packageId}) ส่งเข้าคิวแอดมินเติมมือเรียบร้อย`,
        orderId,
      });
    }

    // เรียก WonDD Method 2: topup
    const topupResp = await postToWonDD({
      method: 'topup',
      username: WONDD_USERNAME,
      password: WONDD_PASSWORD,
      servicecode,
      packcode,
      gameid: playerId || '',
      gameid2: zoneId || server || '',
      gameid3: '',
    });

    const result = topupResp.data || {};
    if (result.errorcode === '00') {
      // อัปเดตสถานะและเลข orderid ของ WonDD ลง Firebase
      if (orderId) {
        try {
          const snapshot = await fetch(`${DB_URL}/orders.json`);
          if (snapshot.ok) {
            const allOrders = await snapshot.json();
            const matchingKey = Object.keys(allOrders || {}).find((k) => allOrders[k]?.id === orderId);
            if (matchingKey) {
              await fetch(`${DB_URL}/orders/${matchingKey}.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  status: `✅ เติมเข้าไอดีเกมสำเร็จเรียบร้อยแล้ว (WonDD AUTO: ${result.orderid || ''})`,
                  wonddOrderId: result.orderid || '',
                }),
              });
            }
          }
        } catch (dbErr) {
          console.warn('[WonDD Auto] Firebase update note:', dbErr);
        }
      }

      return res.status(200).json({
        success: true,
        mode: 'auto_completed',
        message: 'ยิงคำสั่งเติมเกมผ่าน WonDD API สำเร็จเรียบร้อย!',
        wonddOrderId: result.orderid,
        providerResult: result,
      });
    }

    // กรณี Error Code จาก WonDD (E01-E09 เช่น E03 Out of credit, E09 Invalid IP Address)
    return res.status(200).json({
      success: true,
      mode: 'fallback_manual',
      message: `ส่งต่อให้แอดมินเติมมือเนื่องจาก WonDD แจ้ง [${result.errorcode || 'ERR'}]: ${result.errordetail || 'ไม่สามารถเติมอัตโนมัติได้'}`,
      providerResult: result,
    });
  } catch (error) {
    console.error('[WonDD Auto-Fulfillment Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ WonDD API: ' + error.message,
    });
  }
}
