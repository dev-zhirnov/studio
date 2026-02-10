
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-20 md:pt-[120px] px-6 md:px-10 max-w-[1920px] mx-auto overflow-hidden">
      <h1 className="text-5xl md:text-8xl font-medium tracking-[-0.015em] text-[#333333] leading-[1.0] md:leading-[100px]">
        Создаем и упаковываем <br />IT-продукты для лидеров рынка
        <span className="text-[#333333]/30 block mt-0">и тех, кто хочет ими стать</span>
      </h1>
    </section>
  );
};

export default Hero;