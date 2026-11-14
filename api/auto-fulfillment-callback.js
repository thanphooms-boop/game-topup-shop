// api/auto-fulfillment-callback.js
// รับ Callback สถานะการเติมเกมจาก WonDD (Method 5 ในเอกสาร game_api_003.pdf)
// พารามิเตอร์ที่ WonDD ส่งมา: orderid, status (process | complete | fail), remark

const DB_URL = 'https://cyber-topup-game-default-rtdb.asia-southeast1.firebasedatabase.app';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const source = req.method === 'GET' ? (req.query || {}) : { ...(req.query || {}), ...(req.body || {}) };
    const orderid = String(source.orderid || '').trim();
    const status = String(source.status || '').trim().toLowerCase();
    const remark = String(source.remark || '').trim();

    if (!orderid) {
      return res.status(400).json({ success: false, message: 'Missing orderid' });
    }

    let mappedStatus = '⏳ กำลังดำเนินการเติมเกม (WonDD Processing)';
    if (status === 'complete') {
      mappedStatus = `✅ เติมเข้าไอดีเกมสำเร็จเรียบร้อยแล้ว (WonDD: ${orderid})`;
    } else if (status === 'fail') {
      mappedStatus = `⚠️ เติมไม่สำเร็จ รอแอดมินตรวจสอบ (${remark || orderid})`;
    }

    const snapshot = await fetch(`${DB_URL}/orders.json`);
    if (snapshot.ok) {
      const allOrders = await snapshot.json();
      const matchingKey = Object.keys(allOrders || {}).find(
        (k) => allOrders[k]?.wonddOrderId === orderid || allOrders[k]?.id === orderid
      );
      if (matchingKey) {
        await fetch(`${DB_URL}/orders/${matchingKey}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: mappedStatus,
            wonddCallbackStatus: status,
            wonddCallbackRemark: remark,
          }),
        });
      }
    }

    return res.status(200).json({ success: true, orderid, status });
  } catch (err) {
    console.error('[WonDD Callback Error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
