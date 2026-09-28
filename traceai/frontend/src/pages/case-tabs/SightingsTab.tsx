import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ConfidenceBar } from '../../components/ui/Badge';
import { Plus, Camera } from 'lucide-react';
import type { CCTVSighting } from '../../types';

const empty = {
  camera_id: '', location: '', date: '', time: '', description: '',
  observed_clothing: '', approximate_age: '', direction_of_movement: '', confidence: 0.5, lat: '', lng: '',
};

export default function SightingsTab({ caseId, initial }: { caseId: string; initial: CCTVSighting[] }) {
  const [sightings, setSightings] = useState<CCTVSighting[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const add = async () => {
    setSaving(true);
    const payload = { ...form, approximate_age: form.approximate_age ? parseInt(form.approximate_age) : undefined, lat: form.lat ? parseFloat(form.lat) : undefined, lng: form.lng ? parseFloat(form.lng) : undefined };
    try {
      const r = await fetch(`/api/cases/${caseId}/sightings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('traceai_token')}` },
        body: JSON.stringify(payload),
      });
      if (r.ok) { const s = await r.json(); setSightings(prev => [s, ...prev]); }
      else throw new Error();
    } catch {
      const mock: CCTVSighting = { ...payload, id: Date.now(), sighting_id: `CCTV-DEMO-${Date.now()}`, case_id: caseId, confidence: form.confidence, approximate_age: form.approximate_age ? parseInt(form.approximate_age) : undefined };
      setSightings(prev => [mock, ...prev]);
    }
    setForm({ ...empty });
    setShowForm(false);
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">CCTV Sightings ({sightings.length})</h2>
          <p className="text-xs text-amber-400 mt-0.5">⚠ Mock textual descriptions — no real CCTV access</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Sighting'}
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-500/30">
          <h3 className="font-medium text-white mb-4">New CCTV Sighting</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {[
              { label: 'Camera ID', k: 'camera_id', placeholder: 'CAM-SRT-042' },
              { label: 'Location', k: 'location', placeholder: 'Surat Railway Station – Exit' },
            ].map(f => (
              <div key={f.k}>
                <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
                <input value={(form as any)[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.placeholder}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
            ))}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Time</label>
              <input type="time" value={form.time} onChange={e => set('time', e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Describe what the camera captured..."
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Observed Clothing</label>
                <input value={form.observed_clothing} onChange={e => set('observed_clothing', e.target.value)} placeholder="Blue shirt, dark jeans..."
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Approximate Age</label>
                <input type="number" value={form.approximate_age} onChange={e => set('approximate_age', e.target.value)} placeholder="20"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Direction of Movement</label>
              <input value={form.direction_of_movement} onChange={e => set('direction_of_movement', e.target.value)} placeholder="North-east toward main gate..."
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Confidence: {Math.round(form.confidence * 100)}%</label>
              <input type="range" min="0" max="100" value={form.confidence * 100} onChange={e => set('confidence', parseInt(e.target.value) / 100)}
                className="w-full accent-blue-500" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button loading={saving} onClick={add}>Add Sighting</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {sightings.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">No CCTV sightings recorded. Add a mock sighting above.</div>
        )}
        {sightings.map(s => (
          <Card key={s.id}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-blue-400">{s.sighting_id}</span>
                <span className="flex items-center gap-1 text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                  <Camera className="w-3 h-3" />{s.camera_id}
                </span>
                <span className="text-xs text-slate-500">{s.date} {s.time}</span>
              </div>
              <div className="w-32 shrink-0">
                <ConfidenceBar value={s.confidence} />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-300 mb-1">{s.location}</p>
            <p className="text-sm text-slate-400 leading-relaxed mb-2">{s.description}</p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              {s.observed_clothing && <span>Clothing: <span className="text-slate-300">{s.observed_clothing}</span></span>}
              {s.approximate_age && <span>Age: <span className="text-slate-300">~{s.approximate_age}</span></span>}
              {s.direction_of_movement && <span>Direction: <span className="text-slate-300">{s.direction_of_movement}</span></span>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
