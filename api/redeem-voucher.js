// api/redeem-voucher.js
// ระบบรับซองของขวัญ TrueMoney Wallet อัตโนมัติ ไม่ต้องแนบสลิป 24 ชม.
// รองรับการบายพาส Cloudflare และส่งต่อแอดมินอัตโนมัติกรณีติด Challenge

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
    const { voucherUrl, expectedAmount } = req.body || {};

    if (!voucherUrl || typeof voucherUrl !== 'string') {
      return res.status(400).json({ success: false, message: 'กรุณากรอกลิงก์ซองของขวัญ TrueMoney' });
    }

    // สกัด voucher hash จากลิงก์ TrueMoney Gift Voucher
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

    voucherHash = voucherHash.replace(/[^a-zA-Z0-9]/g, '');

    if (!voucherHash || voucherHash.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'รูปแบบลิงก์ซองของขวัญไม่ถูกต้อง (ตัวอย่าง: https://gift.truemoney.com/campaign/?v=...)'
      });
    }

    const cleanVoucherUrl = `https://gift.truemoney.com/campaign/?v=${voucherHash}`;
    const targetMobile = (process.env.TRUEMONEY_PHONE || '0638801739').replace(/[^0-9]/g, '');

    let redeemSuccess = false;
    let responseData = null;
    let errorMessage = '';
    let isCloudflareOrUpstreamIssue = false;

    // =========================================================================
    // วิธีที่ 1: ยิงตรงเข้า TrueMoney API พร้อม Headers มาตรฐาน
    // =========================================================================
    try {
      const tmApiEndpoint = `https://gift.truemoney.com/campaign/vouchers/${voucherHash}/redeem`;
      const directResponse = await fetch(tmApiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://gift.truemoney.com',
          'Referer': cleanVoucherUrl,
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
        },
        body: JSON.stringify({
          mobile: targetMobile,
          voucher_hash: voucherHash
        })
      });

      const contentType = directResponse.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const jsonResult = await directResponse.json();
        if (jsonResult && jsonResult.status) {
          if (jsonResult.status.code === 'SUCCESS') {
            redeemSuccess = true;
            responseData = {
              receivedAmount: parseFloat(jsonResult.data?.voucher?.received_amount_baht || jsonResult.data?.voucher?.amount_baht || '0'),
              voucherId: jsonResult.data?.voucher?.voucher_id || voucherHash,
              ownerName: jsonResult.data?.owner_profile?.full_name || 'ลูกค้า',
              ownerPhone: jsonResult.data?.owner_profile?.mobile_number || '-'
            };
          } else {
            const code = jsonResult.status.code;
            if (code === 'CANNOT_GET_OWN_VOUCHER') {
              errorMessage = '⚠️ ไม่สามารถรับซองของขวัญที่ตัวเองสร้างได้ครับ (ห้ามใช้เบอร์ร้านสร้างซองมาเทส)';
            } else if (code === 'VOUCHER_OUT_OF_STOCK') {
              errorMessage = '⚠️ ซองของขวัญนี้ถูกรับไปหมดแล้วครับ (0/1)';
            } else if (code === 'VOUCHER_EXPIRED') {
              errorMessage = '⚠️ ซองของขวัญนี้หมดอายุแล้วครับ กรุณาสร้างซองใหม่';
            } else if (code === 'TARGET_USER_REDEEMED') {
              errorMessage = '⚠️ เบอร์ร้านนี้เคยรับซองของขวัญนี้ไปแล้วครับ';
            } else if (code === 'VOUCHER_NOT_FOUND') {
              errorMessage = '⚠️ ไม่พบข้อมูลซองของขวัญนี้ หรือลิงก์ไม่ถูกต้อง';
            } else {
              errorMessage = jsonResult.status.message || `TrueMoney Error (${code})`;
            }
          }
        }
      } else {
        isCloudflareOrUpstreamIssue = true;
      }
    } catch (directErr) {
      isCloudflareOrUpstreamIssue = true;
      console.warn('Direct TrueMoney redeem blocked/failed:', directErr.message);
    }

    // =========================================================================
    // วิธีที่ 2: Gateway สำรอง (หากวิธีแรกติด Cloudflare)
    // =========================================================================
    if (!redeemSuccess && !errorMessage) {
      try {
        const gatewayEndpoint = 'https://tmn-angpao.pages.dev/api';
        const gatewayRes = await fetch(gatewayEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            phone: targetMobile,
            voucher_id: voucherHash
          })
        });

        const gatewayJson = await gatewayRes.json().catch(() => null);

        if (gatewayJson) {
          if (gatewayJson.status === 200 || gatewayJson.code === 'SUCCESS' || gatewayJson.success === true) {
            redeemSuccess = true;
            const amountVal = parseFloat(gatewayJson.amount || gatewayJson.data?.amount || '0');
            const actualBaht = amountVal > 1000 ? (amountVal / 100) : amountVal;

            responseData = {
              receivedAmount: actualBaht,
              voucherId: voucherHash,
              ownerName: gatewayJson.sender || gatewayJson.data?.owner_name || 'ลูกค้า',
              ownerPhone: '-'
            };
          } else {
            const gwCode = gatewayJson.code || '';
            const gwMsg = String(gatewayJson.message || '');
            if (gwCode === 'SELF_CLAIM_NOT_ALLOWED' || gwCode === 'CANNOT_GET_OWN_VOUCHER') {
              errorMessage = '⚠️ ไม่สามารถรับซองของขวัญที่ตัวเองสร้างได้ครับ (ห้ามใช้เบอร์ร้านสร้างซองมาเทส)';
            } else if (gwCode === 'VOUCHER_ALREADY_USED' || gwCode === 'VOUCHER_OUT_OF_STOCK') {
              errorMessage = '⚠️ ซองของขวัญนี้ถูกรับไปหมดแล้วครับ (0/1)';
            } else if (gwCode === 'VOUCHER_EXPIRED') {
              errorMessage = '⚠️ ซองของขวัญนี้หมดอายุแล้วครับ';
            } else if (gwCode === 'VOUCHER_NOT_FOUND') {
              errorMessage = '⚠️ ไม่พบข้อมูลซองของขวัญ กรุณาตรวจสอบลิงก์อีกครั้ง';
            } else if (gwMsg.includes('เซิร์ฟเวอร์ภายนอก') || gwMsg.includes('Cloudflare') || !gwCode) {
              isCloudflareOrUpstreamIssue = true;
            } else {
              errorMessage = gwMsg || 'ระบบไม่สามารถรับซองของขวัญนี้ได้';
            }
          }
        } else {
          isCloudflareOrUpstreamIssue = true;
        }
      } catch (gwErr) {
        isCloudflareOrUpstreamIssue = true;
        console.warn('Gateway fallback failed:', gwErr.message);
      }
    }

    // =========================================================================
    // ประมวลผลผลลัพธ์
    // =========================================================================
    if (redeemSuccess && responseData) {
      if (expectedAmount !== undefined && expectedAmount !== null) {
        const requiredAmt = parseFloat(expectedAmount);
        if (!isNaN(requiredAmt) && requiredAmt > 0 && responseData.receivedAmount > 0 && responseData.receivedAmount < requiredAmt) {
          return res.status(400).json({
            success: false,
            message: `ยอดเงินในซอง (฿${responseData.receivedAmount.toLocaleString()}) น้อยกว่ายอดที่ต้องชำระ (฿${requiredAmt.toLocaleString()}) กรุณาติดต่อแอดมิน`
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'รับซองของขวัญสำเร็จ ยอดเงินเข้าบัญชีเรียบร้อยแล้ว',
        data: {
          receivedAmount: responseData.receivedAmount,
          voucherId: responseData.voucherId,
          ownerName: responseData.ownerName,
          targetMobile: targetMobile
        }
      });
    }

    // กรณีติด Cloudflare Challenge -> ส่งสัญญาณให้หน้าเว็บส่งต่อลิงก์ซองเข้าหลังบ้าน & LINE แอดมินอัตโนมัติ
    if (!errorMessage && isCloudflareOrUpstreamIssue) {
      return res.status(200).json({
        success: false,
        cloudflareBlocked: true,
        voucherUrl: cleanVoucherUrl,
        message: 'ระบบส่งลิงก์ซองของขวัญให้แอดมินตรวจสอบและกดรับให้เรียบร้อยแล้ว'
      });
    }

    return res.status(400).json({
      success: false,
      message: errorMessage || '⚠️ ไม่สามารถรับซองของขวัญนี้ได้ กรุณาตรวจสอบว่าซองยังไม่หมดอายุและยังไม่มีใครกดรับไป'
    });

  } catch (error) {
    console.error('Redeem TrueMoney Voucher Error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง'
    });
  }
}
