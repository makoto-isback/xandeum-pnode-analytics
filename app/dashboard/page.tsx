/**
 * Dashboard Page
 * Main dashboard showing all pNodes
 * Client-side only, fetches from Cloudflare Worker
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { PNode, FrontendNodeMetrics, SortField, SortOrder, FilterState } from '@/lib/types';
import { MetricsCards } from '@/components/MetricsCards';
import { NodeTable } from '@/components/NodeTable';
import { getGossipNodes } from '@/lib/prpc';

export default function Dashboard() {
  const [nodes, setNodes] = useState<PNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterState>({ status: 'all', minVersion: '' });
  const [sortField, setSortField] = useState<SortField>('latency');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const fetchData = async () => {
    setLoading(true);
    try {
      const nodes = await getGossipNodes();
      
      if (!nodes || nodes.length === 0) {
        setError('No nodes returned from Worker. Check NEXT_PUBLIC_WORKER_URL.');
        setNodes([]);
        return;
      }

      setError(null);
      
      // Transform to frontend format
      const transformed: PNode[] = nodes.map((node: any) => ({
        pubkey: node.pubkey,
        gossip: node.gossip_address,
        version: node.version,
        latency: node.latency,
        online: node.online_status === 'online',
        lastSeen: node.last_seen,
        location: node.location,
      }));
      
      setNodes(transformed);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch nodes:', err);
      setError(`Failed to fetch nodes: ${String(err)}`);
      setNodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  // Compute Metrics
  const metrics: FrontendNodeMetrics = useMemo(() => {
    const total = nodes.length;
    const online = nodes.filter(n => n.online).length;
    const offline = total - online;
    const avgLatency = total > 0 ? nodes.reduce((acc, curr) => acc + curr.latency, 0) / total : 0;
    return { total, online, offline, avgLatency };
  }, [nodes]);

  // Filter & Sort Logic
  const processedNodes = useMemo(() => {
    let result = [...nodes];

    // Filter by Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.pubkey.toLowerCase().includes(lowerQuery) || 
        n.gossip.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter by Status
    if (filter.status !== 'all') {
      const isOnline = filter.status === 'online';
      result = result.filter(n => n.online === isOnline);
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle strings
      if (typeof valA === 'string' && typeof valB === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      // Handle boolean
      if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        valA = valA ? 1 : 0;
        valB = valB ? 1 : 0;
      }
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [nodes, searchQuery, filter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-time insights for Xandeum pNode Network
          </p>
          
          {error && (
            <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
            </div>
          )}
        </div>
        <div className="flex items-center text-sm text-slate-500 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
          <RefreshCw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
        </div>
      </div>

      <MetricsCards metrics={metrics} />

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Pubkey or Gossip Address..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <select 
              className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
            >
              <option value="all">All Status</option>
              <option value="online">Online Only</option>
              <option value="offline">Offline Only</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {loading && nodes.length === 0 ? (
        <div className="text-center py-12">
          <RefreshCw size={32} className="mx-auto animate-spin text-slate-400 mb-2" />
          <p className="text-slate-500">Loading nodes...</p>
        </div>
      ) : (
        <>
          <NodeTable 
            nodes={processedNodes} 
            sortField={sortField} 
            sortOrder={sortOrder}
            onSort={handleSort}
          />
          
          <div className="mt-4 text-center text-xs text-slate-400">
            Showing {processedNodes.length} of {nodes.length} nodes
          </div>
        </>
      )}
    </div>
  );
}
