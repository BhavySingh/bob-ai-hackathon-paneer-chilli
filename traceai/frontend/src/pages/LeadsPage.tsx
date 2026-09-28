import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PriorityBadge, StatusBadge, ConfidenceBar } from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { MOCK_LEADS } from '../data/mockData';
import type { Lead } from '../types';
import { Filter, ChevronRight } from 'lucide-react';

export default function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    // Aggregate all mock leads for global view
    const all = Object.values(MOCK_LEADS).flat();
    setLeads(all);
  }, []);

  const filtered = leads.filter(l => filterPriority === 'all' || l.priority === filterPriority);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">All Investigative Leads</h1>
        <div className="flex items-center gap-2 text-xs bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="bg-transparent text-slate-300 outline-none">
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(l => (
          <Card key={l.lead_id} className="cursor-pointer hover:border-blue-500/30 transition-all"
            onClick={() => navigate(`/cases/${l.case_id}?tab=leads`)}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="font-mono text-xs text-blue-400">{l.lead_id}</span>
                  <span className="font-mono text-xs text-slate-500">{l.case_id}</span>
                  <PriorityBadge priority={l.priority} />
                  <StatusBadge status={l.status} />
                </div>
                <p className="text-sm text-white mb-1">{l.description.slice(0, 150)}...</p>
                <p className="text-xs text-slate-400">{l.location} · {l.time}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="w-28"><ConfidenceBar value={l.confidence} /></div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
