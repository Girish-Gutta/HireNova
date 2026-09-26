import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HireNova — Autonomous AI Interview Platform',
  description: 'AI-run interview platform that replaces human HR/interviewer for multi-phase interviews.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0B0F19] text-[#F9FAFB] antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
