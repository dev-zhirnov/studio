
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ru" className="scroll-smooth">
      <Head>
        <meta charSet="UTF-8" />
        <title>Zhirnov | IT Products</title>
        <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <style>{`
        :root {
            scroll-padding-top: 100px;
        }

        body { 
            font-family: 'Golos Text', sans-serif; 
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        
        .animate-marquee {
            display: flex;
            width: max-content;
            animation: marquee 40s linear infinite;
        }

        .animate-marquee:hover {
            animation-play-state: paused;
        }

        /* 
           Simple, slow hover lift for service icons.
        */
        .service-lift-wrapper {
            transition: transform 0.6s ease-in-out;
            will-change: transform;
            transform: translateY(0);
        }

        .group:hover .service-lift-wrapper {
            transform: translateY(-10px);
        }

        ::selection {
            background-color: #168D65;
            color: white;
        }

        /* Custom scrollbar hiding for textarea */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        /* Custom Prose Styles */
        .prose {
            --tw-prose-body: #1D2023;
            --tw-prose-headings: #333333;
            --tw-prose-lead: #52525b;
            --tw-prose-links: #168D65;
            --tw-prose-bold: #18181b;
            --tw-prose-counters: #71717a;
            --tw-prose-bullets: #d4d4d8;
            --tw-prose-hr: #e4e4e7;
            --tw-prose-quotes: #18181b;
            --tw-prose-quote-borders: #e4e4e7;
            --tw-prose-captions: #71717a;
            --tw-prose-code: #18181b;
            --tw-prose-pre-code: #e4e4e7;
            --tw-prose-pre-bg: #18181b;
            --tw-prose-th-borders: #d4d4d8;
            --tw-prose-td-borders: #e4e4e7;
        }

        .prose :where(img):not(:where([class~="not-prose"] *)) {
            border-radius: 40px;
        }

        .prose :where(pre):not(:where([class~="not-prose"] *)) {
            border-radius: 40px;
            padding: 2rem;
        }

        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
            font-weight: 500;
        }
        `}</style>
      </Head>
      <body className="bg-white text-[#1D2023] selection:bg-[#168D65]/20">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
