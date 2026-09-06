// Company contact and identity — the single source every header, footer, utility bar
// and floating contact button reads. Contact channels come from NEXT_PUBLIC_* env so a
// placeholder number can never ship: an unset channel is simply not rendered.
const fromEnv = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export const SITE = {
  name: 'M.A.S & SONS',
  /** Display wordmark used in the header, footer, and logo lockup. Legal and invoice name stays `legalName`. */
  brand: 'MAS',
  brandDescriptor: 'Vehicles & equipment · Japan',
  legalName: 'M.A.S & SONS 株式会社',
  tagline: 'Used vehicles & heavy equipment · exported from Japan',
  license: '古物商許可 第401210001551',
  address: 'Shimotsuma, Ibaraki, Japan',
  hours: 'Mon–Sat · 09:00–18:00 JST',
  originPorts: ['Yokohama', 'Nagoya'] as const,
  /** Display form, e.g. "+81 296 00 0000". */
  phone: fromEnv(process.env.NEXT_PUBLIC_CONTACT_PHONE),
  /** International digits only, no "+" or spaces, e.g. "81296000000". */
  whatsapp: fromEnv(process.env.NEXT_PUBLIC_CONTACT_WHATSAPP),
  email: fromEnv(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  /** Japanese-language site for domestic sellers — the `(jp)` route group. */
  jpSiteHref: '/sell',
};

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

export const whatsappHref = (number: string, text?: string) =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const hasAnyContact = Boolean(SITE.phone || SITE.whatsapp || SITE.email);
