/**
 * Node Detail Page
 * Shows detailed information about a specific pNode
 * Converted from Vite/React Router to Next.js App Router
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Server, Activity, Clock, Shield, MapPin, Globe } from 'lucide-react';
import { PNode, LatencyDataPoint } from '@/lib/types';
import { LatencyChart } from '@/components/LatencyChart';
import { cn } from '@/lib/utils';

export default function NodeDetail() {
  const params = useParams();
  const pubkey = params.pubkey as string;
  
  const [node, setNode] = useState<PNode | null>(null);
  const [latencyHistory, setLatencyHistory] = useState<LatencyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pubkey) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch node details from API
        const response = await fetch(`/api/node/${encodeURIComponent(pubkey)}`);
        const data = await response.json();

        if (data.success && data.data) {
          // Transform backend format to frontend format
          const transformed: PNode = {
            pubkey: data.data.pubkey,
            gossip: data.data.gossip_address,
            version: data.data.version,
            latency: data.data.latency,
            online: data.data.online_status === 'online',
            lastSeen: data.data.last_seen,
            location: data.data.location,
          };
          setNode(transformed);

          // Generate mock latency history for now
          const history: LatencyDataPoint[] = [];
          const now = new Date();
          for (let i = 20; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60000);
            const variance = (Math.random() - 0.5) * 20;
            history.push({
              timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              latency: Math.max(5, Math.floor(data.data.latency + variance)),
            });
          }
          setLatencyHistory(history);
        }
      } catch (err) {
        console.error('Failed to load node detail', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pubkey]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Node Not Found</h2>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/dashboard">
        <button className="flex items-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft size={18} className="mr-2" />
          Back to Dashboard
        </button>
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                {node.pubkey}
              </h1>
              <span className={cn(
                'px-3 py-1 rounded-full text-sm font-medium border',
                node.online 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                  : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
              )}>
                {node.online ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-mono text-sm flex items-center">
              <Globe size={14} className="mr-2" />
              {node.gossip}
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">Current Version</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{node.version}</p>
            </div>
            <div className="text-right pl-4 border-l border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">Uptime (24h)</p>
              <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">99.8%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <Server size={20} className="mr-2 text-blue-500" />
              Node Metadata
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Gossip Address</p>
                <p className="text-slate-700 dark:text-slate-300 font-mono text-sm">{node.gossip}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Location</p>
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <MapPin size={16} className="mr-1 text-slate-400" />
                  {node.location || 'Unknown Region'}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Last Seen</p>
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <Clock size={16} className="mr-1 text-slate-400" />
                  {new Date(node.lastSeen).toLocaleString()}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Protocol Security</p>
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <Shield size={16} className="mr-1 text-emerald-500" />
                  Secured
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                <Activity size={20} className="mr-2 text-purple-500" />
                Latency History (Last 20m)
              </h3>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {node.latency} <span className="text-sm font-normal text-slate-500">ms</span>
              </span>
            </div>
            <LatencyChart data={latencyHistory} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500">Packet Loss</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">0.02%</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500">Peers Connected</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">24</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
