import React from 'react';

export function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-500">
      {icon}
      {text}
    </div>
  );
}
