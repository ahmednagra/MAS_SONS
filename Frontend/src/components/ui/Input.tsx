import { ComponentProps } from 'react';

export function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={`rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-sub focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${className}`}
      {...props}
    />
  );
}
