import { createClient } from "@/lib/supabase/server";
import { Zap, ChevronRight, Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Metadata } from "next";
import BlogImage from "@/components/blog/BlogImage";
import Image from "next/image"; // Mantendo se necessário por outros motivos, mas usaremos BlogImage

export const metadata: Metadata = {
  title: "Blog de SEO, QR Codes e Estratégia Digital",
  description: "Dicas especializadas, tendências e guias completos sobre QR Codes, marketing digital e inteligência de negócios para impulsionar seu ranqueamento.",
  keywords: ["SEO", "QR Code", "Marketing Digital", "Estratégia Digital", "Tecnologia"],
  openGraph: {
    title: "Blog de SEO e Estratégia | Gerador de Qr Code",
    description: "Dicas e tendências sobre QR Codes e marketing digital.",
    images: ["/blog-og.png"],
  },
};

interface Post {
  id: string;
  title: string;
  description: string;
  slug: string;
  image_url: string | null;
  created_at: string;
}

export default async function BlogPage() {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.geradordeqrcode.com.br";
  
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  // JSON-LD for CollectionPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Blog de SEO e Estratégia | Gerador de Qr Code",
    "description": "Insights sobre tecnologia e marketing digital.",
    "url": `${siteUrl}/blog`,
  };

  return (
    <main className="min-h-screen bg-black text-white relative flex flex-col items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-blue-500/5 blur-[120px] rounded-full -z-10" />

      {/* Navigation */}
      <nav className="w-full max-w-7xl px-6 py-8 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="text-white w-6 h-6 fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Gerador de Qr Code</span>
        </Link>
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Home
        </Link>
      </nav>

      {/* Hero Header */}
      <header className="w-full max-w-4xl px-6 py-24 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
          Insights & Atualizações
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Blog de <span className="gradient-text">SEO e Tecnologia</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Explore as últimas tendências em QR Codes, design e estratégias digitais para impulsionar seu negócio.
        </p>
      </header>

      {/* Posts Grid */}
      <section className="w-full max-w-7xl px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {error || !posts || posts.length === 0 ? (
            <div className="col-span-full py-20 text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <p className="text-muted-foreground">Nenhum post encontrado no momento.</p>
              <p className="text-sm text-muted-foreground/50">Certifique-se de executar os scripts SQL no Supabase.</p>
            </div>
          ) : (
            (posts as Post[]).map((post) => (
              <Link 
                key={post.id} 
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-card border border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all hover:translate-y--1"
              >
                <article className="h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden bg-white/5">
                    <BlogImage 
                      src={post.image_url} 
                      alt={`Capa do artigo: ${post.title}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  
                  <div className="p-8 space-y-4 flex-grow flex flex-col">
                    <header className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(post.created_at), "dd MMM, yyyy", { locale: ptBR })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        Redação
                      </span>
                    </header>
                    
                    <h2 className="text-xl font-bold leading-tight group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h2>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {post.description}
                    </p>
                    
                    <footer className="pt-4 mt-auto flex items-center text-sm font-semibold text-blue-400 group-hover:gap-2 transition-all">
                      Ler artigo <ChevronRight className="w-4 h-4 ml-1" />
                    </footer>
                  </div>
                </article>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className="w-full border-t border-white/5 py-12 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-muted-foreground text-sm">© 2026 Gerador de Qr Code. Todos os direitos reservados.</p>
          <nav className="flex gap-8 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">Preços</Link>
            <Link href="/#faq" className="hover:text-white transition-colors">FAQ</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
