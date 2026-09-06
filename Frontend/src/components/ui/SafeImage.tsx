'use client';
import { useState, type ReactNode } from 'react';
import Image, { type ImageProps } from 'next/image';

/**
 * next/image that falls back to `fallback` when the source fails to load, so a dead
 * upstream photo never leaves a blank tile. Server components pass the fallback as a
 * node; the swap itself needs client state, hence this wrapper.
 */
export function SafeImage({ fallback, alt, ...props }: ImageProps & { fallback: ReactNode }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return <Image {...props} alt={alt} onError={() => setFailed(true)} />;
}
