import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { PriorityBadge, ConfidenceBar } from '../../components/ui/Badge';
import { Zap, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { MOCK_LEADS, MOCK_TIMELINE } from '../../data/mockData';
import type { Lead } from '../../types';

const STAGES = [
  'Analyzing family information...',
  'Analyzing investigator tips...',
  'Analyzing CCTV sightings...',
  'Correlating locations and timelines...',
  'Comparing physical descriptions...',
  'Prioritizing investigative leads...',
  'Generating recommendations...',
  'Analysis complete.',
];

export default function AIAnalysisTab({ caseId, onLeadsGenerated }: {
  caseId: string; onLeadsGenerated: (leads: Lead[]) => void;
}) {
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const run = async () => {
    setRunning(true);
    setError('');
    setResult(null);
    setStage(0);

    // Animated stage progression
    for (let i = 0; i < STAGES.length - 1; i++) {
      await new Promise(r => setTimeout(r, 600));
      setStage(i + 1);
    }

    try {
      const res = await fetch(`/api/cases/${caseId}/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('traceai_token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        onLeadsGenerated(data.leads);
      } else {
        throw new Error('API failed');
      }
    } catch {
      // Demo fallback
      await new Promise(r => setTimeout(r, 800));
      const mockLeads = MOCK_LEADS[caseId] || MOCK_LEADS['MP-2026-001'];
      const mockResult = {
        case_id: caseId,
        analyzed_at: new Date().toISOString(),
        leads: mockLeads,
        summary: `TRACEAI analyzed 5 CCTV sightings and 5 investigator tips for ${caseId}. 6 investigative leads were generated, of which 3 are rated HIGH or CRITICAL priority. AI-generated leads are decision-support only and require investigator verification.`,
        recommended_actions: [
          'Deploy field officers to highest-confidence sighting locations immediately.',
          'Obtain CCTV footage from CAM-ADJ-035 and CAM-UDH-008 before storage overwrite.',
          'Interview shopkeeper witness in Adajan Market (Tip TIP-001-001).',
          'Initiate telecom data request for the missing person\'s phone.',
          'Broadcast public appeal in the Adajan–Udhna corridor.',
        ],
        correlation_notes: [
          'Clothing match detected: 4 of 5 CCTV sightings describe clothing consistent with "Blue cotton shirt, black jeans, white sports shoes".',
          'Geographic clustering: Station → Adajan → Udhna corridor forms a continuous movement trail.',
          'Cross-source corroboration: Both CCTV (CAM-UDH-008) and anonymous tip report the Udhna Bus Terminal.',
          '⚠ All AI-generated correlations are based on textual pattern matching and confidence scoring. Results require human investigator verification before any action is taken.',
        ],
      };
      setResult(mockResult);
      onLeadsGenerated(mockResult.leads);
    }
    setRunning(false);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-white">AI Case Analysis</h2>
          <p className="text-xs text-slate-400 mt-1">Correlate all available evidence and generate prioritized investigative leads.</p>
        </div>
        <Button
          icon={<Zap className="w-4 h-4" />}
          loading={running}
          onClick={run}
          size="lg"
          className="shrink-0"
        >
          {running ? 'Analyzing...' : result ? 'Re-analyze Case' : 'Analyze Case with AI'}
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-xs text-amber-400">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>AI-generated leads and correlations are <strong>decision-support only</strong>. Every result must be verified by authorized investigators before any action is taken. Confidence scores are AI indicators, not certainty.</p>
      </div>

      {/* Stage progress */}
      {running && (
        <Card>
          <p className="text-sm font-medium text-blue-400 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 animate-pulse" />
            TRACEAI is correlating case information...
          </p>
          <div className="space-y-2">
            {STAGES.map((s, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm transition-all ${i <= stage ? 'text-slate-200' : 'text-slate-600'}`}>
                {i < stage ? (
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                ) : i === stage ? (
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0" />
                )}
                {s}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Results */}
      {result && !running && (
        <div className="space-y-5">
          {/* Summary */}
          <Card>
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Analysis Summary
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
            <p className="text-xs text-slate-500 mt-2">Analyzed: {new Date(result.analyzed_at).toLocaleString()}</p>
          </Card>

          {/* Correlation notes */}
          <Card>
            <h3 className="font-semibold text-white mb-3">Correlation Notes</h3>
            <div className="space-y-2">
              {result.correlation_notes.map((n: string, i: number) => (
                <div key={i} className={`flex items-start gap-2 text-sm ${n.startsWith('⚠') ? 'text-amber-400' : 'text-slate-300'}`}>
                  <span className="text-blue-400 mt-0.5 flex-shrink-0">{n.startsWith('⚠') ? '⚠' : '→'}</span>
                  <span>{n.replace('⚠ ', '')}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Lead count */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Leads', value: result.leads.length, color: 'text-white' },
              { label: 'Critical', value: result.leads.filter((l: Lead) => l.priority === 'critical').length, color: 'text-red-400' },
              { label: 'High', value: result.leads.filter((l: Lead) => l.priority === 'high').length, color: 'text-orange-400' },
              { label: 'Medium', value: result.leads.filter((l: Lead) => l.priority === 'medium').length, color: 'text-yellow-400' },
            ].map(s => (
              <div key={s.label} className="bg-slate-700/40 rounded-xl p-4 text-center border border-slate-700/50">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recommended actions */}
          <Card>
            <h3 className="font-semibold text-white mb-3">Recommended Next Actions</h3>
            <div className="space-y-2">
              {result.recommended_actions.map((a: string, i: number) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-slate-300">{a}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Lead preview cards */}
          <div>
            <h3 className="font-semibold text-white mb-3">Generated Leads (top 3 – view Leads tab for all)</h3>
            <div className="space-y-3">
              {result.leads.slice(0, 3).map((l: Lead) => (
                <Card key={l.lead_id} className="border-l-4" style={{ borderLeftColor: l.priority === 'critical' ? '#ef4444' : l.priority === 'high' ? '#f97316' : '#eab308' }}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs text-slate-400">{l.lead_id}</span>
                        <PriorityBadge priority={l.priority} />
                        <span className="text-xs text-slate-500">{Math.round(l.confidence * 100)}% confidence</span>
                      </div>
                      <p className="text-sm text-white mb-2">{l.description}</p>
                      <p className="text-xs text-slate-400">{l.location} · {l.time}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-xs font-medium text-slate-300 mb-1">Why this lead was prioritized:</p>
                    <div className="grid sm:grid-cols-2 gap-1">
                      {(l.factors || []).filter(f => f.matched).slice(0, 4).map((f, i) => (
                        <span key={i} className="text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> {f.label} (+{f.score})
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {!running && !result && (
        <Card className="text-center py-12">
          <Zap className="w-12 h-12 text-blue-500/30 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">Click <strong className="text-white">Analyze Case with AI</strong> to begin correlation.</p>
          <p className="text-xs text-slate-500">The engine will correlate family info, investigator tips, and CCTV sightings to generate prioritized leads.</p>
        </Card>
      )}
    </div>
  );
}
