export default async function handler(req, res) {
  const { prompt } = req.body;
  const key = process.env.MESHY_API_KEY;

  if (!key) return res.status(500).json({ error: 'Missing key' });

  const r = await fetch('https://api.meshy.ai/openapi/v2/text-to-3d', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt, mode: 'preview' })
  });

  const data = await r.json();
  res.json(data);
}
