import { ComponentProps, ReactNode } from 'react';

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-sm border border-line">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-paper text-left text-xs font-semibold uppercase tracking-wider text-sub">
      <tr>{children}</tr>
    </thead>
  );
}

export function TableHeaderCell({ className = '', ...props }: ComponentProps<'th'>) {
  return <th className={`border-b border-line px-4 py-3 ${className}`} {...props} />;
}

export function TableRow({ className = '', ...props }: ComponentProps<'tr'>) {
  return <tr className={`border-b border-line last:border-0 hover:bg-paper ${className}`} {...props} />;
}

export function TableCell({ className = '', ...props }: ComponentProps<'td'>) {
  return <td className={`px-4 py-3 ${className}`} {...props} />;
}
