'use client';
import { ComponentProps, useState } from 'react';

export function FileInput({ className = '', onChange, ...props }: ComponentProps<'input'>) {
  const [fileName, setFileName] = useState<string | null>(null);
  return (
    <div className={`rounded-sm border border-line bg-surface px-3 py-2 ${className}`}>
      <input
        type="file"
        onChange={(e) => {
          setFileName(e.target.files?.[0]?.name ?? null);
          onChange?.(e);
        }}
        className="block w-full text-sm text-ink file:mr-3 file:rounded-sm file:border file:border-line file:bg-paper file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink hover:file:bg-line"
        {...props}
      />
      {fileName && <p className="mt-1 truncate font-mono text-[11px] text-sub">Selected: {fileName}</p>}
    </div>
  );
}
