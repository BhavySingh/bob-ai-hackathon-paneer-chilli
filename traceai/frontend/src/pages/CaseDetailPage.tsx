import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User, MapPin, Clock, Shield, ChevronLeft, Camera, FileText, Zap, Target,
  AlertTriangle, Plus, Edit, Download, Printer
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { MOCK_CASES, MOCK_FAMILY_INFO, MOCK_TIPS, MOCK_SIGHTINGS, MOCK_LEADS, MOCK_TIMELINE } from '../data/mockData';
import type { Case, FamilyInformation, InvestigatorTip, CCTVSighting, Lead, TimelineEvent } from '../types';
import FamilyTab from './case-tabs/FamilyTab';
import TipsTab from './case-tabs/TipsTab';
import SightingsTab from './case-tabs/SightingsTab';
import AIAnalysisTab from './case-tabs/AIAnalysisTab';
import LeadsTab from './case-tabs/LeadsTab';
import TimelineTab from './case-tabs/TimelineTab';
import MapTab from './case-tabs/MapTab';
import ReportsTab from './case-tabs/ReportsTab';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Shield },
  { id: 'family', label: 'Family Info', icon: User },
  { id: 'tips', label: 'Tips', icon: FileText },
  { id: 'sightings', label: 'CCTV Sightings', icon: Camera },
  { id: 'analysis', label: 'AI Analysis', icon: Zap },
  { id: 'leads', label: 'Leads', icon: Target },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'map', label: 'Map', icon: MapPin },
  { id: 'reports', label: 'Reports', icon: Download },
];

export default function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [family, setFamily] = useState<FamilyInformation | null>(null);
  const [tips, setTips] = useState<InvestigatorTip[]>([]);
  const [sightings, setSightings] = useState<CCTVSighting[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${localStorage.getItem('traceai_token')}` };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Try API first
      try {
        const caseRes = await fetch(`/api/cases/${caseId}`, { headers });
        if (caseRes.ok) {
          const c = await caseRes.json();
          setCaseData(c);
          const [fam, tipsR, sightR, leadsR, timeR] = await Promise.all([
            fetch(`/api/cases/${caseId}/family`, { headers }).then(r => r.ok ? r.json() : null),
            fetch(`/api/cases/${caseId}/tips`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`/api/cases/${caseId}/sightings`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`/api/cases/${caseId}/leads`, { headers }).then(r => r.ok ? r.json() : []),
            fetch(`/api/cases/${caseId}/timeline`, { headers }).then(r => r.ok ? r.json() : []),
          ]);
          setFamily(fam);
          setTips(tipsR);
          setSightings(sightR);
          setLeads(leadsR);
          setTimeline(timeR);
          setLoading(false);
          return;
        }
      } catch { /* fall through to mock */ }

      // Fallback to mock data
      const mc = MOCK_CASES.find(c => c.case_id === caseId) || MOCK_CASES[0];
      setCaseData(mc);
      setFamily(MOCK_FAMILY_INFO[caseId!] || MOCK_FAMILY_INFO['MP-2026-001']);
      setTips(MOCK_TIPS[caseId!] || MOCK_TIPS['MP-2026-001'] || []);
      setSightings(MOCK_SIGHTINGS[caseId!] || MOCK_SIGHTINGS['MP-2026-001'] || []);
      setLeads(MOCK_LEADS[caseId!] || MOCK_LEADS['MP-2026-001'] || []);
      setTimeline(MOCK_TIMELINE[caseId!] || MOCK_TIMELINE['MP-2026-001'] || []);
      setLoading(false);
    };
    if (caseId) load();
  }, [caseId]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!caseData) return (
    <div className="p-6 text-center text-slate-400">Case not found.</div>
  );

  const mp = caseData.missing_person;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/50">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate('/cases')} className="text-slate-400 hover:text-white mt-1 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4 flex-1">
            <img
              src={mp.photo_url || `https://i.pravatar.cc/80?img=${caseData.id}`}
              alt={mp.full_name}
              className="w-14 h-14 rounded-xl object-cover border-2 border-slate-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-white">{mp.full_name}</h1>
                <span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{caseData.case_id}</span>
                <StatusBadge status={caseData.status} />
                <PriorityBadge priority={caseData.priority} />
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-slate-400 flex-wrap">
                <span>{mp.age} years • {mp.gender}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{mp.last_seen_location}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{mp.last_seen_date} {mp.last_seen_time}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                <AlertTriangle className="w-3 h-3" />
                AI results require human verification
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-4 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && <OverviewTab caseData={caseData} family={family} tips={tips} sightings={sightings} leads={leads} setTab={setActiveTab} />}
        {activeTab === 'family' && <FamilyTab caseId={caseId!} initial={family} />}
        {activeTab === 'tips' && <TipsTab caseId={caseId!} initial={tips} />}
        {activeTab === 'sightings' && <SightingsTab caseId={caseId!} initial={sightings} />}
        {activeTab === 'analysis' && <AIAnalysisTab caseId={caseId!} onLeadsGenerated={l => { setLeads(l); setActiveTab('leads'); }} />}
        {activeTab === 'leads' && <LeadsTab caseId={caseId!} initialLeads={leads} onUpdate={setLeads} />}
        {activeTab === 'timeline' && <TimelineTab events={timeline} />}
        {activeTab === 'map' && <MapTab sightings={sightings} tips={tips} mp={mp} timeline={timeline} />}
        {activeTab === 'reports' && <ReportsTab caseData={caseData} family={family} leads={leads} sightings={sightings} tips={tips} />}
      </div>
    </div>
  );
}

function OverviewTab({ caseData, family, tips, sightings, leads, setTab }: {
  caseData: Case; family: FamilyInformation | null; tips: InvestigatorTip[];
  sightings: CCTVSighting[]; leads: Lead[]; setTab: (t: string) => void;
}) {
  const mp = caseData.missing_person;
  const highLeads = leads.filter(l => l.priority === 'critical' || l.priority === 'high');

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-3 gap-4">
        {/* Person details */}
        <Card className="md:col-span-2">
          <h3 className="font-semibold text-white mb-4">Person Details</h3>
          <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
            {[
              ['Full Name', mp.full_name], ['Age', mp.age], ['Gender', mp.gender],
              ['Height', mp.height || 'N/A'], ['Build', mp.build || 'N/A'], ['Complexion', mp.complexion || 'N/A'],
              ['Hair', mp.hair_color || 'N/A'], ['Eyes', mp.eye_color || 'N/A'],
              ['Last Seen Date', mp.last_seen_date], ['Last Seen Time', mp.last_seen_time],
            ].map(([l, v]) => (
              <div key={l as string}>
                <span className="text-slate-500 text-xs">{l}</span>
                <p className="text-white font-medium">{v}</p>
              </div>
            ))}
            <div className="sm:col-span-2">
              <span className="text-slate-500 text-xs">Last Seen Location</span>
              <p className="text-white font-medium">{mp.last_seen_location}</p>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 text-xs">Clothing</span>
              <p className="text-white">{mp.last_seen_clothing}</p>
            </div>
            {mp.identifying_marks && (
              <div className="sm:col-span-2">
                <span className="text-slate-500 text-xs">Identifying Marks</span>
                <p className="text-white">{mp.identifying_marks}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick stats */}
        <div className="space-y-3">
          {[
            { label: 'Investigator Tips', value: tips.length, tab: 'tips', color: 'text-blue-400' },
            { label: 'CCTV Sightings', value: sightings.length, tab: 'sightings', color: 'text-purple-400' },
            { label: 'AI Leads', value: leads.length, tab: 'leads', color: 'text-orange-400' },
            { label: 'High Priority', value: highLeads.length, tab: 'leads', color: 'text-red-400' },
          ].map(s => (
            <button key={s.tab} onClick={() => setTab(s.tab)} className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-left hover:border-blue-500/30 transition-all">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Family statement */}
      {family && (
        <Card>
          <h3 className="font-semibold text-white mb-3">Family Statement</h3>
          <p className="text-sm text-slate-300 leading-relaxed italic">"{family.family_statement}"</p>
        </Card>
      )}

      {/* Top leads preview */}
      {leads.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Top AI Leads</h3>
            <Button size="sm" variant="ghost" onClick={() => setTab('leads')}>View All</Button>
          </div>
          <div className="space-y-2">
            {leads.slice(0, 3).map(l => (
              <div key={l.lead_id} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                <PriorityBadge priority={l.priority} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{l.description.slice(0, 100)}…</p>
                  <p className="text-xs text-slate-400">{l.location} · Confidence: {Math.round(l.confidence * 100)}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!leads.length && (
        <Card className="text-center py-8">
          <Zap className="w-10 h-10 text-blue-500/40 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">No AI leads generated yet.</p>
          <Button icon={<Zap className="w-4 h-4" />} onClick={() => setTab('analysis')}>
            Run AI Analysis
          </Button>
        </Card>
      )}
    </div>
  );
}
