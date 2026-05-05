const YOUTUBE_REQUEST_API = 'https://shopeeyt.com/request-conversion';

export async function onRequestPost({ request }) {
  try {
    const body = await request.json();
    const url = body?.url;

    if (!url) {
      return Response.json({ error: 'Missing url' }, { status: 400 });
    }

    const upstreamRes = await fetch(YOUTUBE_REQUEST_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    const text = await upstreamRes.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return Response.json(
        { error: 'Invalid JSON from upstream request-conversion', raw: text },
        { status: 502 }
      );
    }

    return Response.json(data, { status: upstreamRes.status });
  } catch (err) {
    return Response.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
