import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RAL → Netto | Simulatore trasparente',
  description: 'Stima il netto annuale e mensile a partire dalla RAL, con dettaglio trasparente di contributi, IRPEF e addizionali.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="antialiased">{children}</body>
    </html>
  );
}
