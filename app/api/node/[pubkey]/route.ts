/**
 * API Route: GET /api/node/[pubkey]
 * Fetches detailed information for a specific pNode
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNodeInfo, getNodeLatency } from '@/lib/prpc';
import { APIResponse, NodeDetail } from '@/lib/types';

interface Params {
  params: {
    pubkey: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { pubkey } = params;

    if (!pubkey) {
      const response: APIResponse<null> = {
        success: false,
        error: 'pubkey parameter is required',
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(response, {
        status: 400,
      });
    }

    // Fetch node info and latency
    const [nodeInfo, latency] = await Promise.all([
      getNodeInfo(pubkey),
      getNodeLatency(pubkey),
    ]);

    if (!nodeInfo) {
      const response: APIResponse<null> = {
        success: false,
        error: `Node not found: ${pubkey}`,
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(response, {
        status: 404,
      });
    }

    // Update latency
    nodeInfo.latency = latency;

    const response: APIResponse<NodeDetail> = {
      success: true,
      data: nodeInfo,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error in /api/node/[pubkey]:', error);

    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to fetch node details',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      status: 500,
    });
  }
}
