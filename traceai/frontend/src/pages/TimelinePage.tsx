import React, { useState } from 'react';
import TimelineTab from './case-tabs/TimelineTab';
import { MOCK_TIMELINE } from '../data/mockData';
import type { TimelineEvent } from '../types';

export default function TimelinePage() {
  const [selectedCase, setSelectedCase] = useState('MP-2026-001');
  const events: TimelineEvent[] = MOCK_TIMELINE[selectedCase] || [];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">Investigation Timeline</h1>
        <select
          value={selectedCase}
          onChange={e => setSelectedCase(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="MP-2026-001">MP-2026-001 – Rahul Sharma</option>
          <option value="MP-2026-002">MP-2026-002 – Meera Krishnan</option>
          <option value="MP-2026-003">MP-2026-003 – Arjun Mehta</option>
        </select>
      </div>
      <TimelineTab events={events} />
    </div>
  );
}
