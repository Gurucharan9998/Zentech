import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('public')); // serve static files from 'public' folder

app.post('/generate-model', async (req, res) => {
  const { prompt } = req.body;
  const createRes = await fetch('https://api.meshy.ai/openapi/v2/text-to-3d', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MESHY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt, mode: 'preview' })
  });
  const { result: taskId } = await createRes.json();
const createData = await createRes.json();

if (!createData.result) {
  console.error('❌ Meshy create error:', createData);
  return res.status(500).json({ error: 'Failed to create generation task', details: createData });
}

const taskId = createData.result;

let modelUrl = '';
let status = '';
let tries = 0;
const maxTries = 30;

while (status !== 'COMPLETED' && tries < maxTries) {
  tries++;
  console.log(`⏳ Checking model status... try ${tries}`);

  await new Promise(r => setTimeout(r, 3000));

  const statusRes = await fetch(`https://api.meshy.ai/openapi/v2/text-to-3d/${taskId}`, {
    headers: { 'Authorization': `Bearer ${process.env.MESHY_API_KEY}` }
  });

  const data = await statusRes.json();
  console.log('🔍 Meshy status:', data);

  if (!data.status) {
    return res.status(500).json({ error: 'Unexpected response from Meshy', data });
  }

  status = data.status;

  if (status === 'COMPLETED') {
    modelUrl = data.preview_url;
    break;
  }

  if (status === 'FAILED') {
    return res.status(500).json({ error: 'Model generation failed', data });
  }
}

if (!modelUrl) {
  return res.status(504).json({ error: 'Model generation timed out' });
}

res.json({ modelUrl });
});

app.listen(3000, () => console.log('✅ Server running on port 3000'));
