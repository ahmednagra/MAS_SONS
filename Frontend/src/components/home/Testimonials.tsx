export function Testimonials({ testimonials }: { testimonials: Array<{ quote: string; name: string; location: string }> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {testimonials.map((t) => (
        <figure key={t.name} className="border border-line bg-surface p-5">
          <blockquote className="text-sm leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
          <figcaption className="mt-3 text-xs font-medium text-sub">{t.name} — {t.location}</figcaption>
        </figure>
      ))}
    </div>
  );
}
