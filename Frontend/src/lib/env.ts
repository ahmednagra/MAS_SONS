const required = (value: string | undefined, name: string) => {
  if (!value && process.env.NODE_ENV === 'production') throw new Error(`Missing env var: ${name}`);
  return value ?? '';
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  API_BASE_URL: required(process.env.API_BASE_URL, 'API_BASE_URL'),
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
};
