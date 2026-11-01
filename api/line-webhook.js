export default function handler(req, res) {
  if (req.method === 'POST') {
    // รับข้อมูล Event จาก LINE (เช่น การเพิ่มเพื่อน หรือข้อความ)
    const events = req.body.events;
    // จัดการข้อมูลตามต้องการ
    return res.status(200).json({ status: 'success' });
  }

  // สำหรับการกดปุ่ม Verify จากหน้า LINE Developers Console
  return res.status(200).send('OK');
}
