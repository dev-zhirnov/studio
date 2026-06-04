
import React, { useState } from 'react';
import Link from 'next/link';

interface WpPost {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  _embedded: any;
  categories: number[];
  acf: {
    external_link?: string;
    external_link_image?: string;
    preview_square?: string;
    preview_rect?: string;
  };
}

interface WpCategory {
  id: number;
  name: string;
}

interface CasesProps {
  posts: WpPost[];
  categories: WpCategory[];
}

const CaseCard: React.FC<{ post: WpPost; wide?: boolean }> = ({ post, wide = false }) => {
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
  const fallback = featuredMedia?.source_url;
  // Квадратное превью — для квадратных слотов и мобильной версии,
  // прямоугольное — для широкой (первой) карточки на десктопе. Фоллбэк — featured.
  const squareImage = post.acf?.preview_square || fallback;
  const rectImage = post.acf?.preview_rect || fallback;
  const color = '#e5e7eb';

  const hasExternalLink = post.acf && post.acf.external_link;

  const CardContent = () => (
    <>
      <div
        className={`relative w-full rounded-[32px] overflow-hidden ${wide ? 'aspect-square md:aspect-[1214/680]' : 'aspect-square'}`}
        style={{ backgroundColor: color }}
      >
        {squareImage && (
          <picture>
            {wide && rectImage && <source media="(min-width: 768px)" srcSet={rectImage} />}
            <img
              src={squareImage}
              alt={post.title.rendered}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </picture>
        )}
        {hasExternalLink && post.acf.external_link_image && (
          <div className="absolute bottom-5 right-5 w-12 h-12 md:w-16 md:h-16 bg-[#111111] rounded-2xl md:rounded-[1.25rem] flex items-center justify-center text-white shadow-xl z-10">
            <img src={post.acf.external_link_image} alt="" className="w-6 h-6 md:w-8 md:h-8" />
          </div>
        )}
      </div>
      
      <div className={`self-stretch justify-center text-neutral-800 font-normal line-clamp-3 tracking-[-0.015em] group-hover:text-[#168D65] transition-colors ${wide ? 'mt-2 md:mt-6 text-lg md:text-[1.75rem] leading-6 md:leading-9' : 'mt-2 md:mt-4 text-lg md:text-2xl leading-6 md:leading-7'}`}
        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
      />
    </>
  );

  const rootClass = `flex flex-col w-full text-left group ${wide ? 'md:col-span-2' : ''}`;

  if (hasExternalLink) {
    return (
      <a href={post.acf.external_link} target="_blank" rel="noopener noreferrer" className={rootClass}>
        <CardContent />
      </a>
    );
  }

  return (
    <Link href={`/projects/${post.slug}`} prefetch className={rootClass}>
      <CardContent />
    </Link>
  );
};

const Cases: React.FC<CasesProps> = ({ posts, categories }) => {
  const [activeCategory, setActiveCategory] = useState<number>(0); // 0 for 'All cases'

  // Order categories: 'Брендинг' first, 'Сайты' second, others as is
  const orderedCategories = [...categories].sort((a, b) => {
    if (a.name === 'Брендинг') return -1;
    if (b.name === 'Брендинг') return 1;
    if (a.name === 'Сайты') return -1;
    if (b.name === 'Сайты') return 1;
    return 0;
  });

  const allCategories = [{ id: 0, name: 'Все кейсы' }, ...orderedCategories];

  const filteredCases = activeCategory === 0
    ? posts
    : posts.filter(p => p.categories.includes(activeCategory));

  return (
    <section id="cases" className="pb-14 md:pb-[100px] px-6 md:px-10 max-w-[1920px] mx-auto overflow-hidden">
      <div className="flex items-center gap-6 md:gap-10 mb-6 md:mb-10">
        <div className="h-[1px] bg-zinc-300 flex-1"></div>
        <h2 className="text-4xl md:text-6xl font-medium tracking-[-0.05em] text-[#333333]">Кейсы</h2>
        <div className="h-[1px] bg-zinc-300 flex-1"></div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center md:justify-center gap-2 mb-4 md:mb-[44px]">
        {allCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`max-[375px]:px-3 max-[375px]:pt-2.5 max-[375px]:pb-3 px-4 pt-3 pb-3.5 max-[375px]:rounded-[14px] rounded-2xl inline-flex justify-center items-center gap-2 overflow-hidden transition-all duration-300 ${
              activeCategory === cat.id
                ? 'bg-[#168D65]'
                : 'bg-zinc-100'
            }`}
          >
            <div className={`justify-center max-[375px]:text-base max-[375px]:leading-5 text-lg font-normal leading-6 ${
              activeCategory === cat.id ? 'text-white' : 'text-[#1D2023]'
            }`}
              dangerouslySetInnerHTML={{ __html: cat.name }}
            />
          </button>
        ))}
        <button className="px-4 pt-3 pb-3.5 bg-zinc-100 rounded-2xl inline-flex justify-center items-center gap-2 overflow-hidden transition-all hidden">
          <div className="justify-center text-[#1D2023] text-lg font-normal leading-6 flex items-center gap-2">
            Ещё
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-x-8 md:gap-y-8 max-w-[1214px] mx-auto">
        {filteredCases.map((post, index) => (
          // Широкий слот — только у первого поста И только если у него загружено
          // прямоугольное превью; иначе встаёт квадратом в общий ряд.
          <CaseCard key={post.id} post={post} wide={index === 0 && !!post.acf?.preview_rect} />
        ))}
      </div>
    </section>
  );
};

export default Cases;
