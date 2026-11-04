// api/verify-slip.js
// ระบบตรวจสอบสลิปอัตโนมัติ เชื่อมต่อ SlipOK สำหรับร้าน Cyber Topup

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed (รองรับเฉพาะ POST)' });
  }

  try {
    const { imageBase64, expectedAmount, orderId, userId, game, packageItem, playerId } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'กรุณาแนบไฟล์รูปภาพสลิปโอนเงิน' });
    }

    // รหัสสาขา 80221 และ API Key ใหม่ล่าสุดจาก SlipOK
    const branchId = process.env.SLIPOK_BRANCH_ID || '80221';
    const apiKey = process.env.SLIPOK_API_KEY || 'SLIPOKQ4IRV70';

    let cleanBase64 = imageBase64;
    if (cleanBase64.includes(',')) {
      cleanBase64 = cleanBase64.split(',')[1];
    }

    const slipokResponse = await fetch(`https://api.slipok.com/api/line/apikey/${branchId}`, {
      method: 'POST',
      headers: {
        'x-authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: cleanBase64,
        amount: parseFloat(expectedAmount) || undefined,
      }),
    });

    const slipData = await slipokResponse.json();

    if (!slipokResponse.ok || !slipData.success) {
      const errorMessage = slipData.message || 'สลิปไม่ถูกต้อง ยอดเงินไม่ตรง หรือไม่ได้โอนเข้าบัญชีร้าน';
      return res.status(400).json({
        success: false,
        message: errorMessage,
        detail: slipData,
      });
    }

    const transaction = slipData.data || {};
    const transRef = transaction.transRef || transaction.transNo || orderId;

    return res.status(200).json({
      success: true,
      message: 'ตรวจสอบสลิปสำเร็จ ยอดเงินเข้าบัญชีเรียบร้อยแล้ว',
      data: {
        transRef: transRef,
        amount: transaction.amount,
        sender: transaction.sender?.name || 'ลูกค้า',
        receiver: transaction.receiver?.name || 'นาย ธนภูมิ รักษี',
        orderId: orderId,
        game: game,
        packageItem: packageItem,
        playerId: playerId,
        verifiedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Verify Slip Error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ SlipOK: ' + error.message,
    });
  }
}
