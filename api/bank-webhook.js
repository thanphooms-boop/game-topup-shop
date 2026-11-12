// api/bank-webhook.js
// ระบบรับแจ้งเตือนเงินเข้าอัตโนมัติ 0% จากมือถือ Android (MacroDroid) หรือ Emulator (LINE KBank Live)
// ปลอดภัย 100%: ทำงานแบบสแตนด์บายจนกว่าจะตั้งค่า BANK_WEBHOOK_SECRET ใน Vercel Environment Variables
// รองรับการจับคู่บิลเศษสตางค์ (.01 - .99), คืนเศษสตางค์เข้ากระเป๋า Cat Coin และยิงเติมเกมเข้า WonDD ทันที

const DB_URL = 'https://cyber-topup-game-default-rtdb.asia-southeast1.firebasedatabase.app';

function extractAmountFromText(text = '') {
  const cleaned = String(text).replace(/,/g, '');
  // ตรวจจับยอดเงินที่มีทศนิยม 2 ตำแหน่ง เช่น 124.15, 124.15 บาท, +124.15
  const match = cleaned.match(/(\d+\.\d{2})/);
  return match ? Number(parseFloat(match[1]).toFixed(2)) : null;
}

function isIncomingTransfer(text = '') {
  const t = String(text);
  // ป้องกันการจับยอด "เงินออก/โอนออก"
  const outgoingKeywords = ['เงินออก', 'โอนออก', 'ถอนเงิน', 'ชำระเงิน', 'หักบัญชี'];
  if (outgoingKeywords.some((k) => t.includes(k))) return false;
  const incomingKeywords = ['เงินเข้า', 'รับโอน', 'โอนเข้า', 'รับเงิน', 'มีเงินเข้า'];
  return incomingKeywords.some((k) => t.includes(k));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Webhook-Secret');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const SECRET = process.env.BANK_WEBHOOK_SECRET;

  if (req.method === 'GET') {
    return res.status(200).json({
      status: SECRET ? 'ready' : 'standby',
      isConfigured: !!SECRET,
      message: SECRET
        ? 'ระบบรับแจ้งเตือน Android Satang Webhook (0%) พร้อมใช้งานแล้ว'
        : 'สแตนด์บายพร้อมใช้งาน (รอตั้งค่า BANK_WEBHOOK_SECRET ใน Vercel เมื่อพร้อมเชื่อม Android/MacroDroid)',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  if (!SECRET) {
    return res.status(503).json({
      success: false,
      mode: 'standby',
      message: 'ยังไม่ได้เปิดใช้งาน BANK_WEBHOOK_SECRET ใน Vercel',
    });
  }

  const providedSecret = req.headers['x-webhook-secret'] || req.body?.secret || '';
  if (providedSecret !== SECRET) {
    return res.status(401).json({ success: false, message: 'Unauthorized webhook secret' });
  }

  try {
    const { title = '', text = '', packageName = '' } = req.body || {};
    const combinedText = `${title} ${text}`.trim();

    if (!isIncomingTransfer(combinedText)) {
      return res.status(200).json({
        success: true,
        ignored: true,
        reason: 'ไม่ใช่รายการเงินเข้า (ข้ามเพื่อป้องกันการจับยอดเงินออก)',
      });
    }

    const receivedAmount = extractAmountFromText(combinedText);
    if (!receivedAmount) {
      return res.status(200).json({
        success: true,
        ignored: true,
        reason: 'ไม่พบตัวเลขยอดเงินทศนิยม 2 ตำแหน่งในข้อความแจ้งเตือน',
      });
    }

    // ค้นหาบิลสตางค์ที่รอชำระใน Firebase (/satang_bills)
    const billsResp = await fetch(`${DB_URL}/satang_bills.json`);
    const billsData = billsResp.ok ? await billsResp.json() : {};
    const now = Date.now();

    const matchedEntry = Object.entries(billsData || {}).find(([, bill]) => {
      if (!bill || bill.status !== 'pending') return false;
      if (bill.expiresAt && Number(bill.expiresAt) < now) return false;
      return Number(Number(bill.expectedAmount).toFixed(2)) === receivedAmount;
    });

    if (!matchedEntry) {
      return res.status(200).json({
        success: true,
        matched: false,
        receivedAmount,
        message: 'ไม่พบบิลสตางค์ที่รอชำระตรงกับยอดนี้',
      });
    }

    const [billKey, bill] = matchedEntry;

    // 1. อัปเดตสถานะบิลสตางค์เป็น paid
    await fetch(`${DB_URL}/satang_bills/${billKey}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'paid',
        paidAt: now,
        sourcePackage: packageName,
      }),
    });

    // 2. คืนเศษสตางค์ (.01 - .99) + โบนัส Cat Coin เข้ากระเป๋าให้สมาชิกที่ล็อกอิน
    const satangRefund = Number((receivedAmount - Math.floor(receivedAmount)).toFixed(2));
    const totalCoinAdd = Number((satangRefund + (Number(bill.catCoinReward) || 0)).toFixed(2));
    if (bill.userFirebaseKey && totalCoinAdd > 0) {
      const uResp = await fetch(`${DB_URL}/users/${bill.userFirebaseKey}/balance.json`);
      const curBal = uResp.ok ? Number(await uResp.json()) || 0 : 0;
      await fetch(`${DB_URL}/users/${bill.userFirebaseKey}/balance.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Number((curBal + totalCoinAdd).toFixed(2))),
      });
    }

    // 3. ยิงเติมเกมเข้า WonDD API อัตโนมัติ (ถ้าเป็นออเดอร์เกม)
    if (bill.orderId && bill.gameId) {
      const host = req.headers.host || 'game-topup-shop-one.vercel.app';
      await fetch(`https://${host}/api/auto-fulfillment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: bill.orderId,
          firebaseKey: bill.orderFirebaseKey || '',
          gameId: bill.gameId,
          gameName: bill.gameName || '',
          packageId: bill.packageId,
          packageName: bill.packageName || '',
          playerId: bill.playerId || '',
          zoneId: bill.zoneId || '',
          server: bill.server || '',
          price: receivedAmount,
        }),
      }).catch((e) => console.warn('[Bank Webhook] Auto-fulfillment note:', e));
    }

    return res.status(200).json({
      success: true,
      matched: true,
      billKey,
      receivedAmount,
      satangRefundToCatCoin: satangRefund,
      orderId: bill.orderId || null,
    });
  } catch (error) {
    console.error('[Bank Webhook Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
