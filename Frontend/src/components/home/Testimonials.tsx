export function Testimonials({ testimonials }: { testimonials: Array<{ quote: string; name: string; location: string }> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {testimonials.map((t) => (
        <figure key={t.quote} className="rounded-sm bg-surface p-6">
          <blockquote className="text-[15px] leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
          <figcaption className="mt-4 text-xs font-medium text-sub">{t.name} · {t.location}</figcaption>
        </figure>
      ))}
    </div>
  );
}
