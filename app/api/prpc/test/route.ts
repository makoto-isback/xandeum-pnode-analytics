import { NextResponse } from 'next/server';

const PRPC_PROXY_URL = process.env.PRPC_PROXY_URL || '';
const PROXY_API_KEY = process.env.PROXY_API_KEY ?? '';
const isDebug = process.env.DEBUG_PRPC === '1' || process.env.NODE_ENV === 'development';
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

export async function GET(req: Request) {
  if (!PRPC_PROXY_URL) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Proxy URL not configured',
        proxyConfigError: isProduction ? 'PRPC_PROXY_URL environment variable is required in production' : 'PRPC_PROXY_URL environment variable is not set',
        selectedProxyUrl: null,
        testHealthEndpoint: null,
      },
      { status: 400 }
    );
  }

  try {
    if (isDebug) console.log('[prpc/test] checking health at', `${PRPC_PROXY_URL.replace(/\/$/, '')}/health`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${PRPC_PROXY_URL.replace(/\/$/, '')}/health`, { headers: { 'x-api-key': PROXY_API_KEY }, signal: controller.signal });
    clearTimeout(timeoutId);

    const text = await res.text().catch(() => null);
    return NextResponse.json({
      ok: true,
      selectedProxyUrl: PRPC_PROXY_URL,
      testHealthEndpoint: {
        status: res.status,
        body: text,
      },
    });
  } catch (e: any) {
    if (isDebug) console.error('[prpc/test] error', e?.message ?? String(e));
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to reach proxy health endpoint',
        selectedProxyUrl: PRPC_PROXY_URL,
        testHealthEndpoint: { error: e?.message ?? String(e) },
      },
      { status: 502 }
    );
  }
}

