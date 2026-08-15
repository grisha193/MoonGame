import React from 'react';

export function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/75 bg-white/80 px-3 py-2 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-xl font-black">{value}</div>
    </div>
  );
}
