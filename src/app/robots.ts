import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/success/'],
    },
    sitemap: 'https://get-youtube-transcripts.io/sitemap.xml',
  }
}