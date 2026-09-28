import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { PriorityBadge, StatusBadge, ConfidenceBar } from '../../components/ui/Badge';
import { Filter, CheckCircle, X, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import type { Lead } from '../../types';

export default function LeadsTab({ caseId, initialLeads, onUpdate }: {
  caseId: string; initialLeads: Lead[]; onUpdate: (leads: Lead[]) => void;
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<Record<string, string>>({});

  const update = async (leadId: string, changes: Partial<Lead>) => {
    const updated = leads.map(l => l.lead_id === leadId ? { ...l, ...changes } : l);
    setLeads(updated);
    onUpdate(updated);
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('traceai_token')}` },
        body: JSON.stringify(changes),
      });
    } catch { /* demo mode */ }
  };

  const filtered = leads.filter(l => {
    const pOk = filterPriority === 'all' || l.priority === filterPriority;
    const sOk = filterStatus === 'all' || l.status === filterStatus;
    return pOk && sOk;
  });

  const borderColor = (p: string) => {
    if (p === 'critical') return 'border-l-red-500';
    if (p === 'high') return 'border-l-orange-500';
    if (p === 'medium') return 'border-l-yellow-500';
    return 'border-l-blue-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold text-white">Investigative Leads ({filtered.length})</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="bg-transparent text-slate-300 outline-none">
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-transparent text-slate-300 outline-none">
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="under_review">Under Review</option>
              <option value="verified">Verified</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          No leads match your filters. Run AI analysis to generate leads.
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(lead => (
          <Card key={lead.lead_id} className={`border-l-4 ${borderColor(lead.priority)} ${lead.status === 'dismissed' ? 'opacity-50' : ''}`}>
            {/* Lead header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="font-mono text-xs text-slate-400">{lead.lead_id}</span>
                  <PriorityBadge priority={lead.priority} />
                  <StatusBadge status={lead.status} />
                </div>
                <p className="text-sm text-white mb-1">{lead.description}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  <span>{lead.location}</span>
                  <span>·</span>
                  <span>{lead.time}</span>
                  <span>·</span>
                  <span>Source: {lead.source}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="w-28">
                  <ConfidenceBar value={lead.confidence} />
                </div>
                <button onClick={() => setExpanded(expanded === lead.lead_id ? null : lead.lead_id)}
                  className="text-xs text-slate-400 hover:text-white mt-1 flex items-center gap-1 ml-auto">
                  {expanded === lead.lead_id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {expanded === lead.lead_id ? 'Less' : 'Details'}
                </button>
              </div>
            </div>

            {/* Expanded detail */}
            {expanded === lead.lead_id && (
              <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-4">
                {/* Reasoning */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">Why This Lead Was Prioritized</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">{lead.reasoning}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {(lead.factors || []).map((f, i) => (
                      <div key={i} className={`flex items-center gap-2 text-xs rounded-lg p-2 ${f.matched ? 'bg-green-500/10 text-green-400' : 'bg-slate-700/30 text-slate-500'}`}>
                        {f.matched
                          ? <CheckCircle className="w-3 h-3 flex-shrink-0" />
                          : <X className="w-3 h-3 flex-shrink-0" />}
                        <div>
                          <span className="font-medium">{f.label}</span>
                          {f.matched && <span className="ml-1 text-slate-400">(+{f.score})</span>}
                          <p className="text-slate-500 mt-0.5">{f.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended action */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">Recommended Next Actions</h4>
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                    {lead.recommended_action.split('\n').map((line, i) => (
                      <p key={i} className="text-xs text-slate-300 mb-0.5">{line}</p>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {lead.notes && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wide">Investigator Notes</h4>
                    <p className="text-xs text-slate-400 bg-slate-700/30 rounded-lg p-3">{lead.notes}</p>
                  </div>
                )}

                {/* Add note */}
                <div className="flex gap-2">
                  <input
                    value={noteInput[lead.lead_id] || ''}
                    onChange={e => setNoteInput(n => ({ ...n, [lead.lead_id]: e.target.value }))}
                    placeholder="Add investigator note..."
                    className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <Button size="sm" variant="secondary" icon={<MessageSquare className="w-3 h-3" />}
                    onClick={() => { update(lead.lead_id, { notes: noteInput[lead.lead_id] }); setNoteInput(n => ({ ...n, [lead.lead_id]: '' })); }}>
                    Note
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => update(lead.lead_id, { status: 'under_review' })}>
                    Mark Under Review
                  </Button>
                  <Button size="sm" variant="secondary" icon={<CheckCircle className="w-3 h-3" />}
                    onClick={() => update(lead.lead_id, { status: 'verified' })}>
                    Mark Verified
                  </Button>
                  <Button size="sm" variant="danger" icon={<X className="w-3 h-3" />}
                    onClick={() => update(lead.lead_id, { status: 'dismissed' })}>
                    Dismiss
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
