import type { Feature, FeatureCategory } from '@/types/stock';

const CATEGORY_LABEL: Record<FeatureCategory, string> = {
  safety: 'Safety & driver assistance',
  comfort: 'Comfort & convenience',
  exterior: 'Exterior',
  mechanical: 'Mechanical',
  equipment_attachment: 'Attachments',
};
const ORDER: FeatureCategory[] = ['safety', 'comfort', 'exterior', 'mechanical', 'equipment_attachment'];

/** Full controlled vocabulary with the unit's confirmed items ticked — a buyer sees
 *  what is *not* fitted as clearly as what is, which competitor listings hide. */
export function EquipmentMatrix({ confirmed, catalog }: { confirmed: Feature[]; catalog: Feature[] }) {
  const confirmedIds = new Set(confirmed.map((f) => f.id));
  const all = catalog.length ? catalog : confirmed;
  const groups = ORDER.map((c) => ({ c, items: all.filter((f) => f.category === c) })).filter((g) => g.items.length);
  if (!groups.length) return null;

  return (
    <section aria-labelledby="equipment-heading" data-reveal>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="equipment-heading" className="text-2xl font-semibold tracking-tight text-ink">Equipment</h2>
        <p className="text-sm text-sub"><span className="font-semibold text-ink">{confirmedIds.size}</span> of {all.length} confirmed by inspection</p>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {groups.map((g) => (
          <div key={g.c} className="rounded-sm border border-line bg-surface p-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-sub">{CATEGORY_LABEL[g.c]}</h3>
            <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {g.items.map((f) => {
                const on = confirmedIds.has(f.id);
                return (
                  <li key={f.id} className={`flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${on ? 'bg-accent/10 font-medium text-ink' : 'text-sub'}`}>
                    {on ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3" aria-hidden><path d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <span className="inline-block h-[14px] w-[14px] rounded-sm border border-line" aria-hidden />
                    )}
                    <span>{f.name}</span>
                    <span className="sr-only">{on ? ' — confirmed' : ' — not confirmed'}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-sub">Ticked items are confirmed on the auction inspection sheet or by our yard staff. Unticked items are not fitted or not yet verified — ask and we will check before you commit.</p>
    </section>
  );
}
