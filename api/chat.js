// api/chat.js (Vercel Serverless Function)
// Robust CORS + forward to n8n webhook

export default async function handler(req, res) {
  // CORS headers (allow from anywhere — tighten later if you want)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Reply to preflight immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // If you set an env var on Vercel, use it; otherwise hardcode your n8n webhook URL
    const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  'https://trustedadvisors.app.n8n.cloud/webhook/csai/chat';

    const { chat_id, message } = req.body || {};

    const r = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, message }),
    });

    // Try to parse JSON; if not JSON, still forward plain text
    const text = await r.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { text: text || '' };
    }

    return res.status(r.status).json(data);
  } catch (e) {
    console.error('Proxy error:', e);
    return res.status(500).json({ error: 'Proxy error' });
  }
}
