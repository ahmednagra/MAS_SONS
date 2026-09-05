import { ReactNode } from 'react';

export function AccordionItem({ question, children }: { question: string; children: ReactNode }) {
  return (
    <details className="group border-b border-line py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink">
        {question}
        <span aria-hidden className="text-sub group-open:rotate-45">+</span>
      </summary>
      <div className="mt-3 text-sm leading-relaxed text-sub">{children}</div>
    </details>
  );
}
