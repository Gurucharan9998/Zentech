const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// ✅ Debug environment key loaded
console.log('🔐 Loaded API key:', process.env.MESHY_API_KEY ? '[REDACTED]' : '[MISSING]');

// ✅ Check endpoint to verify key is loaded
app.get('/check-key', (req, res) => {
  res.json({ keyLoaded: !!process.env.MESHY_API_KEY });
});

// ✅ Main API
app.post('/generate-model', async (req, res) => {
  const { prompt } = req.body;
  console.log('📝 Prompt received:', prompt);

  try {
    const createRes = await fetch('https://api.meshy.ai/openapi/v2/text-to-3d', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MESHY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt, mode: 'preview' })
    });

    const createData = await createRes.json();

    if (!createData.result) {
      console.error('❌ Failed to start generation:', createData);
      return res.status(500).json({ error: 'Meshy API rejected the prompt', details: createData });
    }

    const taskId = createData.result;
    console.log('📦 Task created:', taskId);

    let modelUrl = '';
    let status = '';
    let tries = 0;
    const maxTries = 100;

    console.log('🚀 Polling loop started...');

    while (status !
