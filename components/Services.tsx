import React from 'react';

interface ServiceCardProps {
  title: string;
  description: string;
  iconColor: string;
  imageSrc: string;
}

const ServiceIcon: React.FC<{ src: string, color: string }> = ({ src, color }) => {
  return (
    <div className="relative w-[180px] h-[180px] md:w-[360px] md:h-[360px] flex items-center justify-center pointer-events-none">
      {/* Dynamic Glow Background */}
      <div 
        className="absolute inset-0 rounded-full blur-[60px] opacity-15"
        style={{ backgroundColor: color }}
      ></div>
      
      {/* 
        Simplified Lift Wrapper:
        Only handles the smooth -10px lift on hover defined in index.html
      */}
      <div className="relative z-10 w-full h-full service-lift-wrapper">
        <img 
          src={src} 
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, iconColor, imageSrc }) => {
  return (
    <div className="group relative flex flex-col pt-[90px] md:pt-[180px] h-full">
      {/* Icon Half-Above the card */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
        <ServiceIcon src={imageSrc} color={iconColor} />
      </div>
      
      {/* Card Wrapper */}
      <div className="self-stretch pl-4 pr-3 md:pl-8 md:pr-8 pt-20 md:pt-40 pb-4 bg-zinc-100 rounded-[32px] inline-flex flex-col justify-start items-start gap-1 overflow-hidden z-10 h-full">
        <div className="self-stretch flex flex-col justify-start items-start gap-2 md:gap-6">
          <div className="self-stretch inline-flex justify-start items-start gap-5">
            <h3 className="flex-1 md:text-center justify-center text-[#333333] text-xl md:text-[40px] font-medium leading-[1.1] md:leading-10 tracking-tight">
              {title}
            </h3>
          </div>
          <p className="self-stretch text-[#1D2023] text-sm md:text-xl font-normal leading-[1.2] md:leading-6 md:tracking-tight">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

const Services: React.FC = () => {
  const baseUrl = "/assets/img/services";
  
  const services: ServiceCardProps[] = [
    {
      title: "Разработка",
      description: "Создаем цифровые платформы, интеграции и внедряем AI‑технологии",
      iconColor: "#168D65",
      imageSrc: `${baseUrl}/developing.png`,
    },
    {
      title: "UX/UI дизайн",
      description: "Создаем удобный дизайн для сайтов, финансовых сервисов и приложений",
      iconColor: "#2563eb",
      imageSrc: `${baseUrl}/design.png`,
    },
    {
      title: "Брендинг",
      description: "Создаем айдентику, бренд-системы и гайдлайны для продуктов",
      iconColor: "#dc2626",
      imageSrc: `${baseUrl}/branding.png`,
    },
    {
      title: "UX-аудит",
      description: "Проводим UX-аудит продукта, находим точки роста и даём план улучшений",
      iconColor: "#4f46e5",
      imageSrc: `${baseUrl}/audit.png`,
    }
  ];

  return (
    <section id="services" className="pb-12 md:pb-[144px] px-6 md:px-10 max-w-[1920px] mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 md:gap-x-4 gap-y-0 md:gap-y-32">
        {services.map((service, index) => (
          <ServiceCard 
            key={index} 
            {...service} 
          />
        ))}
      </div>
    </section>
  );
};

export default Services;