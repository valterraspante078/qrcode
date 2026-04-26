import { createClient } from "@/lib/supabase/server";
import { Zap, Calendar, User, ArrowLeft, ChevronRight, Share2, Clock } from "lucide-react";
import Link from "next/link";
import BlogImage from "@/components/blog/BlogImage";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.geradordeqrcode.com.br";

  const { data: post } = await supabase
    .from("posts")
    .select("title, description, image_url, created_at, updated_at")
    .eq("slug", slug)
    .single();

  if (!post) return {};

  const publishedTime = new Date(post.created_at).toISOString();
  const modifiedTime = post.updated_at ? new Date(post.updated_at).toISOString() : publishedTime;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `${siteUrl}/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${siteUrl}/blog/${slug}`,
      type: "article",
      publishedTime,
      modifiedTime,
      images: [
        {
          url: post.image_url || "/blog-og-default.png",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.image_url || "/blog-og-default.png"],
    },
  };
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.geradordeqrcode.com.br";
  const supabase = await createClient();
  
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !post) {
    notFound();
  }

  const sanitizedContent = post.content || "";

  // Schema.org JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "image": post.image_url,
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "author": {
      "@type": "Organization",
      "name": "Gerador de Qr Code",
      "url": siteUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "Gerador de Qr Code",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${slug}`
    }
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${siteUrl}/blog`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `${siteUrl}/blog/${slug}`
      }
    ]
  };

  return (
    <article className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-white/5" aria-label="Navegação superior">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao Blog
          </Link>
          <Link href="/" className="flex items-center gap-2" aria-label="Ir para página inicial">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="text-white w-5 h-5 fill-white" />
            </div>
            <span className="font-bold tracking-tight hidden sm:inline-block">Gerador de Qr Code</span>
          </Link>
          <div className="hidden sm:block">
            <Link href="/" className="px-5 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors shadow-xl">
              Começar Grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Article Header */}
      <header className="pt-40 pb-20 px-6 max-w-4xl mx-auto text-center space-y-8">
        <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-bold uppercase tracking-widest text-blue-400">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">Artigo Premium</span>
          <span className="flex items-center gap-2 opacity-60">
            <Clock className="w-3 h-3" />
            5 min de leitura
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-balance">
          {post.title}
        </h1>
        
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/10">
              G
            </div>
            <span>Equipe Gerador</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <time dateTime={post.created_at} className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {format(new Date(post.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </time>
        </div>
      </header>

      {/* Featured Image */}
      {post.image_url && (
        <section className="max-w-6xl mx-auto px-6 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="aspect-[21/9] rounded-[40px] overflow-hidden border border-white/5 relative shadow-2xl shadow-blue-500/5">
            <BlogImage 
              src={post.image_url} 
              alt={`Imagem de destaque: ${post.title}`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </section>
      )}

      {/* Content */}
      <section className="max-w-3xl mx-auto px-6 pb-40">
        <div 
          className="blog-content" 
          dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
        />
        
        {/* Author Box / CTA */}
        <footer className="mt-20 p-10 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold">Gostou deste conteúdo?</h4>
            <button 
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors group"
              aria-label="Compartilhar este artigo"
            >
              <Share2 className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
            </button>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Nossa plataforma ajuda milhares de empresas a transformarem seus QR Codes em ferramentas de marketing poderosas. Crie seu primeiro código dinâmico hoje mesmo.
          </p>
          <div className="pt-4">
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all group shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40">
              Criar meu QR Code Grátis
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </footer>
      </section>
    </article>
  );
}

