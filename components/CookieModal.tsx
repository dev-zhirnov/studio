import React, { useState, useEffect } from 'react';

const CookieModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 6);
    localStorage.setItem('cookie_consent_expiry', expiryDate.toISOString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto bg-[#1D2023] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8 shadow-lg">
        <p className="text-white text-sm md:text-base font-medium leading-tight tracking-tight">
          Мы используем файлы cookie, чтобы собирать статистику и улучшать работу сайта. Подробности —{' '}
          <a href="/privacy.pdf" className="text-white underline underline-offset-4 decoration-white hover:decoration-[#168D65] focus:decoration-[#168D65] transition-all">
            в политике конфиденциальности
          </a>
          .
        </p>
        <button
          onClick={handleAccept}
          className="whitespace-nowrap h-[44px] md:h-[52px] px-6 py-3 bg-white rounded-xl inline-flex justify-center items-center overflow-hidden hover:bg-zinc-100 transition-all active:scale-95 flex-shrink-0"
        >
          <span className="justify-center text-[#1D2023] text-base md:text-lg font-normal font-['Golos_Text'] leading-6">
            Все понятно
          </span>
        </button>
      </div>
    </div>
  );
};

export default CookieModal;
