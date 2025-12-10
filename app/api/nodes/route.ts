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
    // Fetch all nodes from pRPC
    const nodes = await getGossipNodes();

    // Calculate metrics
    const metrics = calculateMetrics(nodes);

    // Return formatted response
    const response: APIResponse<{
      nodes: typeof nodes;
      metrics: typeof metrics;
    }> = {
      success: true,
      data: {
        nodes,
        metrics,
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
