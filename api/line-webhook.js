export default function handler(req, res) {
  if (req.method === 'POST') {
    const events = req.body.events;
    return res.status(200).json({ status: 'success', events });
  }
  return res.status(200).send('OK');
}
