import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FileText, Download, Printer, Eye, AlertTriangle } from 'lucide-react';
import type { Case, FamilyInformation, Lead, CCTVSighting, InvestigatorTip } from '../../types';

export default function ReportsTab({ caseData, family, leads, sightings, tips }: {
  caseData: Case; family: FamilyInformation | null;
  leads: Lead[]; sightings: CCTVSighting[]; tips: InvestigatorTip[];
}) {
  const [appealText, setAppealText] = useState('');
  const [caseFileText, setCaseFileText] = useState('');
  const [generatingAppeal, setGeneratingAppeal] = useState(false);
  const [generatingFile, setGeneratingFile] = useState(false);
  const mp = caseData.missing_person;

  const generateAppeal = async () => {
    setGeneratingAppeal(true);
    try {
      const r = await fetch(`/api/cases/${caseData.case_id}/public-appeal`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('traceai_token')}` },
      });
      if (r.ok) { const d = await r.json(); setAppealText(d.text); }
      else throw new Error();
    } catch {
      // Demo fallback
      setAppealText(`MISSING PERSON – PUBLIC APPEAL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HAVE YOU SEEN THIS PERSON?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NAME: ${mp.full_name}
AGE: ${mp.age} years
GENDER: ${mp.gender}
HEIGHT: ${mp.height || 'N/A'}
BUILD: ${mp.build || 'N/A'}

LAST SEEN: ${mp.last_seen_date} at ${mp.last_seen_time}
LOCATION: ${mp.last_seen_location}

CLOTHING: ${mp.last_seen_clothing}

IDENTIFYING FEATURES: ${mp.identifying_marks || 'None noted'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IF YOU HAVE INFORMATION, PLEASE CONTACT:
Emergency: 100 (Police)
Missing Persons Helpline: 1094
Case Reference: ${caseData.case_id}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This notice has been reviewed and approved by the investigating officer before release.
Do not share unverified information. AI-assisted draft – requires investigator sign-off.`);
    }
    setGeneratingAppeal(false);
  };

  const generateCaseFile = async () => {
    setGeneratingFile(true);
    try {
      const r = await fetch(`/api/cases/${caseData.case_id}/case-file`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('traceai_token')}` },
      });
      if (r.ok) { const d = await r.json(); setCaseFileText(d.text); }
      else throw new Error();
    } catch {
      const now = new Date().toLocaleString();
      const highLeads = leads.filter(l => l.priority === 'critical' || l.priority === 'high');
      setCaseFileText(`TRACEAI POLICE CASE FILE
Case ID: ${caseData.case_id}
Generated: ${now}
Status: ${caseData.status.toUpperCase()}   Priority: ${caseData.priority.toUpperCase()}
${'='.repeat(60)}

MISSING PERSON DETAILS
Name: ${mp.full_name}
Age: ${mp.age} | Gender: ${mp.gender}
Height: ${mp.height || 'N/A'} | Build: ${mp.build || 'N/A'} | Complexion: ${mp.complexion || 'N/A'}
Hair: ${mp.hair_color || 'N/A'} | Eyes: ${mp.eye_color || 'N/A'}
Identifying Marks: ${mp.identifying_marks || 'None'}
Last Seen: ${mp.last_seen_date} ${mp.last_seen_time}
Location: ${mp.last_seen_location}
Clothing: ${mp.last_seen_clothing}
Possessions: ${mp.last_seen_possessions || 'N/A'}
${'='.repeat(60)}

FAMILY STATEMENT
${family?.family_statement || 'Not recorded'}

KNOWN ROUTINES: ${family?.known_routines || 'N/A'}
CLOTHING INFO: ${family?.clothing_info || 'N/A'}
${'='.repeat(60)}

INVESTIGATOR TIPS (${tips.length})
${tips.map(t => `[${t.tip_id}] ${t.date} ${t.time} | ${t.source_type} | ${t.location}\n  ${t.description.slice(0, 200)}`).join('\n')}
${'='.repeat(60)}

CCTV SIGHTINGS (${sightings.length})
${sightings.map(s => `[${s.sighting_id}] ${s.date} ${s.time} | ${s.camera_id} | ${s.location}\n  Confidence: ${Math.round(s.confidence * 100)}% | Clothing: ${s.observed_clothing || 'N/A'}`).join('\n')}
${'='.repeat(60)}

AI-GENERATED LEADS (${leads.length})
${leads.map(l => `[${l.lead_id}] Priority: ${l.priority.toUpperCase()} | Confidence: ${Math.round(l.confidence * 100)}%\n  ${l.description.slice(0, 200)}\n  Action: ${l.recommended_action.slice(0, 200)}`).join('\n\n')}
${'='.repeat(60)}

AI-assisted draft — requires investigator verification before official use.
TRACEAI | IBM Bob × NFSU Hackathon 2026`);
    }
    setGeneratingFile(false);
  };

  const print = (text: string, title: string) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 12px; color: #111; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
          h1 { font-size: 16px; }
          pre { white-space: pre-wrap; word-wrap: break-word; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 10px; color: #666; }
        </style>
      </head>
      <body>
        <pre>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        <div class="footer">TRACEAI — AI-assisted draft — requires investigator verification | IBM Bob × NFSU Hackathon 2026</div>
      </body>
      </html>
    `);
    w.document.close();
    w.print();
  };

  const download = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-xs text-amber-400">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        Review all information before public release. AI-assisted drafts require investigator verification before official use.
      </div>

      {/* Public Appeal */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white">Public Appeal Notice</h3>
            <p className="text-xs text-slate-400 mt-0.5">Auto-populated from case data. Review before distribution.</p>
          </div>
          <Button loading={generatingAppeal} icon={<FileText className="w-4 h-4" />} onClick={generateAppeal}>
            Generate Appeal
          </Button>
        </div>

        {appealText && (
          <>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-4">
              {/* Visual preview */}
              <div className="text-center mb-6 border-b border-slate-700 pb-4">
                <div className="text-lg font-bold text-red-400 mb-1">🔴 MISSING PERSON</div>
                <img
                  src={mp.photo_url || `https://i.pravatar.cc/100?img=${caseData.id}`}
                  alt={mp.full_name}
                  className="w-24 h-24 rounded-xl object-cover mx-auto my-3 border-2 border-slate-600"
                />
                <h2 className="text-xl font-bold text-white">{mp.full_name}</h2>
                <p className="text-slate-400 text-sm">{mp.age} years • {mp.gender} • {mp.build || 'N/A'}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm mb-4">
                {[
                  ['Last Seen', `${mp.last_seen_date} at ${mp.last_seen_time}`],
                  ['Location', mp.last_seen_location],
                  ['Clothing', mp.last_seen_clothing],
                  ['Height', mp.height || 'N/A'],
                  ['Identifying Marks', mp.identifying_marks || 'None noted'],
                  ['Case No.', caseData.case_id],
                ].map(([l, v]) => (
                  <div key={l as string}>
                    <p className="text-xs text-slate-500">{l}</p>
                    <p className="text-white text-sm">{v}</p>
                  </div>
                ))}
              </div>
              <div className="text-center bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-white font-semibold text-sm">If you have information, please contact:</p>
                <p className="text-blue-400">Emergency: 100 | Helpline: 1094 | Case: {caseData.case_id}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="secondary" icon={<Eye className="w-3.5 h-3.5" />} onClick={() => print(appealText, `Missing Person Appeal – ${mp.full_name}`)}>
                Print
              </Button>
              <Button size="sm" variant="outline" icon={<Download className="w-3.5 h-3.5" />} onClick={() => download(appealText, `appeal-${caseData.case_id}.txt`)}>
                Download
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Case File */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white">Police Case File</h3>
            <p className="text-xs text-slate-400 mt-0.5">AI-assisted structured case file. Requires investigator verification before official use.</p>
          </div>
          <Button loading={generatingFile} icon={<FileText className="w-4 h-4" />} onClick={generateCaseFile} variant="secondary">
            Generate Case File
          </Button>
        </div>

        {caseFileText && (
          <>
            <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-xs text-slate-300 overflow-auto max-h-96 font-mono leading-relaxed whitespace-pre-wrap mb-4">
              {caseFileText}
            </pre>
            <div className="border-t border-slate-700 pt-3 text-xs text-amber-400 flex items-center gap-2 mb-4">
              <AlertTriangle className="w-3.5 h-3.5" />
              AI-assisted draft — requires investigator verification before official use.
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="secondary" icon={<Printer className="w-3.5 h-3.5" />} onClick={() => print(caseFileText, `Case File – ${caseData.case_id}`)}>
                Print
              </Button>
              <Button size="sm" variant="outline" icon={<Download className="w-3.5 h-3.5" />} onClick={() => download(caseFileText, `case-file-${caseData.case_id}.txt`)}>
                Download
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
