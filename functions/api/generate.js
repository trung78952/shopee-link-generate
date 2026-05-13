const UPSTREAM_API = 'https://hung.shpee.cc';
// const UPSTREAM_API = 'https://cuongtws.vn';

export async function onRequestGet({ request }) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const affiliate_ids = searchParams.get('affiliate_ids');

  if (!url) {
    return Response.json({ success: false, message: 'Missing parameter: url' }, { status: 400 });
  }

  const upstreamUrl =
    `${UPSTREAM_API}?url=${encodeURIComponent(url)}&affiliate_ids=${encodeURIComponent(affiliate_ids || '')}`;

  try {
    const upstreamRes = await fetch(upstreamUrl);
    const text = await upstreamRes.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return Response.json(
        { success: false, message: 'Invalid JSON from upstream', raw: text },
        { status: 502 }
      );
    }

    return Response.json(data, { status: upstreamRes.status });
  } catch (err) {
    return Response.json(
      { success: false, message: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}
