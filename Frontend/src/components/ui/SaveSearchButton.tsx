'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api-result';
import { useCreateSavedSearch } from '@/hooks/queries';

export function SaveSearchButton({ filters, className = '' }: { filters: Record<string, string>; className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const create = useCreateSavedSearch();

  if (create.isSuccess) {
    return <span className={`text-xs font-medium text-ink ${className}`}>Saved ✓</span>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`text-xs font-medium text-sub underline-offset-4 hover:text-ink hover:underline ${className}`}
      >
        Save this search
      </button>
    );
  }

  return (
    <form
      className={`flex items-center gap-2 ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        create.mutate(
          { name: name.trim() || null, filters },
          { onError: (error) => { if (error instanceof ApiError && error.status === 401) router.push('/login'); } },
        );
      }}
    >
      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name this search (optional)"
        maxLength={120}
        className="rounded-sm border border-line bg-surface px-2 py-1 text-xs text-ink placeholder:text-sub focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      />
      <button type="submit" disabled={create.isPending} className="text-xs font-semibold text-ink disabled:opacity-50">
        {create.isPending ? 'Saving…' : 'Save'}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-sub hover:text-ink">
        Cancel
      </button>
      {create.isError && <span className="text-xs text-red-600">Couldn&apos;t save — try again.</span>}
    </form>
  );
}
