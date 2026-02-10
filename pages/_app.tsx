
import type { AppProps, AppContext } from 'next/app';
import Script from 'next/script';
import { useState, useEffect } from 'react';
import { LanguageProvider } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CookieModal from '../components/CookieModal';
import { useRouter } from 'next/router';
import App from 'next/app';
import { WP_SITE_URL } from '../lib/config';

interface FrontPageAcf {
  email?: string;
  tg_link?: string;
  vc_link?: string;
  brief_link?: string;
}

interface MyAppProps extends AppProps {
  frontPageAcf: FrontPageAcf | null;
}

function MyApp({ Component, pageProps, frontPageAcf }: MyAppProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMounting, setIsMounting] = useState(true);

  useEffect(() => {
    setIsMounting(false);
  }, []);

  useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    const handleComplete = () => setIsNavigating(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
    };
  }, [router]);

  const tgLink = frontPageAcf?.tg_link ?? 'https://t.me/+PjQKxxBXtlwxMDc6';
  const briefLink = frontPageAcf?.brief_link ?? 'https://t.me/vglushkovva';
  const vcLink = frontPageAcf?.vc_link ?? 'https://vc.ru/id5258920';
  const email = frontPageAcf?.email ?? 'hello@zhirnov.studio';

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-white">
        <CookieModal />
        <div className="relative">
          <Navbar 
            onLogoClick={() => router.push('/')} 
            onContactClick={() => {
              router.push('/#contacts');
            }}
            tg_link={tgLink}
          />
          {isNavigating && (
            <div className="fixed inset-x-0 bottom-0 bg-white/95 z-[90] animate-fade-in" style={{ top: '76px' }}>
              <div className="h-[calc(100vh-76px)] flex items-center justify-center">
                <svg className="w-16 h-16 animate-spin-slow" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.0578 8.01439L21.0879 3.98258L23.4307 8.01364L16.3999 12.0447L23.43 16.0765L21.0871 20.1076L14.0578 16.0758V24H9.37214V16.0765L2.34284 20.1083L0 16.0773L7.0293 12.0447L0.000762645 8.01439L2.34361 3.98333L9.37214 8.01364V0H14.0578V8.01439Z" fill="#333333"/>
                </svg>
              </div>
            </div>
          )}
          <main className={`pt-24 transition-opacity duration-1000 ${isNavigating ? 'opacity-0' : isMounting ? 'opacity-0' : 'opacity-100'}`}>
            <Component {...pageProps} brief_link={briefLink} />
          </main>
        </div>
        <Footer 
          onLogoClick={() => router.push('/')}
          email={email}
          tg_link={tgLink}
          vc_link={vcLink}
        />
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes spinSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
          .animate-spin-slow {
            animation: spinSlow 1.5s linear infinite;
          }
        `}</style>
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js', 'ym');

            ym(99522883, 'init', {webvisor:true, clickmap:true, accurateTrackBounce:true, trackLinks:true});
          `}
        </Script>
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/99522883" style={{ position: 'absolute', left: '-9999px' }} alt="" />
          </div>
        </noscript>
      </div>
    </LanguageProvider>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);
  
  try {
    const settingsRes = await fetch(`${WP_SITE_URL}/wp-json/wp/v2/settings`);
    
    if (!settingsRes.ok) {
      console.warn('Failed to fetch settings, using default values');
      return { ...appProps, frontPageAcf: null };
    }
    
    const settings = await settingsRes.json();

    let frontPageAcf: FrontPageAcf | null = null;
    if (settings && settings.page_on_front) {
      try {
        const frontPageRes = await fetch(`${WP_SITE_URL}/wp-json/wp/v2/pages/${settings.page_on_front}?acf_format=standard`);
        if (frontPageRes.ok) {
          const frontPageData = await frontPageRes.json();
          frontPageAcf = frontPageData.acf || null;
        }
      } catch (frontPageError) {
        console.warn('Failed to fetch front page ACF:', frontPageError);
      }
    }
    
    return { ...appProps, frontPageAcf };
  } catch (error) {
    console.error('Error fetching front page ACF:', error);
    return { ...appProps, frontPageAcf: null };
  }
};

export default MyApp;
