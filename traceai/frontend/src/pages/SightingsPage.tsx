import React from 'react';
import { MOCK_SIGHTINGS } from '../data/mockData';
import { ConfidenceBar } from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { Camera } from 'lucide-react';

export default function SightingsPage() {
  const all = Object.values(MOCK_SIGHTINGS).flat();
  return (
    <div className="p-6 space-y-5">
      <h1 className="text-xl font-bold text-white">All CCTV Sightings</h1>
      <p className="text-xs text-amber-400">⚠ Mock textual descriptions — no real CCTV access</p>
      <div className="space-y-3">
        {all.map(s => (
          <Card key={s.id}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-blue-400">{s.sighting_id}</span>
                <span className="flex items-center gap-1 text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                  <Camera className="w-3 h-3" />{s.camera_id}
                </span>
                <span className="text-xs text-slate-500">{s.date} {s.time}</span>
                <span className="font-mono text-xs text-slate-500">{s.case_id}</span>
              </div>
              <div className="w-28 shrink-0"><ConfidenceBar value={s.confidence} /></div>
            </div>
            <p className="text-sm font-medium text-slate-300 mb-1">{s.location}</p>
            <p className="text-sm text-slate-400">{s.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
