import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gōsht Group',
    short_name: 'Gōsht Group',
    description:
      'Restaurant holding in Tashkent with premium restaurants, fast-food projects, barbershop, catering, and branded hospitality concepts.',
    start_url: '/ru',
    display: 'standalone',
    background_color: '#0D0D0D',
    theme_color: '#0D0D0D',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
