import { ComponentProps } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink hover:opacity-90',
  secondary: 'bg-transparent border border-ink text-ink hover:bg-surface',
  ghost: 'bg-transparent text-ink hover:bg-surface',
};

export function Button({ variant = 'primary', className = '', ...props }: ComponentProps<'button'> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    />
  );
}
