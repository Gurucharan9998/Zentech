const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { prompt } = req.body;
  const apiKey = process.env.MESHY_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing Meshy API key' });
  }

  const createRes = await fetch('https://api.meshy.ai/openapi/v2/text-to-3d', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt, mode: 'preview' })
  });

  const createData = await createRes.json();
  res.json(createData);
};

