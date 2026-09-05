import { ReactNode } from 'react';

export function FormField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wider text-sub">{label}</span>
      {children}
      {error && <span role="alert" className="text-accent">{error}</span>}
    </label>
  );
}
