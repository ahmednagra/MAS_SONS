'use client';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api-result';
import { useIsFavorited, useToggleFavorite } from '@/hooks/queries';

export function FavoriteButton({ unitId, className = '' }: { unitId: number; className?: string }) {
  const router = useRouter();
  const { data: isFavorited = false } = useIsFavorited(unitId);
  const toggle = useToggleFavorite();

  return (
    <button
      type="button"
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isFavorited}
      disabled={toggle.isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle.mutate(
          { unitId, isFavorited },
          { onError: (error) => { if (error instanceof ApiError && error.status === 401) router.push('/login'); } },
        );
      }}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#1b2027] shadow-sm transition hover:bg-white disabled:opacity-60 ${className}`}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20.5s-7.5-4.6-10-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 10 5.5c-2.5 4.4-10 9-10 9Z"
        />
      </svg>
    </button>
  );
}
