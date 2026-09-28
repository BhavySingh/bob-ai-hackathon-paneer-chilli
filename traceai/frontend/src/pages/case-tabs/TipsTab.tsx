import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ConfidenceBar, StatusBadge } from '../../components/ui/Badge';
import { Plus, X } from 'lucide-react';
import type { InvestigatorTip, TipSource } from '../../types';

const SOURCE_LABELS: Record<TipSource, string> = {
  witness: 'Witness', phone_call: 'Phone Call', field_officer: 'Field Officer',
  community_tip: 'Community Tip', social_media: 'Social Media', other: 'Other',
};

const emptyTip = {
  date: '', time: '', source_type: 'witness' as TipSource, location: '',
  description: '', witness_description: '', confidence: 0.5, supporting_notes: '',
};

export default function TipsTab({ caseId, initial }: { caseId: string; initial: InvestigatorTip[] }) {
  const [tips, setTips] = useState<InvestigatorTip[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyTip });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const add = async () => {
    setSaving(true);
    try {
      const r = await fetch(`/api/cases/${caseId}/tips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('traceai_token')}` },
        body: JSON.stringify(form),
      });
      if (r.ok) {
        const newTip = await r.json();
        setTips(t => [newTip, ...t]);
      } else throw new Error();
    } catch {
      // demo mode – add locally
      const mockTip: InvestigatorTip = {
        ...form, id: Date.now(), tip_id: `TIP-DEMO-${Date.now()}`,
        case_id: caseId, created_at: new Date().toISOString(),
      };
      setTips(t => [mockTip, ...t]);
    }
    setForm({ ...emptyTip });
    setShowForm(false);
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">Investigator Tips ({tips.length})</h2>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Tip'}
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-500/30">
          <h3 className="font-medium text-white mb-4">New Investigator Tip</h3>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
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
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Source Type</label>
              <select value={form.source_type} onChange={e => set('source_type', e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Location</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Location of sighting / tip"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Witness Description (if applicable)</label>
              <input value={form.witness_description} onChange={e => set('witness_description', e.target.value)}
                placeholder="Physical description of person seen..."
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Confidence: {Math.round(form.confidence * 100)}%</label>
              <input type="range" min="0" max="100" value={form.confidence * 100}
                onChange={e => set('confidence', parseInt(e.target.value) / 100)}
                className="w-full accent-blue-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Supporting Notes</label>
              <input value={form.supporting_notes} onChange={e => set('supporting_notes', e.target.value)}
                placeholder="Additional notes..."
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button loading={saving} onClick={add}>Add Tip</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {tips.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">No tips recorded yet. Add the first tip above.</div>
        )}
        {tips.map(tip => (
          <Card key={tip.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-blue-400">{tip.tip_id}</span>
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded capitalize">{SOURCE_LABELS[tip.source_type]}</span>
                <span className="text-xs text-slate-500">{tip.date} {tip.time}</span>
              </div>
              <div className="text-right text-xs text-slate-400 shrink-0">
                <ConfidenceBar value={tip.confidence} />
              </div>
            </div>
            <p className="text-sm text-slate-300 font-medium">{tip.location}</p>
            <p className="text-sm text-slate-400 leading-relaxed">{tip.description}</p>
            {tip.witness_description && (
              <div className="bg-slate-700/30 rounded-lg px-3 py-2">
                <span className="text-xs text-slate-500">Witness description: </span>
                <span className="text-xs text-slate-300">{tip.witness_description}</span>
              </div>
            )}
            {tip.supporting_notes && (
              <p className="text-xs text-slate-500 italic">{tip.supporting_notes}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
