import React from 'react';

export function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase text-slate-500">{label}</div>
      <div className="text-lg font-black">{value}</div>
    </div>
  );
}
