
import CaseStudy from '../../components/CaseStudy';
import { useRouter } from 'next/router';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import SEO from '../../components/SEO';
import Head from 'next/head';
import { WP_SITE_URL } from '../../lib/config';

// Define the shape of a WordPress Post
interface WpPost {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  link: string;
  _embedded: any;
  acf: {
    external_link?: string;
    external_link_image?: string;
  };
}

interface RankMathHead {
  head: string;
}

export const getServerSideProps: GetServerSideProps<{ post: WpPost | null, seo: RankMathHead | null, relatedPosts: WpPost[] }> = async (context) => {
  const { slug } = context.params || {};

  if (!slug) {
    return { props: { post: null, seo: null, relatedPosts: [] } };
  }

  try {
    const postRes = await fetch(`${WP_SITE_URL}/wp-json/wp/v2/posts?slug=${slug}&_embed=true&acf_format=standard`);
    
    if (!postRes.ok) {
      throw new Error('Failed to fetch post');
    }
    
    const posts: WpPost[] = await postRes.json();
    const post = posts.length > 0 ? posts[0] : null;

    if (!post) {
      return { notFound: true };
    }

    const [relatedPostsRes, seoRes] = await Promise.all([
      fetch(`${WP_SITE_URL}/wp-json/wp/v2/posts?per_page=2&exclude=${post.id}&_embed=true&acf_format=standard`),
      fetch(`${WP_SITE_URL}/wp-json/rankmath/v1/getHead?url=${post.link}`)
    ]);

    const relatedPosts: WpPost[] = relatedPostsRes.ok ? await relatedPostsRes.json() : [];
    const seo: RankMathHead | null = seoRes.ok ? await seoRes.json() : null;

    return { 
      props: { post, seo, relatedPosts },
    };
  } catch (error) {
    console.error(error);
    return { props: { post: null, seo: null, relatedPosts: [] } };
  }
};

const ProjectPage = ({ post, seo, relatedPosts }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const extractSEOData = (head: string) => {
    const titleMatch = head.match(/<title>(.*?)<\/title>/);
    const descriptionMatch = head.match(/name="description" content="(.*?)"/);
    const ogTitleMatch = head.match(/property="og:title" content="(.*?)"/);
    const ogDescriptionMatch = head.match(/property="og:description" content="(.*?)"/);
    const ogImageMatch = head.match(/property="og:image" content="(.*?)"/);
    
    return {
      title: titleMatch ? titleMatch[1] : post?.title.rendered || '',
      description: descriptionMatch ? descriptionMatch[1] : post?.excerpt.rendered?.replace(/<[^>]*>/g, '') || '',
      ogTitle: ogTitleMatch ? ogTitleMatch[1] : post?.title.rendered || '',
      ogDescription: ogDescriptionMatch ? ogDescriptionMatch[1] : post?.excerpt.rendered?.replace(/<[^>]*>/g, '') || '',
      ogImage: ogImageMatch ? ogImageMatch[1] || '' : ''
    };
  };

  if (!post) {
    return <div>Post not found</div>;
  }

  const terms = post._embedded?.['wp:term'];
  const category = terms?.[0]?.[0]?.name;
  const client = terms?.[3]?.[0]?.name;
  const year = terms?.[2]?.[0]?.name;

  const seoData = seo ? extractSEOData(seo.head) : {
    title: post?.title.rendered || '',
    description: post?.excerpt.rendered?.replace(/<[^>]*>/g, '') || '',
    ogTitle: post?.title.rendered || '',
    ogDescription: post?.excerpt.rendered?.replace(/<[^>]*>/g, '') || '',
    ogImage: ''
  };

  return (
    <>
      <SEO
        title={seoData.title}
        description={seoData.description}
        canonicalUrl={`https://zhirnov.studio/projects/${post.slug}`}
        ogType="article"
        ogImage={seoData.ogImage}
      />
      <CaseStudy 
        onBack={() => router.push('/')} 
        title={post.title.rendered}
        content={post.content.rendered}
        excerpt={post.excerpt.rendered}
        category={category}
        client={client}
        year={year}
        relatedPosts={relatedPosts}
      />
    </>
  );
};

export default ProjectPage;
