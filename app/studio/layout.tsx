import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sanity Studio',
  description: 'Content management workspace for Gōsht Group.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100vh' }}>
      {children}
    </div>
  );
}
