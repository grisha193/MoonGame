import React from 'react';
import type { GameEvent } from '../../shared/game';

export function EventLog({ events }: { events: GameEvent[] }) {
  return (
    <div className="min-h-0 rounded-lg border border-white/80 bg-white p-4 shadow-panel">
      <h2 className="text-lg font-black">События базы</h2>
      <div className="mt-3 grid max-h-[320px] gap-2 overflow-auto pr-1 xl:max-h-none">
        {events.map((event) => (
          <div key={event.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs font-black uppercase ${event.type === 'danger' ? 'text-rose-700' : event.type === 'success' ? 'text-emerald-700' : 'text-cyan-700'}`}>
                {event.type === 'danger' ? 'Риск' : event.type === 'success' ? 'Успех' : 'Система'}
              </span>
              <span className="text-xs font-bold text-slate-500">день {event.day}</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-700">{event.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
