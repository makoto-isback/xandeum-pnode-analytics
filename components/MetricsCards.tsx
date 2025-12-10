'use client';

import React from 'react';
import { Activity, Server, Wifi, WifiOff } from 'lucide-react';
import { FrontendNodeMetrics } from '@/lib/types';

interface MetricsCardsProps {
  metrics: FrontendNodeMetrics;
}

const Card = ({ title, value, icon: Icon, color, subtext }: any) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
  </div>
);

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card 
        title="Total pNodes" 
        value={metrics.total} 
        icon={Server} 
        color="bg-blue-500" 
        subtext="Active network participants"
      />
      <Card 
        title="Online Nodes" 
        value={metrics.online} 
        icon={Wifi} 
        color="bg-emerald-500" 
        subtext={`${metrics.total > 0 ? ((metrics.online / metrics.total) * 100).toFixed(1) : 0}% availability`}
      />
      <Card 
        title="Offline Nodes" 
        value={metrics.offline} 
        icon={WifiOff} 
        color="bg-red-500" 
        subtext="Last 24h"
      />
      <Card 
        title="Avg Latency" 
        value={`${Math.round(metrics.avgLatency)}ms`} 
        icon={Activity} 
        color="bg-purple-500" 
        subtext="Global network health"
      />
    </div>
  );
};
