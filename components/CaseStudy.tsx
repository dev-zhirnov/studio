
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

interface WpPost {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  _embedded: any;
  acf: {
    external_link?: string;
    external_link_image?: string;
  };
}

interface CaseStudyProps {
  onBack: () => void;
  title?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  client?: string;
  year?: string;
  relatedPosts: WpPost[];
}

const RelatedCaseCard: React.FC<{ post: WpPost; onClick: (slug: string) => void }> = ({ post, onClick }) => {
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
  const image = featuredMedia?.source_url;
  const color = '#e5e7eb'; // Default color

  const hasExternalLink = post.acf && post.acf.external_link;

  const CardContent = () => (
    <>
      <div
        className="relative w-full aspect-[591/332] rounded-[32px] overflow-hidden"
        style={{ backgroundColor: color }}
      >
        {image && (
          <img
            src={image}
            alt={post.title.rendered}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        {hasExternalLink && post.acf.external_link_image && (
          <div className="absolute bottom-5 right-5 w-12 h-12 md:w-16 md:h-16 bg-[#111111] rounded-2xl md:rounded-[1.25rem] flex items-center justify-center text-white shadow-xl z-10">
            <img src={post.acf.external_link_image} alt="" className="w-6 h-6 md:w-8 md:h-8" />
          </div>
        )}
      </div>
      <div className="mt-4 text-neutral-800 text-lg md:text-2xl font-normal leading-tight tracking-tight group-hover:text-[#168D65] transition-colors line-clamp-2"
        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
      />
    </>
  );

  if (hasExternalLink) {
    return (
      <a href={post.acf.external_link} target="_blank" rel="noopener noreferrer" className="flex flex-col w-full text-left group">
        <CardContent />
      </a>
    );
  }

  return (
    <div className="flex flex-col w-full cursor-pointer group" onClick={() => onClick(post.slug)}>
      <CardContent />
    </div>
  );
};

const CaseStudy: React.FC<CaseStudyProps> = ({ onBack, title, content, excerpt, category, client, year, relatedPosts }) => {
  const router = useRouter();
  // Ensure we start at the top when this component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [title]); // Re-scroll when title changes, indicating a new case study

  const handleRelatedClick = (slug: string) => {
    router.push(`/projects/${slug}`);
  };

  return (
    <article className="max-w-[1920px] mx-auto px-6 md:px-10 pb-24 md:pb-40 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-[1200px] mx-auto">
        {/* Header Section */}
        <header className="mb-12 md:mb-24">
          <h1 className="text-4xl md:text-7xl font-medium tracking-tight text-[#333333] leading-[1.1] mb-8 md:mb-12"
            dangerouslySetInnerHTML={{ __html: title || 'Редизайн корпоративного сайта Flomni' }}
          />
          {excerpt && (
            <div 
              className="text-xl md:text-2xl text-[#1D2023] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: excerpt }} 
            />
          )}
        </header>

        {/* Project Meta Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-20 pb-12 md:pb-24 border-b border-zinc-300">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-400">Область</span>
            <span className="text-2xl text-[#1D2023] font-medium">{category || 'UI/UX Design'}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-400">Клиент</span>
            <span className="text-2xl text-[#1D2023] font-medium">{client || 'Flomni'}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-400">Год</span>
            <span className="text-2xl text-[#1D2023] font-medium">{year || '2023'}</span>
          </div>
        </div>
        
        {/* Content Body */}
        <div className="space-y-16 md:space-y-32 pt-12 md:pt-24">

          {content && (
            <div className="prose prose-lg prose-zinc max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
          )}

          {/* Related Projects Section */}
          <section className="pt-24 md:pt-40 border-t border-zinc-300">
            <div className="flex items-center justify-between mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-medium text-[#333333] tracking-tight">Другие кейсы</h2>
              <button
                onClick={onBack}
                className="hidden md:flex items-center gap-2 text-[#168D65] font-medium hover:gap-4 transition-all"
              >
                Все кейсы
                <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none">
                  <path d="M1 8H15M15 8L8 1M15 8L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {relatedPosts.map((post) => (
                <RelatedCaseCard
                  key={post.id}
                  post={post}
                  onClick={handleRelatedClick}
                />
              ))}
            </div>
            <div className="mt-12 md:hidden">
              <button
                onClick={onBack}
                className="w-full bg-zinc-100 py-5 rounded-2xl text-[#1D2023] font-bold text-center active:scale-95 transition-all"
              >
                Смотреть все кейсы
              </button>
            </div>
          </section>

        </div>
      </div>
    </article>
  );
};

export default CaseStudy;
