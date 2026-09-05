'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Select } from '@/components/ui';

export function StockFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/stock?${next.toString()}`);
  };

  return (
    <form className="flex flex-wrap gap-2">
      <Input placeholder="Make" defaultValue={searchParams.get('make') ?? ''} onBlur={(e) => setParam('make', e.target.value)} />
      <Input placeholder="Model" defaultValue={searchParams.get('model') ?? ''} onBlur={(e) => setParam('model', e.target.value)} />
      <Select defaultValue={searchParams.get('steering_position') ?? ''} onChange={(e) => setParam('steering_position', e.target.value)}>
        <option value="">Any steering</option>
        <option value="LHD">Left-hand drive</option>
        <option value="RHD">Right-hand drive</option>
      </Select>
    </form>
  );
}
