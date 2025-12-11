'use client';

import React, { useEffect, useState } from 'react';

export default function DebugPRPC() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeMs, setTimeMs] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const start = Date.now();
      try {
        const res = await fetch('/api/prpc?method=getGossipNodes');
        const json = await res.json().catch(() => null);
        const took = Date.now() - start;
        if (!mounted) return;
        setTimeMs(took);
        setResult({ status: res.status, ok: json?.ok ?? null, json });
      } catch (e: any) {
        const took = Date.now() - start;
        if (!mounted) return;
        setTimeMs(took);
        setResult({ ok: false, error: e?.message ?? String(e) });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">pRPC Debug</h2>
      {loading && <div>Loading...</div>}
      {!loading && result && (
        <div className="space-y-2 text-sm">
          <div><strong>Response time:</strong> {timeMs}ms</div>
          <div><strong>HTTP status:</strong> {result.status ?? '—'}</div>
          <div><strong>Success:</strong> {String(result.ok)}</div>
          <div><strong>Body:</strong></div>
          <pre className="bg-slate-100 p-3 rounded text-xs overflow-auto">{JSON.stringify(result.json ?? result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
