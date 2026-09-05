import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import { QueryProvider } from '@/providers/QueryProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import '../globals.css';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'M.A.S & SONS — Used Vehicles & Heavy Equipment from Japan',
  description: 'FOB/C&F/CIF quotes on Japan-sourced used cars and heavy machinery, shipped worldwide.',
};

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={ibmPlexSans.variable}>
      <body className="font-sans">
        <QueryProvider>
          <Header />
          {children}
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
