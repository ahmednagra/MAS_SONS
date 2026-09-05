import { env } from '@/lib/env';

export const API_CONFIG = {
  baseUrl: `${env.API_BASE_URL}/v0`,
  timeout: 30_000,
};
