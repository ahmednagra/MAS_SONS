const STEPS = [
  { n: '01', t: 'Browse or request sourcing', d: 'Pick a unit in stock, or tell us what you need at auction.' },
  { n: '02', t: 'Check the auction sheet', d: 'Real grade, condition notes and photos before you commit.' },
  { n: '03', t: 'Request a quote', d: 'FOB, C&F or CIF, priced to your destination port.' },
  { n: '04', t: 'Invoice & payment', d: 'Bank wire, confirmed before anything ships.' },
  { n: '05', t: 'Shipping arranged', d: 'RoRo or container booking from Yokohama or Nagoya.' },
  { n: '06', t: 'Customs & delivery', d: 'Export certificate, B/L and invoice sent to you.' },
];

export function HowItWorksSteps() {
  return (
    <ol className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
      {STEPS.map((step) => (
        <li key={step.n} className="border-t border-ink pt-4">
          <span className="block font-mono text-xs tabular-nums text-sub">{step.n}</span>
          <h3 className="mt-2 text-sm font-semibold text-ink">{step.t}</h3>
          <p className="mt-1.5 text-[13px] leading-snug text-sub">{step.d}</p>
        </li>
      ))}
    </ol>
  );
}
