import type { DestinationInfo } from '@/types/destinations';

export function ShippingGuide({ info }: { info: DestinationInfo }) {
  return (
    <section>
      <h2>Shipping to {info.country}</h2>
      <p>Port: {info.port}</p>
      <p>Available terms: {info.incoterms.join(', ')}</p>
      <p>{info.dutyNotes}</p>
    </section>
  );
}
