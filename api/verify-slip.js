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
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed (รองรับเฉพาะ POST)' });
  }

  try {
    const { imageBase64, expectedAmount, orderId, userId, game, packageItem, playerId } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'กรุณาแนบไฟล์รูปภาพสลิปโอนเงิน' });
    }

    const branchId = process.env.SLIPOK_BRANCH_ID || '80221';
    const apiKey = process.env.SLIPOK_API_KEY || 'SLIPOKQ4IRV70';

    let cleanBase64 = imageBase64;
    if (cleanBase64.includes(',')) {
      cleanBase64 = cleanBase64.split(',')[1];
    }

    // แปลง Base64 เป็นไฟล์รูปภาพส่งผ่าน FormData ให้ SlipOK ตรวจ QR
    const buffer = Buffer.from(cleanBase64, 'base64');
    const blob = new Blob([buffer], { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('files', blob, 'slip.jpg');
    if (expectedAmount) {
      formData.append('amount', parseFloat(expectedAmount).toString());
    }
    formData.append('log', 'true');

    const slipokResponse = await fetch(`https://api.slipok.com/api/line/apikey/${branchId}`, {
      method: 'POST',
      headers: {
        'x-authorization': apiKey,
      },
      body: formData,
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

    // ป้องกันการนำสลิปเดิมมาใช้ซ้ำ (Slip Replay Attack)
    const DB_URL = 'https://cyber-topup-game-default-rtdb.asia-southeast1.firebasedatabase.app';
    if (transRef) {
      try {
        const checkSlipRes = await fetch(`${DB_URL}/usedSlips/${transRef}.json`);
        if (checkSlipRes.ok) {
          const alreadyUsed = await checkSlipRes.json();
          if (alreadyUsed) {
            return res.status(400).json({
              success: false,
              message: `สลิปนี้ถูกใช้งานไปแล้ว ไม่สามารถใช้ซ้ำได้ (รหัสสลิป: ${transRef})`,
            });
          }
        }
        // บันทึกรหัสสลิปที่ผ่านการตรวจสอบแล้ว
        await fetch(`${DB_URL}/usedSlips/${transRef}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: transaction.amount,
            orderId: orderId || null,
            sender: transaction.sender?.name || null,
            receiver: transaction.receiver?.name || null,
            game: game || null,
            verifiedAt: new Date().toISOString(),
          }),
        });
      } catch (dbErr) {
        console.warn('Check used slip warning:', dbErr);
      }
    }

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
      message: 'เกิดข้อผิดพลาดในการตรวจสอบสลิป: ' + error.message,
    });
  }
}
