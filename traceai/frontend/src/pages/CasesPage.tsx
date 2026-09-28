import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronRight, Plus } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { MOCK_CASES } from '../data/mockData';
import type { Case } from '../types';

export default function CasesPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>(MOCK_CASES);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetch('/api/cases', { headers: { Authorization: `Bearer ${localStorage.getItem('traceai_token')}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setCases(d); })
      .catch(() => {});
  }, []);

  const filtered = cases.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.case_id.toLowerCase().includes(q) ||
      c.missing_person.full_name.toLowerCase().includes(q) ||
      c.missing_person.last_seen_location.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">All Cases</h1>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/cases/new')}>New Case</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, case ID, location..."
            className="bg-transparent text-sm text-slate-300 placeholder-slate-500 outline-none w-52"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-transparent text-sm text-slate-300 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-700/50 text-xs text-slate-500">
          {filtered.length} case(s) found
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 text-xs text-slate-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3">Case ID</th>
                <th className="text-left px-5 py-3">Missing Person</th>
                <th className="text-left px-5 py-3">Age</th>
                <th className="text-left px-5 py-3">Last Seen</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Priority</th>
                <th className="text-left px-5 py-3">Leads</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors cursor-pointer" onClick={() => navigate(`/cases/${c.case_id}`)}>
                  <td className="px-5 py-3 font-mono text-blue-400 text-xs">{c.case_id}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={c.missing_person.photo_url || `https://i.pravatar.cc/40?img=${c.id}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-medium text-white">{c.missing_person.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{c.missing_person.age}</td>
                  <td className="px-5 py-3 text-slate-400 max-w-[180px] truncate">{c.missing_person.last_seen_location}</td>
                  <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-5 py-3 text-slate-400">{c.lead_count ?? 0}</td>
                  <td className="px-5 py-3">
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500 text-sm">No cases found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
