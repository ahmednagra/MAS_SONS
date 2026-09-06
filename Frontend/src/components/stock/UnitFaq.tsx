import { AccordionItem } from '@/components/ui';
import type { Unit } from '@/types/stock';

export function UnitFaq({ unit }: { unit: Unit }) {
  const title = `${unit.year} ${unit.make} ${unit.model}`;
  return (
    <section aria-labelledby="faq-heading" data-reveal>
      <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight text-ink">Buying this {unit.make}</h2>
      <div className="mt-2">
        <AccordionItem question={`Is the ${title} price negotiable?`}>
          The FOB price is fixed for the listing period. Freight is quoted at the current carrier rate for your port, and we pass through inspection and document fees at cost — you will see each line on the quotation.
        </AccordionItem>
        <AccordionItem question="Can I see the original auction sheet and more photos?">
          Yes. Request them through the quote form and we send the untranslated sheet, a translated summary, and a walk-around photo set. A live video inspection at the yard can be arranged for serious buyers.
        </AccordionItem>
        <AccordionItem question="How do I pay, and is my deposit protected?">
          Payment is by bank transfer to our Japanese corporate account after you receive a pro-forma invoice. We are a licensed Japanese used-goods dealer (古物商許可 第401210001551) and export under our own company name — no intermediaries.
        </AccordionItem>
        <AccordionItem question={`Does the ${unit.make} come with export documents?`}>
          Every unit ships with the export certificate (輸出抹消仮登録証明書), bill of lading, commercial invoice, and, where your country requires it, a pre-shipment inspection certificate.
        </AccordionItem>
        <AccordionItem question="Is the odometer reading verified?">
          Mileage is recorded by the auction inspector and cross-checked against the Japanese registration history. Any discrepancy is flagged on the sheet — we never list a unit with an unresolved mileage flag.
        </AccordionItem>
      </div>
    </section>
  );
}
