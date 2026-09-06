import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed, IBM_Plex_Mono } from 'next/font/google';
import { cacheLife, cacheTag } from 'next/cache';
import { QueryProvider } from '@/providers/QueryProvider';
import { UtilityBar } from '@/components/layout/UtilityBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFab } from '@/components/layout/WhatsAppFab';
import { listDestinationsServer } from '@/services/destinations';
import '../globals.css';

// One family, three widths: Sans for reading, Condensed for headlines, Mono for the
// manifest voice — eyebrows, labels and every number on the page.
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-sans',
  display: 'swap',
});
const ibmPlexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-plex-condensed',
  display: 'swap',
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'M.A.S & SONS — Used Vehicles & Heavy Equipment from Japan',
  description: 'FOB/C&F/CIF quotes on Japan-sourced used cars and heavy machinery, shipped worldwide.',
};

// Destinations feed the utility bar's port picker and the footer on every storefront
// page. Reference data that changes rarely — cached for days, invalidated by tag.
async function getDestinations() {
  'use cache';
  cacheLife('days');
  cacheTag('destinations');
  try {
    return await listDestinationsServer();
  } catch {
    // The chrome must never take the page down with it; sections that need
    // destinations simply hide when the list is empty.
    return [];
  }
}

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const destinations = await getDestinations();
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${ibmPlexCondensed.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sans">
        <QueryProvider>
          <UtilityBar destinations={destinations} />
          <Header />
          {children}
          <Footer destinations={destinations} />
          <WhatsAppFab />
        </QueryProvider>
      </body>
    </html>
  );
}
