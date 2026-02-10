
import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { WP_SITE_URL } from '../lib/config';

interface FooterProps {
  onLogoClick: () => void;
  email?: string;
  tg_link?: string;
  vc_link?: string;
}

const Footer: React.FC<FooterProps> = ({ onLogoClick, email, tg_link, vc_link }) => {
  const baseUrl = "/assets/img";
  const langContext = useContext(LanguageContext);

  if (!langContext) {
    throw new Error('LanguageContext not found');
  }
  const { translations } = langContext;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#333333] text-white overflow-hidden">
      <div className="max-w-[1920px] mx-auto">
        
        {/* Mobile Footer Version (visible below md) */}
        <div className="md:hidden flex flex-col pt-8 pb-10 px-6">
          {/* Mobile Top Row */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={onLogoClick}>
              <img src={`${baseUrl}/icons/zhirnov_logo_w.svg`} alt="ZHIRNOV" className="h-6" />
            </button>
            <div className="flex gap-4">
              <a href="/#services" className="text-white text-lg font-normal leading-6">{translations.services}</a>
              <a href="/#cases" className="text-white text-lg font-normal leading-6">{translations.cases}</a>
            </div>
          </div>

          <div className="h-[1px] bg-[#FFFFFF14] w-full mb-6 md:mb-8"></div>

          {/* Mobile Socials Block */}
          <div className="flex flex-col items-center gap-3 md:gap-6 mb-4 md:mb-8">
            <a href={tg_link} target="_blank" className="text-white text-lg font-normal leading-6">Телеграм</a>
            <a href={vc_link} target="_blank" className="text-white text-lg font-normal leading-6">VC</a>
            <a href={`mailto:${email}`} className="text-white text-lg font-normal leading-6">{email || 'hello@zhirnov.studio'}</a>
          </div>

          {/* Mobile Arrow Section with horizontal lines */}
          <div className="flex items-center gap-4 mb-4 md:mb-8">
            <div className="h-[1px] bg-[#FFFFFF14] flex-1"></div>
            <button 
              onClick={scrollToTop}
              className="w-14 h-14 rounded-2xl bg-[#FFFFFF14] flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
            <div className="h-[1px] bg-[#FFFFFF14] flex-1"></div>
          </div>

          {/* Mobile Bottom Links */}
          <div className="flex flex-col items-center gap-4">
            <a target="_blank" href={`${WP_SITE_URL}/privacy.pdf`} className="text-white text-lg font-normal underline leading-6">Политика обработки данных</a>
            <div className="text-white/40 text-lg font-normal leading-6">© 2026, ZHIRNOV STUDIO</div>
          </div>
        </div>

        {/* Desktop Footer Version (visible above md) */}
        <div className="hidden md:flex flex-col px-12 pt-6 pb-6">
          
          {/* Desktop Row 1: Logo, Nav, Socials. Fixed height: 52px. */}
          <div className="h-[52px] flex justify-between items-center mb-6">
            {/* Logo (Left) */}
            <div className="flex-1 flex justify-start">
              <button onClick={onLogoClick}>
                <img src={`${baseUrl}/icons/zhirnov_logo_w.svg`} alt="ZHIRNOV" className="h-6" />
              </button>
            </div>

            {/* Nav (Center) */}
            <div className="flex justify-center gap-6">
              <a href="/#services" className="text-white text-lg font-normal leading-6 hover:opacity-70 transition-opacity">{translations.services}</a>
              <a href="/#cases" className="text-white text-lg font-normal leading-6 hover:opacity-70 transition-opacity">{translations.cases}</a>
            </div>

            {/* Socials (Right) */}
            <div className="flex-1 flex justify-end gap-6">
              <a href={tg_link} target="_blank" className="text-white text-lg font-normal leading-6 hover:opacity-70 transition-opacity">Телеграм</a>
              <a href={vc_link} target="_blank" className="text-white text-lg font-normal leading-6 hover:opacity-70 transition-opacity">VC</a>
              <a href={`mailto:${email}`} className="text-white text-lg font-normal leading-6 hover:opacity-70 transition-opacity">{email || 'hello@zhirnov.studio'}</a>
            </div>
          </div>

          {/* Separator Line */}
          <div className="w-full h-px opacity-20 bg-zinc-300 mb-4" />

          {/* Desktop Row 2: Policy, Copyright, Arrow. Fixed height: 52px. */}
          <div className="h-[52px] flex justify-between items-center">
            {/* Policy (Left) */}
            <div className="flex-1 flex justify-start">
              <a href="/privacy.pdf" className="text-white text-lg font-normal underline leading-6 hover:opacity-70 transition-opacity">
                Политика обработки данных
              </a>
            </div>

            {/* Copyright (Center) */}
            <div className="flex justify-center">
              <div className="text-white/40 text-lg font-normal leading-6">
                © 2026, ZHIRNOV STUDIO
              </div>
            </div>

            {/* Scroll Top (Right) */}
            <div className="flex-1 flex justify-end">
              <button 
                onClick={scrollToTop}
                className="p-3 bg-[#FFFFFF14] rounded-2xl flex justify-center items-center overflow-hidden hover:bg-white/20 transition-all active:scale-95 group"
              >
                <div className="w-6 h-6 relative flex items-center justify-center">
                  <svg className="w-4 h-5 transform group-hover:-translate-y-1 transition-transform" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 1V15M6 1L1 6M6 1L11 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
