import { MetadataRoute } from 'next'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.geradordeqrcode.com.br'
  
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch all posts from Supabase
  const { data: posts } = await supabaseAdmin
    .from('posts')
    .select('slug, updated_at, created_at')

  const postEntries: MetadataRoute.Sitemap = (posts || []).map((post: { slug: string; updated_at?: string; created_at: string }) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updated_at || post.created_at,
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
