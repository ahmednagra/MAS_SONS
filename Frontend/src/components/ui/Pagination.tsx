import Link from 'next/link';
import { ReactNode } from 'react';

export function Pagination({ page, totalPages, hrefForPage }: { page: number; totalPages: number; hrefForPage: (page: number) => string }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 text-sm">
      <PageLink page={page - 1} disabled={page <= 1} hrefForPage={hrefForPage}>Prev</PageLink>
      <span className="px-2 tabular-nums text-sub">{page} / {totalPages}</span>
      <PageLink page={page + 1} disabled={page >= totalPages} hrefForPage={hrefForPage}>Next</PageLink>
    </nav>
  );
}

function PageLink({ page, disabled, hrefForPage, children }: { page: number; disabled: boolean; hrefForPage: (page: number) => string; children: ReactNode }) {
  if (disabled) return <span className="rounded-sm border border-line px-3 py-1.5 font-medium text-sub opacity-50">{children}</span>;
  return (
    <Link href={hrefForPage(page)} className="rounded-sm border border-line px-3 py-1.5 font-medium text-ink hover:bg-paper">
      {children}
    </Link>
  );
}
