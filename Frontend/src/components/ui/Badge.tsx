type Tone = 'ink' | 'line' | 'accent';

const TONE_CLASS: Record<Tone, string> = {
  ink: 'bg-ink text-paper',
  line: 'border border-line text-ink',
  accent: 'border border-accent/40 text-accent',
};

export function Badge({ children, tone = 'line' }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={`rounded-sm px-2 py-1 text-[11px] font-semibold uppercase tracking-wider ${TONE_CLASS[tone]}`}>
      {children}
    </span>
  );
}
