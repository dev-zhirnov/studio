
import CaseStudy from '../components/CaseStudy';
import { useRouter } from 'next/router';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { WP_SITE_URL } from '../lib/config';

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
  const { id } = context.query;

  if (!id) {
    return { props: { post: null, seo: null, relatedPosts: [] } };
  }

  try {
    const [postRes, relatedPostsRes] = await Promise.all([
      fetch(`${WP_SITE_URL}/wp-json/wp/v2/posts/${id}?_embed=true&acf_format=standard`),
      fetch(`${WP_SITE_URL}/wp-json/wp/v2/posts?per_page=2&exclude=${id}&_embed=true&acf_format=standard`)
    ]);

    if (!postRes.ok) {
      throw new Error('Failed to fetch post');
    }
    const post: WpPost = await postRes.json();
    const relatedPosts: WpPost[] = relatedPostsRes.ok ? await relatedPostsRes.json() : [];

    let seo = null;
    if (post) {
      const seoRes = await fetch(`${WP_SITE_URL}/wp-json/rankmath/v1/getHead?url=${post.link}`);
      if (seoRes.ok) {
        seo = await seoRes.json();
      }
    }

    return { 
      props: { post, seo, relatedPosts },
    };
  } catch (error) {
    console.error(error);
    return { props: { post: null, seo: null, relatedPosts: [] } };
  }
};

const CasePage = ({ post, seo, relatedPosts }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const getTitle = (head: string) => {
    const titleMatch = head.match(/<title>(.*?)<\/title>/);
    return titleMatch ? titleMatch[1] : '';
  };

  const getRestOfHead = (head: string) => {
    return head.replace(/<title>(.*?)<\/title>/, '');
  };

  if (!post) {
    return <div>Post not found</div>;
  }

  const terms = post._embedded?.['wp:term'];
  const category = terms?.[0]?.[0]?.name;
  const client = terms?.[3]?.[0]?.name;
  const year = terms?.[2]?.[0]?.name;

  return (
    <>
      <Head>
        <title>{seo ? getTitle(seo.head) : post.title.rendered}</title>
        {seo && <div dangerouslySetInnerHTML={{ __html: getRestOfHead(seo.head) }} />}
      </Head>
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

export default CasePage;
