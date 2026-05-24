import { MetadataRoute } from 'next'
import { POSTS } from '@/lib/blog-data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.geradordeqrcode.com.br'
  
  const postEntries: MetadataRoute.Sitemap = POSTS.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.created_at,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const institutionalPages = [
    { path: '/termos-de-uso', priority: 0.4 },
    { path: '/privacidade', priority: 0.4 },
    { path: '/sobre-nos', priority: 0.5 },
    { path: '/contato', priority: 0.5 },
    { path: '/cookies', priority: 0.3 },
    { path: '/afiliados', priority: 0.6 },
  ]

  return [
    {
      url: siteUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 1.0,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    ...institutionalPages.map((page) => ({
      url: `${siteUrl}${page.path}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly' as const,
      priority: page.priority,
    })),
    ...postEntries,
  ]
}
