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

  let modelUrl = '';
  let status = '';
  while (status !== 'COMPLETED') {
    await new Promise(r => setTimeout(r, 3000));
    const statusRes = await fetch(`https://api.meshy.ai/openapi/v2/text-to-3d/${taskId}`, {
      headers: { 'Authorization': `Bearer ${process.env.MESHY_API_KEY}` }
    });
    const data = await statusRes.json();
    status = data.status;
    if (status === 'COMPLETED') {
      modelUrl = data.preview_url;
      break;
    }
  }
  res.json({ modelUrl });
});

app.listen(3000, () => console.log('✅ Server running on port 3000'));
