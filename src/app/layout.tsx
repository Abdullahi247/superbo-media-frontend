import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth';
import { AmbientBg } from '../components/AmbientBg';
import { Nav } from '../components/Nav';

export const metadata: Metadata = {
  title: 'Superbo Media — Community Event Platform',
  // title: 'Superbo — Community Event Platform',
  description:
    'Suggest events, upvote what the room wants, and let venue managers approve the queue.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <AmbientBg />
          <Nav />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
