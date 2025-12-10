'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpDown, Circle, ChevronRight } from 'lucide-react';
import { PNode, SortField, SortOrder } from '@/lib/types';
import { truncate, formatTimeAgo, cn } from '@/lib/utils';

interface NodeTableProps {
  nodes: PNode[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

export const NodeTable: React.FC<NodeTableProps> = ({ nodes, sortField, sortOrder, onSort }) => {
  const SortIcon = ({ field }: { field: SortField }) => {
    return (
      <button 
        onClick={() => onSort(field)} 
        className={cn(
          'ml-1 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors',
          sortField === field ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
        )}
      >
        <ArrowUpDown size={14} />
      </button>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 w-[200px]">
                <div className="flex items-center">
                  Pubkey
                  <SortIcon field="pubkey" />
                </div>
              </th>
              <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">
                <div className="flex items-center">
                  Gossip Address
                </div>
              </th>
              <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 w-[120px]">
                <div className="flex items-center">
                  Version
                  <SortIcon field="version" />
                </div>
              </th>
              <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 w-[120px]">
                <div className="flex items-center">
                  Latency
                  <SortIcon field="latency" />
                </div>
              </th>
              <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 w-[120px]">
                <div className="flex items-center">
                  Status
                  <SortIcon field="online" />
                </div>
              </th>
              <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 w-[150px]">
                <div className="flex items-center">
                  Last Seen
                  <SortIcon field="lastSeen" />
                </div>
              </th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {nodes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  No nodes found matching your criteria.
                </td>
              </tr>
            ) : (
              nodes.map((node) => (
                <tr 
                  key={node.pubkey} 
                  className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white font-mono">
                    {truncate(node.pubkey, 12)}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                    {node.gossip}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                      {node.version}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'font-medium',
                      node.latency < 50 ? 'text-emerald-600' : node.latency < 150 ? 'text-yellow-600' : 'text-red-600'
                    )}>
                      {node.latency}ms
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Circle size={10} className={cn('mr-2 fill-current', node.online ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600')} />
                      <span className={cn('text-xs font-medium', node.online ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500')}>
                        {node.online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {formatTimeAgo(node.lastSeen)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/node/${encodeURIComponent(node.pubkey)}`}>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors ml-auto" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
