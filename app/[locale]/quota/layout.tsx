import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quota',
  robots: {
    index: false,
    follow: false,
  },
};

export default function QuotaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
