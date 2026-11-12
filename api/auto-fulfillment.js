// api/auto-fulfillment.js
// เชื่อมต่อ WonDD Game TOPUP API (อ้างอิงเอกสาร game_api_003.pdf Version 0.03)
// Endpoint: https://www.wondd.com/member/bot-game.php (POST x-www-form-urlencoded)
// ปลอดภัย 100%: หากยังไม่ได้ตั้งค่า WONDD_USERNAME / WONDD_PASSWORD ใน Vercel หรือยังไม่มีรหัส packcode ของแพ็กเกจนั้น
// ระบบจะส่งเข้าโหมดรอแอดมินเติมมือ (manual_pending) โดยไม่กระทบการขายหน้าเว็บ

const WONDD_API_URL = 'https://www.wondd.com/member/bot-game.php';
const DB_URL = 'https://cyber-topup-game-default-rtdb.asia-southeast1.firebasedatabase.app';

// ตารางจับคู่รหัสเกม (servicecode) และรหัสแพ็กเกจ (packcode) จาก bot-game-packlist-new.php ของ WonDD
const WONDD_PACK_MAP = {
  rov: {
    servicecode: '9601',
    packs: {
      r1: 'R00011',
      r2: 'R00024',
      r3: 'R00060',
      r4: 'R00110',
      r5: 'R00185',
      r7: 'R00370',
      r8: 'R00620',
      r9: 'R01240',
    },
  },
  freefire: {
    servicecode: '9602',
    packs: {
      ff1: 'F00033',
      ff2: 'F00068',
      ff3: 'F00172',
      ff4: 'F00310',
      ff5: 'F00517',
      ff6: 'F01052',
      ff7: 'F01801',
      ff8: 'F03698',
      ff9: 'FBPC84',
      ff10: 'FDIM63',
      ff11: 'FMON280',
    },
  },
  undawn: {
    servicecode: '9603',
    packs: {
      ud1: 'U00055',
      ud2: 'U00138',
      ud3: 'U00253',
      ud4: 'U00440',
      ud5: 'U00880',
      ud6: 'U01485',
      ud7: 'U02970',
      ud8: 'UWEEK79',
      ud9: 'UMON129',
    },
  },
  codm: {
    servicecode: '9605',
    packs: {
      cod1: 'C00048',
      cod2: 'C00126',
      cod3: 'C00252',
      cod4: 'C00378',
      cod5: 'C00792',
      cod6: 'C01440',
      cod7: 'C03000',
    },
  },
  deltaforce: {
    servicecode: '9606',
    packs: {
      df1: 'D00063',
      df2: 'D00336',
      df3: 'D00482',
      df4: 'D00785',
      df5: 'D01544',
      df6: 'D02065',
      df7: 'D04114',
      df8: 'DMS0036',
      df9: 'DMSA110',
    },
  },
  haikyu: {
    servicecode: '9607',
    packs: {
      hq1: 'H00060',
      hq2: 'H00300',
      hq3: 'H00980',
      hq4: 'H01980',
      hq5: 'H03280',
      hq6: 'H6480',
    },
  },
  pubg: {
    servicecode: '9621',
    packs: {
      p1: 'UC00060',
      p2: 'UC00325',
      p3: 'UC00660',
      p4: 'UC01800',
      p5: 'UC03850',
      p6: 'UC08100',
    },
  },
  mlbb: {
    servicecode: '9622',
    packs: {
      ml1: 'MLOTW01',
      ml2: 'ML00086',
      ml3: 'ML00172',
      ml4: 'ML00257',
      ml5: 'ML00706',
      ml6: 'ML01049',
      ml7: 'ML02195',
    },
  },
  valorant: {
    servicecode: '9623',
    packs: {
      v1: 'VL00475',
      v2: 'VL01000',
      v3: 'VL02050',
      v4: 'VL03650',
      v5: 'VL05350',
      v6: 'VL11000',
    },
  },
  identityv: {
    servicecode: '9625',
    defaultGameId3: 'Asia',
    packs: {
      idv1: 'IV00066',
      idv2: 'IV00203',
      idv3: 'IV00335',
      idv4: 'IV00759',
      idv5: 'IV02227',
      idv6: 'IV03663',
      idv7: 'IV07249',
    },
  },
  swordofjustice: {
    servicecode: '9626',
    defaultGameId3: 'Asia',
    packs: {
      soj1: 'SOJ0060',
      soj2: 'SOJ0330',
      soj3: 'SOJ1100',
      soj4: 'SOJ2268',
      soj5: 'SOJ3808',
      soj6: 'SOMLP0001',
    },
  },
  arenabreakout: {
    servicecode: '9627',
    packs: {
      ab1: 'AB00066',
      ab2: 'AB00335',
      ab3: 'AB00675',
      ab4: 'AB01690',
      ab5: 'AB03400',
      ab6: 'ABBCP0001',
      ab7: 'ABMPB0001',
    },
  },
  bloodstrike: {
    servicecode: '9628',
    packs: {
      bs1: 'BS00105',
      bs2: 'BS00320',
      bs3: 'BS00540',
      bs4: 'BS01100',
      bs5: 'BS02260',
      bs6: 'BS05800',
      bs7: 'BSSPP0001',
    },
  },
  mhoutlanders: {
    servicecode: '9608',
    packs: {
      mh1: 'M00067',
      mh2: 'M00338',
      mh3: 'M01120',
      mh4: 'M01478',
      mh5: 'M02320',
      mh6: 'M03980',
      mh7: 'M08280',
    },
  },
  heartopia: {
    servicecode: '9624',
    defaultGameId3: 'Sea',
    packs: {
      ht1: 'HTP00020',
      ht2: 'HTP00060',
      ht3: 'HTP00320',
      ht4: 'HTP00730',
      ht5: 'HTP01370',
      ht6: 'HTP02130',
      ht7: 'HTP03550',
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

  // GET: เช็กสถานะการเชื่อมต่อ, เช็กยอดเงิน (balance), ดึงราคาแพ็กเกจ (pricelist), หรือเช็กสถานะออเดอร์ (checkstatus)
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
      mappedGames: Object.keys(WONDD_PACK_MAP),
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const {
      orderId,
      firebaseKey,
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

    // หากแพ็กเกจหรือเกมนั้นยังไม่ตรงกับ packlist ของ WonDD (เช่น MH Outlanders, Heartopia, Razer Gold PIN) ให้เข้าคิวแอดมินเติมมืออัตโนมัติ
    if (!servicecode || !packcode) {
      return res.status(200).json({
        success: true,
        mode: 'manual_pending',
        message: `แพ็กเกจ ${gameName || gameId} (${packageName || packageId}) ส่งเข้าคิวแอดมินเติมมือเรียบร้อย`,
        orderId,
      });
    }

    // เรียก WonDD Method 2: topup
    const gameid = String(playerId || '').trim();
    const gameid2 = String(zoneId || '').trim();
    const gameid3 = String(server || mappedGame?.defaultGameId3 || '').trim();

    const topupResp = await postToWonDD({
      method: 'topup',
      username: WONDD_USERNAME,
      password: WONDD_PASSWORD,
      servicecode,
      packcode,
      gameid,
      gameid2,
      gameid3,
    });

    const result = topupResp.data || {};
    console.log('[WonDD Topup]', { orderId, gameId, packageId, servicecode, packcode, gameid, result });

    let targetKey = firebaseKey;
    if (!targetKey && orderId) {
      try {
        const snapshot = await fetch(`${DB_URL}/orders.json`);
        if (snapshot.ok) {
          const allOrders = await snapshot.json();
          targetKey = Object.keys(allOrders || {}).find((k) => allOrders[k]?.id === orderId);
        }
      } catch (e) {}
    }

    if (result.errorcode === '00') {
      if (targetKey) {
        try {
          await fetch(`${DB_URL}/orders/${targetKey}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: `✅ เติมเข้าไอดีเกมสำเร็จเรียบร้อยแล้ว (WonDD AUTO: ${result.orderid || ''})`,
              wonddOrderId: result.orderid || '',
            }),
          });
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

    if (targetKey) {
      try {
        await fetch(`${DB_URL}/orders/${targetKey}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wonddError: `[${result.errorcode || 'ERR'}] ${result.errordetail || result.raw || 'ไม่สามารถเติมอัตโนมัติได้'}`,
          }),
        });
      } catch (e) {}
    }

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
