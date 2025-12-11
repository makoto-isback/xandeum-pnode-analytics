import { NextResponse } from 'next/server';

const PRPC_PROXY_URL = process.env.PRPC_PROXY_URL || process.env.NEXT_PUBLIC_PRPC_ENDPOINT || '';
const PROXY_API_KEY = process.env.PROXY_API_KEY ?? '';
const isDebug = process.env.DEBUG_PRPC === '1' || process.env.NODE_ENV === 'development';

export async function GET(req: Request) {
  const proxy = PRPC_PROXY_URL || null;
  if (!proxy) {
    return NextResponse.json({ ok: false, proxy: null, error: 'PRPC proxy URL is not configured' }, { status: 400 });
  }

  try {
    if (isDebug) console.log('[prpc/test] checking health at', `${proxy.replace(/\/$/, '')}/health`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${proxy.replace(/\/$/, '')}/health`, { headers: { 'x-api-key': PROXY_API_KEY }, signal: controller.signal });
    clearTimeout(timeoutId);

    const text = await res.text().catch(() => null);
    return NextResponse.json({ ok: true, proxy, status: res.status, body: text });
  } catch (e: any) {
    if (isDebug) console.error('[prpc/test] error', e?.message ?? String(e));
    return NextResponse.json({ ok: false, proxy, error: e?.message ?? String(e) }, { status: 502 });
  }
}
