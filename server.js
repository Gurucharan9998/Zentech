import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('public')); // Serves index.html from /public folder

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

    // Start polling
    let modelUrl = '';
    let status = '';
    let tries = 0;
    const maxTries = 100; // 100 x 3s = ~5 minutes

    console.log('🚀 Polling loop started...');

    while (status !== 'COMPLETED' && tries < maxTries) {
      tries++;
      console.log(`⏳ Polling status (try ${tries})`);

      await new Promise(r => setTimeout(r, 3000));

      const statusRes = await fetch(`https://api.meshy.ai/openapi/v2/text-to-3d/${taskId}`, {
        headers: { 'Authorization': `Bearer ${process.env.MESHY_API_KEY}` }
      });

      const data = await statusRes.json();
      console.log('🔍 Status response:', data);

      if (!data.status) {
        return res.status(500).json({ error: 'Invalid status response', data });
      }

      status = data.status;

      if (status === 'FAILED') {
        return res.status(500).json({ error: 'Model generation failed', data })
