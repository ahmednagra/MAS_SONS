import type { MetadataRoute } from 'next';
import { getActiveStockCountServer, getStockSlugsPageServer } from '@/services/stock/stock.server';
import { env } from '@/lib/env';

export async function generateSitemaps() {
  const total = await getActiveStockCountServer();
  return Array.from({ length: Math.ceil(total / 50_000) }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const page = Number(await id);
  const units = await getStockSlugsPageServer({ offset: page * 50_000, limit: 50_000 });
  return units.map((u) => ({ url: `${env.NEXT_PUBLIC_SITE_URL}/stock/${u.slug}`, lastModified: u.updatedAt, changeFrequency: 'daily' }));
}
