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

  const postEntries: MetadataRoute.Sitemap = (posts || []).map((post: any) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updated_at || post.created_at,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

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
    ...postEntries,
  ]
}
