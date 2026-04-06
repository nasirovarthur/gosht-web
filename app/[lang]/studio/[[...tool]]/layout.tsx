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
  children: React.ReactNode
}) {
  return <div style={{ margin: 0, padding: 0 }}>{children}</div>
}
