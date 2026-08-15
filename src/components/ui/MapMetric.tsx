import React from 'react';

export function MapMetric({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase text-white/55">{label}</div>
      <div className={`text-lg font-black ${warn ? 'text-amber-300' : ''}`}>{value}</div>
    </div>
  );
}
