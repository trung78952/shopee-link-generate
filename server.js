const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const UPSTREAM_API = 'https://hung.shpee.cc';

app.use(express.static(path.join(__dirname)));

app.get('/api/generate', async (req, res) => {
  const { url, affiliate_ids } = req.query;

  if (!url) {
    return res.status(400).json({
      success: false,
      message: 'Missing query parameter: url'
    });
  }

  if (!affiliate_ids) {
    return res.status(400).json({
      success: false,
      message: 'Missing query parameter: affiliate_ids'
    });
  }

  try {
    const upstreamUrl = `${UPSTREAM_API}?url=${encodeURIComponent(url)}&affiliate_ids=${encodeURIComponent(affiliate_ids)}`;
    const upstreamResponse = await fetch(upstreamUrl);

    const text = await upstreamResponse.text();

    if (!upstreamResponse.ok) {
      return res.status(upstreamResponse.status).json({
        success: false,
        message: `Upstream error: ${upstreamResponse.status}`,
        raw: text
      });
    }

    try {
      const data = JSON.parse(text);
      return res.json(data);
    } catch {
      return res.status(502).json({
        success: false,
        message: 'Invalid JSON from upstream API',
        raw: text
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
