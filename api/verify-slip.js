// api/verify-slip.js
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// เชื่อมต่อ Firebase Admin SDK ฝั่งเซิร์ฟเวอร์ (มีสิทธิ์เขียนฐานข้อมูลโดยปลอดภัย)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = getDatabase();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { imageBase64, expectedAmount, orderId, userId, game, packageItem, playerId } = req.body;

    if (!imageBase64 || !expectedAmount) {
      return res.status(400).json({ success: false, message: 'ข้อมูลสลิปไม่ครบถ้วน' });
    }

    // 1. ส่งรูปสลิปไปตรวจกับ API ตรวจสลิปจริง (ตัวอย่าง: SlipOK API)
    const slipRes = await fetch(`https://api.slipok.com/api/line/apikey/${process.env.SLIPOK_BRANCH_ID}`, {
      method: 'POST',
      headers: {
        'x-authorization': process.env.SLIPOK_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: imageBase64,
        amount: parseFloat(expectedAmount), // ตรวจว่ายอดโอนตรงกับราคาสินค้าไหม
      }),
    });

    const slipData = await slipRes.json();

    if (!slipData.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'สลิปไม่ถูกต้อง หรือยอดเงินไม่ตรงกับราคาแพ็กเกจ' 
      });
    }

    const transRef = slipData.data.transRef; // รหัสอ้างอิงธุรกรรมธนาคาร

    // 2. ป้องกันแฮกเกอร์ใช้สลิปเดิมซ้ำ (Anti-Duplicate Attack)
    const usedSlipRef = db.ref(`used_slips/${transRef}`);
    const checkSlip = await usedSlipRef.get();

    if (checkSlip.exists()) {
      return res.status(400).json({ 
        success: false, 
        message: 'สลิปนี้เคยถูกใช้งานไปแล้ว ไม่สามารถใช้ซ้ำได้' 
      });
    }

    // 3. บันทึกรหัสสลิปว่าถูกใช้แล้วทันที
    await usedSlipRef.set({
      usedAt: Date.now(),
      amount: expectedAmount,
      orderId: orderId,
    });

    // 4. จ่ายของจริง / เติมเครดิตจริงจากฝั่งเซิร์ฟเวอร์
    if (game === 'เติมเครดิตร้าน') {
      const userBalanceRef = db.ref(`users/${userId}/balance`);
      const userSnap = await userBalanceRef.get();
      const currentBalance = userSnap.val() || 0;
      await userBalanceRef.set(currentBalance + parseFloat(expectedAmount));
    } else {
      // อัปเดตสถานะออเดอร์เกมเป็นสำเร็จจริง
      await db.ref(`orders/${orderId}/status`).set('✅ เติมเข้าไอดีเกมสำเร็จทันที (AUTO 100%)');
    }

    return res.status(200).json({ 
      success: true, 
      message: 'ตรวจสอบยอดเงินสำเร็จและส่งมอบสินค้าเรียบร้อยแล้ว' 
    });

  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
}
