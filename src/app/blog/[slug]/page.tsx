import { createClient } from "@/lib/supabase/server";
import { Zap, Calendar, User, ArrowLeft, ChevronRight, Share2, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title, description")
    .eq("slug", slug)
    .single();

  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* ProgressBar/Reading indicator could go here */}

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao Blog
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-white" />
            </div>
            <span className="font-bold tracking-tight hidden sm:inline-block">Gerador de Qr Code</span>
          </Link>
          <div className="hidden sm:block">
            <Link href="/" className="px-5 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors">
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
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
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
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {format(new Date(post.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.image_url && (
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <div className="aspect-[21/9] rounded-[40px] overflow-hidden border border-white/5 relative shadow-2xl shadow-blue-500/5">
            <img 
              src={post.image_url} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </section>
      )}

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 pb-40">
        <div 
          className="blog-content" 
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />
        
        {/* Author Box / CTA */}
        <div className="mt-20 p-10 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold">Gostou deste conteúdo?</h4>
            <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <Share2 className="w-5 h-5 text-blue-400" />
            </button>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Nossa plataforma ajuda milhares de empresas a transformarem seus QR Codes em ferramentas de marketing poderosas. Crie seu primeiro código dinâmico hoje mesmo.
          </p>
          <div className="pt-4">
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all group">
              Criar meu QR Code Grátis
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </article>

      {/* Global Style for content */}
      <style jsx global>{`
        .blog-content h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
          color: white;
        }
        .blog-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          color: #3b82f6;
        }
        .blog-content p {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #94a3b8;
          margin-bottom: 1.5rem;
        }
        .blog-content strong {
          color: white;
          font-weight: 600;
        }
        .blog-content ul {
          margin-bottom: 1.5rem;
          list-style-type: none;
        }
        .blog-content li {
          margin-bottom: 1rem;
          color: #94a3b8;
        }
      `}</style>
    </main>
  );
}
