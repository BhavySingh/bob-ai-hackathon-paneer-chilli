import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Target, Eye, AlertCircle, ArrowRight, Zap, Clock, ChevronRight } from 'lucide-react';
import { StatCard } from '../components/ui/Card';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { MOCK_CASES } from '../data/mockData';
import type { Case, DashboardStats } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    active_cases: 0, high_priority_leads: 0, new_sightings: 0, cases_requiring_review: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try API, fall back to mock data
    const load = async () => {
      try {
        const [casesRes, statsRes] = await Promise.all([
          fetch('/api/cases', { headers: { Authorization: `Bearer ${localStorage.getItem('traceai_token')}` } }),
          fetch('/api/dashboard/stats', { headers: { Authorization: `Bearer ${localStorage.getItem('traceai_token')}` } }),
        ]);
        if (casesRes.ok) setCases(await casesRes.json());
        else setCases(MOCK_CASES);
        if (statsRes.ok) setStats(await statsRes.json());
        else setStats({ active_cases: 12, high_priority_leads: 7, new_sightings: 18, cases_requiring_review: 4 });
      } catch {
        setCases(MOCK_CASES);
        setStats({ active_cases: 12, high_priority_leads: 7, new_sightings: 18, cases_requiring_review: 4 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayCases = cases.length > 0 ? cases : MOCK_CASES;

  return (
    <div className="p-6 space-y-6">
      {/* Demo banner */}
      <div className="flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg text-xs text-blue-400">
        <Zap className="w-4 h-4 flex-shrink-0" />
        <span>
          <strong>DEMO MODE</strong> — Sample data loaded. Click{' '}
          <button
            onClick={() => navigate('/cases/MP-2026-001')}
            className="underline hover:text-blue-300"
          >
            Load Demo Case (MP-2026-001)
          </button>{' '}
          to view the complete investigation workflow.
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Active Cases" value={stats.active_cases} color="blue" icon={<FolderOpen className="w-5 h-5" />} sub="Currently open" />
        <StatCard label="High Priority Leads" value={stats.high_priority_leads} color="orange" icon={<Target className="w-5 h-5" />} sub="Requires attention" />
        <StatCard label="New Sightings" value={stats.new_sightings} color="purple" icon={<Eye className="w-5 h-5" />} sub="CCTV & witness" />
        <StatCard label="Needs Review" value={stats.cases_requiring_review} color="red" icon={<AlertCircle className="w-5 h-5" />} sub="Pending cases" />
      </div>

      {/* Cases table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <h2 className="font-semibold text-white">Active Cases</h2>
          <div className="flex items-center gap-2">
            <input
              placeholder="Search cases..."
              className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-44"
            />
            <Button size="sm" onClick={() => navigate('/cases/new')}>New Case</Button>
          </div>
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
                <th className="text-left px-5 py-3">Updated</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {displayCases.map(c => (
                <tr key={c.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                  <td className="px-5 py-3 font-mono text-blue-400 text-xs">{c.case_id}</td>
                  <td className="px-5 py-3 font-medium text-white">{c.missing_person.full_name}</td>
                  <td className="px-5 py-3 text-slate-400">{c.missing_person.age}</td>
                  <td className="px-5 py-3 text-slate-400 max-w-[180px] truncate">{c.missing_person.last_seen_location}</td>
                  <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{new Date(c.updated_at).toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <Button size="sm" variant="ghost" icon={<ChevronRight className="w-3 h-3" />} onClick={() => navigate(`/cases/${c.case_id}`)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <QuickAction
          icon={<Zap className="w-5 h-5 text-blue-400" />}
          title="Run AI Analysis"
          desc="Analyze demo case MP-2026-001"
          onClick={() => navigate('/cases/MP-2026-001?tab=analysis')}
        />
        <QuickAction
          icon={<Clock className="w-5 h-5 text-purple-400" />}
          title="Investigation Timeline"
          desc="View chronological event timeline"
          onClick={() => navigate('/timeline')}
        />
        <QuickAction
          icon={<ArrowRight className="w-5 h-5 text-green-400" />}
          title="View All Leads"
          desc="Review prioritized investigative leads"
          onClick={() => navigate('/leads')}
        />
      </div>
    </div>
  );
}

function QuickAction({ icon, title, desc, onClick }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/30 hover:bg-slate-700/40 transition-all text-left flex items-center gap-4 card-hover w-full"
    >
      <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">{icon}</div>
      <div>
        <p className="font-medium text-white text-sm">{title}</p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
    </button>
  );
}
