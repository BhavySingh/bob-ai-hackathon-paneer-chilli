import React, { useState } from 'react';
import { Clock, Users, Camera, Search, Cpu, Filter } from 'lucide-react';
import type { TimelineEvent, TimelineSource } from '../../types';

const SOURCE_COLORS: Record<TimelineSource, string> = {
  family: 'bg-blue-500 text-white',
  cctv: 'bg-purple-500 text-white',
  witness: 'bg-green-500 text-white',
  investigator: 'bg-orange-500 text-white',
  ai: 'bg-cyan-500 text-white',
};

const SOURCE_LABELS: Record<TimelineSource, string> = {
  family: 'Family', cctv: 'CCTV', witness: 'Witness', investigator: 'Investigator', ai: 'AI',
};

const SOURCE_ICONS: Record<TimelineSource, React.ReactNode> = {
  family: <Users className="w-3 h-3" />,
  cctv: <Camera className="w-3 h-3" />,
  witness: <Search className="w-3 h-3" />,
  investigator: <Search className="w-3 h-3" />,
  ai: <Cpu className="w-3 h-3" />,
};

export default function TimelineTab({ events }: { events: TimelineEvent[] }) {
  const [filter, setFilter] = useState<TimelineSource | 'all'>('all');

  const filtered = events.filter(e => filter === 'all' || e.source === filter);
  const sorted = [...filtered].sort((a, b) => {
    const ta = new Date(`${a.date}T${a.time}:00`).getTime();
    const tb = new Date(`${b.date}T${b.time}:00`).getTime();
    return ta - tb;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold text-white">Investigation Timeline</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'family', 'cctv', 'witness', 'investigator', 'ai'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all capitalize
                ${filter === s ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'border-slate-700 text-slate-400 hover:text-white'}`}>
              {s === 'all' ? 'All Sources' : SOURCE_LABELS[s as TimelineSource]}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">No timeline events for this filter.</div>
      )}

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-24 top-0 bottom-0 w-px bg-slate-700/50" />

        <div className="space-y-4">
          {sorted.map((event, i) => (
            <div key={event.id || i} className="flex items-start gap-4">
              {/* Time */}
              <div className="w-20 text-right flex-shrink-0 pt-1">
                <p className="text-xs font-mono text-slate-300 font-semibold">{event.time}</p>
                <p className="text-xs text-slate-600">{event.date?.slice(5)}</p>
              </div>

              {/* Dot */}
              <div className="flex flex-col items-center flex-shrink-0" style={{ marginTop: '4px' }}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 relative ${SOURCE_COLORS[event.source as TimelineSource] || 'bg-slate-600'}`}>
                  {SOURCE_ICONS[event.source as TimelineSource]}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white">{event.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${SOURCE_COLORS[event.source as TimelineSource]}`}>
                      {SOURCE_LABELS[event.source as TimelineSource] || event.source}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-1">{event.description}</p>
                  {event.location && (
                    <p className="text-xs text-blue-400 flex items-center gap-1">
                      📍 {event.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Current marker */}
          <div className="flex items-start gap-4">
            <div className="w-20 text-right flex-shrink-0">
              <p className="text-xs text-blue-400 font-semibold">NOW</p>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 bg-blue-500/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 mt-2">Investigation in progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
