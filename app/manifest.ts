import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
 
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  const isMac = userAgent.includes('Macintosh') || userAgent.includes('Mac OS')
  const suffix = isMac ? 'mac' : 'win'

  return {
    name: 'AniTime',
    short_name: 'AniTime',
    description: 'アニメ番組表',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: `/manifest-${suffix}-192x192.png`,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: `/manifest-${suffix}-512x512.png`,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}