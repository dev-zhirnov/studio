import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import Services from '../components/Services';
import Cases from '../components/Cases';
import ContactForm from '../components/ContactForm';
import SEO from '../components/SEO';
import { useRouter } from 'next/router';
import type { GetStaticProps, InferGetStaticPropsType } from 'next';
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
  link: string;
  _embedded: any;
  categories: number[];
  acf: {
    external_link?: string;
    external_link_image?: string;
  };
}

// Define the shape of a WordPress Category
interface WpCategory {
  id: number;
  name: string;
  count: number;
  slug: string;
}

export const getStaticProps: GetStaticProps<{ 
  posts: WpPost[], 
  categories: WpCategory[]
}> = async () => {
  try {
    // 1. Добавляем AbortController, чтобы запрос не висел вечно
    // Если WP не ответит за 8 секунд, мы его прервем
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); 

    const [postsRes, categoriesRes] = await Promise.all([
      fetch(`${WP_SITE_URL}/wp-json/wp/v2/posts?per_page=100&_embed=true&acf_format=standard`, { 
        signal: controller.signal 
      }),
      fetch(`${WP_SITE_URL}/wp-json/wp/v2/categories?hide_empty=true&per_page=100`, {
        signal: controller.signal 
      })
    ]);

    clearTimeout(timeoutId);

    // 2. Проверка ответов
    if (!postsRes.ok || !categoriesRes.ok) {
      // ВАЖНО: Если что-то не так, выбрасываем ошибку дальше.
      // При regeneration (в фоне) Next.js поймет ошибку и ОСТАВИТ старую страницу.
      // При билде упадет с ошибкой (что тоже хорошо, чтобы знать о проблеме).
      throw new Error('Failed to fetch data from WP');
    }

    const posts: WpPost[] = await postsRes.json();
    const categories: WpCategory[] = await categoriesRes.json();
    
    // Если categories вернулся null (иногда бывает при 500 ошибках WP, но статус 200), защищаемся
    if (!categories || !posts) {
       throw new Error('Empty data received');
    }

    const filteredCategories = categories.filter(cat => cat.slug !== 'empty');

    return { 
      props: { 
        posts, 
        categories: filteredCategories,
      },
      revalidate: 60, 
    };
  } catch (error) {
    console.error("getStaticProps Error:", error);
    
    // 3. ВАЖНЕЙШАЯ ЧАСТЬ
    // Мы НЕ возвращаем { props: { posts: [], categories: [] } }
    // Вместо этого мы пробрасываем ошибку.
    
    // Если это ошибка билда - Next.js сообщит об ошибке.
    // Если это ошибка при фоновом обновлении (ISR) - Next.js 
    // сохранит ПОСЛЕДНЮЮ УСПЕШНУЮ версию страницы и попробует позже.
    
    throw error; 
    
    // Альтернатива (если нужно, чтобы сайт вообще не падал, а показывал заглушку):
    // return { 
    //    props: { posts: [], categories: [] }, 
    //    notFound: false // Можно использовать notFound: true, чтобы показать 404 страницу
    // }; 
    // Но лучше throw error, чтобы сохранить старый контент.
  }
};

const HomePage = ({ posts, categories, brief_link }: InferGetStaticPropsType<typeof getStaticProps> & { brief_link?: string }) => {
  const router = useRouter();

  return (
    <>
      <SEO
        title="Zhirnov Studio - Creative Digital Agency"
        description="We create innovative digital experiences and branding solutions for modern businesses"
        canonicalUrl="https://zhirnov.studio"
        ogType="website"
        ogImage="https://zhirnov.studio/og-image.jpg"
      />
      <Hero />
      <Marquee />
      <Services />
      <Cases 
        posts={posts}
        categories={categories}
      />
      <ContactForm brief_link={brief_link} />
    </>
  );
};

export default HomePage;