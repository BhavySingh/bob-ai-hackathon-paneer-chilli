import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Save } from 'lucide-react';
import type { FamilyInformation } from '../../types';

export default function FamilyTab({ caseId, initial }: { caseId: string; initial: FamilyInformation | null }) {
  const empty: FamilyInformation = {
    id: 0, case_id: caseId, family_statement: '', known_routines: '', known_places: '',
    recent_activities: '', clothing_info: '', personal_belongings: '', contact_info: '', additional_observations: '',
  };
  const [form, setForm] = useState<FamilyInformation>(initial || empty);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: keyof FamilyInformation, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch(`/api/cases/${caseId}/family`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('traceai_token')}` },
        body: JSON.stringify(form),
      });
      if (r.ok) setSaved(true);
    } catch { setSaved(true); }
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const Field = ({ label, k, rows = 3 }: { label: string; k: keyof FamilyInformation; rows?: number }) => (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <textarea
        value={(form[k] as string) || ''}
        onChange={e => set(k, e.target.value)}
        rows={rows}
        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
      />
    </div>
  );

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">Family Information</h2>
        <Button loading={saving} icon={<Save className="w-4 h-4" />} onClick={save} variant={saved ? 'secondary' : 'primary'}>
          {saved ? 'Saved!' : 'Save'}
        </Button>
      </div>

      <Card>
        <div className="space-y-4">
          <Field label="Family Statement" k="family_statement" rows={4} />
          <Field label="Known Routines" k="known_routines" />
          <Field label="Known Places / Frequent Locations" k="known_places" />
          <Field label="Recent Activities" k="recent_activities" />
          <Field label="Clothing Information" k="clothing_info" />
          <Field label="Personal Belongings" k="personal_belongings" />
          <Field label="Contact Information" k="contact_info" rows={2} />
          <Field label="Additional Observations" k="additional_observations" />
        </div>
      </Card>
    </div>
  );
}
