const YOUTUBE_STATUS_API = 'https://shopeeyt.com/check-status';

export async function onRequestGet({ request }) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('job_id');

  if (!jobId) {
    return Response.json({ error: 'Missing job_id' }, { status: 400 });
  }

  try {
    const upstreamRes = await fetch(
      `${YOUTUBE_STATUS_API}?job_id=${encodeURIComponent(jobId)}`,
      { method: 'GET' }
    );
    console.log(upstreamRes);
    const text = await upstreamRes.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return Response.json(
        { error: 'Invalid JSON from upstream check-status', raw: text },
        { status: 502 }
      );
    }

    return Response.json(data, { status: upstreamRes.status });
  } catch (err) {
    return Response.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
