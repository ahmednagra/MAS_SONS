import { ComponentProps } from 'react';

export function Card({ className = '', ...props }: ComponentProps<'div'>) {
  return <div className={`rounded-sm border border-line bg-surface p-4 ${className}`} {...props} />;
}
