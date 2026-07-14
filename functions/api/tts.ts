export async function onRequest(context) {
  const { request } = context;
  if (request.method !== 'POST') return new Response(null, { status: 405 });

  let body;
  try { body = await request.json(); }
  catch { return new Response('Invalid JSON', { status: 400 }); }

  const { text, lang = 'en' } = body;
  if (!text || typeof text !== 'string') return new Response('Missing text', { status: 400 });

  const safeText = text.slice(0, 500);
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(safeText)}&tl=${lang}&client=tw-ob`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://translate.google.com/',
    }
  });

  if (!res.ok) return new Response('TTS upstream failed', { status: 502 });

  const audio = await res.arrayBuffer();
  return new Response(audio, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
