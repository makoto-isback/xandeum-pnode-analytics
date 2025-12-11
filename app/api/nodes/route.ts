/**
 * API Route: GET /api/nodes
 * Fetches all pNodes from pRPC and returns formatted data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGossipNodes } from '@/lib/prpc';
import { calculateMetrics } from '@/lib/utils';
import { APIResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Fetch all nodes from the internal pRPC proxy endpoint
    const proxyUrl = new URL('/api/prpc', request.url);
    proxyUrl.searchParams.set('method', 'getGossipNodes');

    const pr = await fetch(proxyUrl.toString(), { method: 'GET' });
    const prjson = await pr.json().catch(() => null);

    if (!pr.ok || !prjson || prjson.ok === false) {
      console.error('Failed to get gossip nodes from /api/prpc', prjson);
      throw new Error(prjson?.error || 'Proxy fetch failed');
    }

    // The proxy returns shape: { ok: true, host, data }
    const nodes = prjson?.data?.result ?? prjson?.data ?? [];

    // Calculate metrics
    const metrics = calculateMetrics(nodes);

    // Return formatted response
    const response: APIResponse<{
      nodes: typeof nodes;
      metrics: typeof metrics;
      connectedHost?: string | null;
    }> = {
      success: true,
      data: {
        nodes,
        metrics,
        connectedHost: (prjson && prjson.host) || null,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error in /api/nodes:', error);

    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to fetch nodes',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      status: 500,
    });
  }
}
