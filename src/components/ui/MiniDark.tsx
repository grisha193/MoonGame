import React from 'react';

export function MiniDark({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-md bg-white/8 px-2 py-2">
      <div className="text-[11px] font-bold uppercase text-white/50">{label}</div>
      <div className={`mt-1 text-lg font-black ${warn ? 'text-amber-300' : 'text-white'}`}>{value}</div>
    </div>
  );
}
