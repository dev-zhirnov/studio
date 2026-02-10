import React from 'react';

const LOGO_DATA = [
  { name: 'Raiffeisen Bank', file: 'raiffeisen.svg' },
  { name: 'Rostelecom', file: 'rostelecom.svg' },
  { name: 'T BANK', file: 'tbank.svg' },
  { name: '2GIS', file: '2gis.svg' },
  { name: 'CoMagic', file: 'comagic.svg' },
  { name: 'justfood', file: 'justfood.svg' },
  { name: 'FLOMNI', file: 'flomni.svg' },
  { name: 'UIS', file: 'uis.svg' },
];

const LogoItem: React.FC<{ name: string; file: string }> = ({ name, file }) => {
  const baseUrl = "/assets/img/logos";
  return (
    <div className="flex items-center group cursor-default transition-all duration-500 px-6 md:px-12">
      <img 
        src={`${baseUrl}/${file}`} 
        alt={name} 
        className="h-auto max-h-[40px] md:max-h-[64px] w-auto opacity-30 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500" 
      />
    </div>
  );
};

const Marquee: React.FC = () => {
  return (
    <div className="relative w-full overflow-hidden pt-8 md:pb-[100px] pb-[60px]">
      {/* Left Fade Overlay */}
      <div className="absolute left-0 top-0 bottom-0 w-20 md:w-60 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
      
      {/* Right Fade Overlay */}
      <div className="absolute right-0 top-0 bottom-0 w-20 md:w-60 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

      <div className="animate-marquee flex items-center">
          <div className="flex items-center">
            {LOGO_DATA.map((logo, i) => (
              <LogoItem key={`set1-${i}`} {...logo} />
            ))}
          </div>
          <div className="flex items-center">
            {LOGO_DATA.map((logo, i) => (
              <LogoItem key={`set2-${i}`} {...logo} />
            ))}
          </div>
          <div className="flex items-center">
            {LOGO_DATA.map((logo, i) => (
              <LogoItem key={`set3-${i}`} {...logo} />
            ))}
          </div>
          <div className="flex items-center">
            {LOGO_DATA.map((logo, i) => (
              <LogoItem key={`set4-${i}`} {...logo} />
            ))}
          </div>
      </div>
    </div>
  );
};

export default Marquee;