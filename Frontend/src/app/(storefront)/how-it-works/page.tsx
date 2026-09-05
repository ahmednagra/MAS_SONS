import { PageHeader } from '@/components/layout/PageHeader';
import { HowItWorksSteps } from '@/components/home/HowItWorksSteps';

export const metadata = {
  title: 'How Buying Works — M.A.S & SONS',
  description: 'The six-step process for buying a used vehicle or heavy equipment from Japan: sourcing, auction sheet, quote, payment, shipping and customs.',
};

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-16">
      <PageHeader
        eyebrow="Process"
        title="The same six steps, every time — no surprises mid-purchase."
        description="Whether you're buying a unit already in stock or asking us to source one at auction, every order follows this sequence from first contact to customs clearance."
      />
      <HowItWorksSteps />
    </main>
  );
}
