'use client';
import { useEffect, useRef, useState } from 'react';

export function StatsBand({ stats }: { stats: Array<{ target: number; suffix?: string; label: string }> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProgress(1);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        const start = Date.now();
        const duration = 1100;
        const tick = () => {
          const p = Math.min((Date.now() - start) / duration, 1);
          setProgress(1 - (1 - p) ** 3);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 border-y border-line sm:grid-cols-4">
      {stats.map((stat, i) => (
        <div key={stat.label} className={`px-4 py-6 text-center ${i > 0 ? 'border-l border-line' : ''}`}>
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-ink">
            {Math.round(progress * stat.target).toLocaleString('en-US')}
            {stat.suffix}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-sub">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
