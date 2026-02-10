import React, { useState, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

interface NavbarProps {
  onLogoClick: () => void;
  onContactClick: () => void;
  tg_link?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onLogoClick, onContactClick, tg_link }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const baseUrl = "/assets/img";

  const langContext = useContext(LanguageContext);

  if (!langContext) {
    throw new Error('LanguageContext not found');
  }

  const { locale, setLocale, translations } = langContext;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLanguageChange = () => {
    const newLocale = locale === 'ru' ? 'en' : 'ru';
    setLocale(newLocale);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-xl z-50 transition-all duration-300 border-b border-gray-100/30">
        <div className="max-w-[1920px] mx-auto px-6 md:px-10 h-24 flex items-center justify-between">
          {/* Logo */}
          <button onClick={onLogoClick} className="w-40 flex items-center cursor-pointer">
            <img src={`${baseUrl}/icons/zhirnov_logo_b.svg`} alt="ZHIRNOV" className="h-8" />
          </button>

          {/* Desktop Links */}
          <div className="hidden ml-auto mr-36 lg:flex items-center gap-8 text-[15px] font-bold">
            <a href="/#services" className="justify-center text-color-grey-10 text-lg font-normal leading-6">{translations.services}</a>
            <a href="/#cases" className="justify-center text-color-grey-10 text-lg font-normal leading-6">{translations.cases}</a>
            <button onClick={onContactClick} className="justify-center text-color-grey-10 text-lg font-normal leading-6">{translations.contacts}</button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* <button onClick={handleLanguageChange} className="h-11 px-3 py-3.5 bg-zinc-100 rounded-2xl inline-flex justify-center items-center gap-2 overflow-hidden">
                <img src={`${baseUrl}/icons/en.svg`} alt="Language" className="w-5 h-5" />
                <span className="justify-center text-[#1D2023] text-lg font-normal leading-6">{locale === 'ru' ? 'En' : 'Ru'}</span>
            </button> */}
            <button onClick={onContactClick} className="h-11 px-4 py-3.5 bg-[#168D65] rounded-2xl inline-flex justify-center items-center overflow-hidden">
              <div className="justify-center text-white text-lg font-normal leading-6">{translations.discussProject}</div>
            </button>
            
            {/* Telegram Button Update */}
            <a 
              href={tg_link} 
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex group transition-transform active:scale-95"
            >
              <div className="h-11 pl-3 pr-2.5 py-3.5 bg-zinc-800 rounded-2xl inline-flex justify-center items-center gap-2 overflow-hidden hover:bg-[#333333] transition-colors">
                  <div className="w-6 h-6 relative overflow-hidden flex items-center justify-center">
                      <img src={`${baseUrl}/icons/telegram.svg`} alt="" className="w-5 h-4" />
                  </div>
                  <span className="justify-center text-white text-lg font-normal leading-6">{translations.ourChannel}</span>
                    <div className="px-2 py-0.5 bg-white rounded-[10px] flex justify-center items-center gap-1">
                      <div className="justify-center text-[#1D2023] text-base font-normal leading-6">1.5к</div>
                  </div>
              </div>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden flex items-center justify-center bg-[#f5f5f5] w-14 h-14 rounded-2xl active:scale-90 transition-all"
          >
            <div className="flex flex-col gap-1.5 items-center">
              <span className="w-6 h-[2.5px] bg-[#333333]"></span>
              <span className="w-6 h-[2.5px] bg-[#333333]"></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-white z-[60] transition-transform duration-500 flex flex-col ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="flex items-center justify-between px-6 h-20">
          <button onClick={() => { toggleMenu(); onLogoClick(); }} className="flex items-center">
             <img src={`${baseUrl}/icons/zhirnov_logo_b.svg`} alt="ZHIRNOV" className="h-6" />
          </button>
          <button 
            onClick={toggleMenu}
            className="flex items-center justify-center bg-[#f5f5f5] w-14 h-14 rounded-2xl active:scale-90 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-[20px] text-[48px] font-[500] tracking-tight">
          <a href="/#services" onClick={toggleMenu} className="hover:text-gray-400 transition-colors leading-none">{translations.services}</a>
          <a href="/#cases" onClick={toggleMenu} className="hover:text-gray-400 transition-colors leading-none">{translations.cases}</a>
          <button onClick={() => { toggleMenu(); onContactClick(); }} className="hover:text-gray-400 transition-colors leading-none">{translations.contacts}</button>
        </div>

        <div className="px-6 pb-12 flex flex-col gap-4">
          <div className="flex gap-2">
            <button onClick={() => { toggleMenu(); onContactClick(); }} className="flex-[2.5] bg-[#168D65] text-white py-[14px] rounded-[20px] font-normal text-[18px] text-center">
              {translations.discussProject}
            </button>
            {/* <button onClick={() => { handleLanguageChange(); toggleMenu(); }} className="flex-1 bg-[#f5f5f5] flex items-center justify-center gap-2 rounded-[20px] py-[14px] font-normal text-[18px]">
               <img src={`${baseUrl}/icons/en.svg`} alt="Language" className="w-5 h-5" />
              {locale === 'ru' ? 'En' : 'Ru'}
            </button> */}
          </div>
          <a href={tg_link} target="_blank" rel="noopener noreferrer" className="text-[18px] font-normal w-full bg-[#333333] text-white py-2.5 rounded-[20px] flex items-center justify-between px-2.5">
            <img src={`${baseUrl}/icons/telegram.svg`} alt="Telegram" className="w-6 h-6" />
            <span>{translations.ourChannel}</span>
            <span className="bg-white text-[#333333] px-3 py-1 rounded-xl">1.5к</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default Navbar;