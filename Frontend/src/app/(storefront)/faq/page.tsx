import { PageHeader } from '@/components/layout/PageHeader';
import { AccordionItem } from '@/components/ui';
import { FAQ_SECTIONS } from '@/content/faq';

export const metadata = {
  title: 'FAQ — M.A.S & SONS',
  description: 'Answers on buying, auction grades, payment, shipping and documents for used vehicles and heavy equipment exported from Japan.',
};

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-[800px] px-4 py-16">
      <PageHeader eyebrow="Support" title="Frequently asked questions" />
      <div className="flex flex-col gap-10">
        {FAQ_SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="mb-2 text-lg font-semibold text-ink">{section.title}</h2>
            <div>
              {section.items.map((item) => (
                <AccordionItem key={item.q} question={item.q}>{item.a}</AccordionItem>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
