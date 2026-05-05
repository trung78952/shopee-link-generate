const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const UPSTREAM_API = 'https://hung.shpee.cc';
const YOUTUBE_REQUEST_API = 'https://shopeeyt.com/request-conversion';
const YOUTUBE_STATUS_API = 'https://shopeeyt.com/check-status';

app.use(express.static(path.join(__dirname)));
app.use(express.json());

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

app.post('/api/youtube-request', async (req, res) => {
  const { url } = req.body || {};

  if (!url) {
    return res.status(400).json({
      error: 'Missing url'
    });
  }

  try {
    const upstreamResponse = await fetch(YOUTUBE_REQUEST_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    const text = await upstreamResponse.text();

    try {
      const data = JSON.parse(text);
      return res.status(upstreamResponse.status).json(data);
    } catch {
      return res.status(502).json({
        error: 'Invalid JSON from upstream request-conversion',
        raw: text
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

app.get('/api/youtube-status', async (req, res) => {
  const { job_id } = req.query;

  if (!job_id) {
    return res.status(400).json({
      error: 'Missing job_id'
    });
  }

  try {
    const upstreamUrl = `${YOUTUBE_STATUS_API}?job_id=${encodeURIComponent(job_id)}`;
    const upstreamResponse = await fetch(upstreamUrl);
    const text = await upstreamResponse.text();

    try {
      const data = JSON.parse(text);
      return res.status(upstreamResponse.status).json(data);
    } catch {
      return res.status(502).json({
        error: 'Invalid JSON from upstream check-status',
        raw: text
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} is in use. Retrying on ${nextPort}...`);
      startServer(nextPort);
      return;
    }

    console.error('Server failed to start:', error.message);
    process.exit(1);
  });
}

startServer(PORT);
