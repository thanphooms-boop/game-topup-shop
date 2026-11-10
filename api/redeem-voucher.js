// api/redeem-voucher.js
// ระบบรับซองของขวัญ TrueMoney Wallet อัตโนมัติ ไม่ต้องแนบสลิป 24 ชม.

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
    const { voucherUrl, expectedAmount, orderId, userId, game, packageItem, playerId } = req.body;

    if (!voucherUrl || typeof voucherUrl !== 'string') {
      return res.status(400).json({ success: false, message: 'กรุณากรอกลิงก์ซองของขวัญ TrueMoney' });
    }

    // สกัด voucher hash จากลิงก์ TrueMoney Gift Voucher
    // รูปแบบ URL: https://gift.truemoney.com/campaign/?v=xxxxxx หรือ xxxxxx ตรงๆ
    let voucherHash = voucherUrl.trim();
    if (voucherHash.includes('v=')) {
      const match = voucherHash.match(/v=([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        voucherHash = match[1];
      }
    } else if (voucherHash.includes('/')) {
      const parts = voucherHash.split('/').filter(Boolean);
      voucherHash = parts[parts.length - 1];
    }

    if (!voucherHash || voucherHash.length < 10) {
      return res.status(400).json({ success: false, message: 'รูปแบบลิงก์ซองของขวัญไม่ถูกต้อง (ตัวอย่าง: https://gift.truemoney.com/campaign/?v=...)' });
    }

    // เบอร์ TrueMoney ของร้านค้าสำหรับรับเงินเข้ากระเป๋า
    const targetMobile = (process.env.TRUEMONEY_PHONE || '0638801739').replace(/[^0-9]/g, '');

    // ยิง API ไปยัง TrueMoney Campaign Voucher เพื่อกดรับเงิน
    const tmApiEndpoint = `https://gift.truemoney.com/campaign/vouchers/${voucherHash}/redeem`;
    
    const response = await fetch(tmApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
      },
      body: JSON.stringify({
        mobile: targetMobile,
        voucher_hash: voucherHash
      })
    });

    const data = await response.json();

    if (data && data.status && data.status.code === 'SUCCESS') {
      const voucherData = data.data?.voucher || {};
      const receivedAmount = parseFloat(voucherData.received_amount_baht || voucherData.amount_baht || '0');
      const ownerProfile = data.data?.owner_profile || {};

      // ตรวจสอบยอดเงินว่าตรงกับยอดที่ต้องชำระหรือไม่ (ถ้ามีการระบุ expectedAmount)
      if (expectedAmount !== undefined && expectedAmount !== null) {
        const requiredAmt = parseFloat(expectedAmount);
        if (!isNaN(requiredAmt) && requiredAmt > 0 && Math.abs(receivedAmount - requiredAmt) > 0.01) {
          // ถ้ายอดเงินน้อยกว่ายอดสินค้า
          if (receivedAmount < requiredAmt) {
            return res.status(400).json({
              success: false,
              message: `ยอดเงินในซอง (฿${receivedAmount.toLocaleString()}) ไม่พอกับยอดที่ต้องชำระ (฿${requiredAmt.toLocaleString()}) กรุณาติดต่อแอดมิน`
            });
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: 'รับซองของขวัญสำเร็จ ยอดเงินเข้าบัญชีเรียบร้อยแล้ว',
        data: {
          receivedAmount: receivedAmount,
          voucherId: voucherData.voucher_id || voucherHash,
          ownerName: ownerProfile.full_name || 'ลูกค้า',
          ownerPhone: ownerProfile.mobile_number || '-',
          targetMobile: targetMobile
        }
      });
    } else {
      const errCode = data?.status?.code || 'UNKNOWN';
      const errMsg = data?.status?.message || '';

      let friendlyMessage = 'ไม่สามารถรับซองของขวัญได้ กรุณาตรวจสอบลิงก์อีกครั้ง';
      if (errCode === 'VOUCHER_OUT_OF_STOCK') {
        friendlyMessage = 'ซองของขวัญนี้ถูกรับไปหมดแล้วครับ กรุณาสร้างซองใหม่';
      } else if (errCode === 'VOUCHER_EXPIRED') {
        friendlyMessage = 'ซองของขวัญนี้หมดอายุแล้วครับ กรุณาสร้างซองใหม่';
      } else if (errCode === 'TARGET_USER_REDEEMED') {
        friendlyMessage = 'เบอร์ร้านนี้เคยรับซองของขวัญนี้ไปแล้วครับ';
      } else if (errCode === 'CANNOT_GET_OWN_VOUCHER') {
        friendlyMessage = 'ไม่สามารถใช้เบอร์เดียวกันสร้างซองและรับซองได้ครับ';
      } else if (errCode === 'VOUCHER_NOT_FOUND') {
        friendlyMessage = 'ไม่พบข้อมูลซองของขวัญ กรุณาตรวจสอบลิงก์ให้ถูกต้อง';
      } else if (errMsg) {
        friendlyMessage = `TrueMoney แจ้งเตือน: ${errMsg}`;
      }

      return res.status(400).json({
        success: false,
        message: friendlyMessage,
        rawCode: errCode
      });
    }
  } catch (error) {
    console.error('Redeem TrueMoney Voucher Error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ TrueMoney (' + error.message + ')'
    });
  }
}
