import React, { useState, useRef, useEffect } from 'react';
import { submitContactForm } from '@/lib/wp-api';
import { WP_SITE_URL } from '@/lib/config';

interface ContactFormProps {
  brief_link?: string;
}

const FloatingInput: React.FC<{ label: string; type?: string; required?: boolean }> = ({ label, type = "text", required }) => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");

  return (
    <div className="relative w-full group">
      <label 
        className={`absolute left-0 transition-all duration-300 pointer-events-none font-['Inter'] font-medium tracking-tight ${
          focused || value 
            ? "-top-4 md:-top-6 text-[13px] text-zinc-500 leading-tight opacity-100" 
            : "top-0 text-white text-lg md:text-2xl leading-8 opacity-50"
        }`}
      >
        {label}{required ? "*" : ""}
      </label>
      <input 
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full bg-transparent border-b border-white/20 pb-2 md:pb-4 pt-1 focus:outline-none focus:border-[#168D65] transition-colors text-white text-2xl font-medium font-['Inter'] leading-8 tracking-tight text-left"
      />
    </div>
  );
};

const AutoExpandingTextarea: React.FC<{ label: string; required?: boolean }> = ({ label, required }) => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <div className="relative w-full md:col-span-2 lg:col-span-3 group">
      <label 
        className={`absolute left-0 transition-all duration-300 pointer-events-none font-['Inter'] font-medium tracking-tight ${
          focused || value 
            ? "-top-4 md:-top-6 text-[13px] text-zinc-500 leading-tight opacity-100" 
            : "top-0 text-white text-lg md:text-2xl leading-8 opacity-50"
        }`}
      >
        {label}{required ? "*" : ""}
      </label>
      <textarea 
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full bg-transparent border-b border-white/20 pb-4 pt-1 focus:outline-none focus:border-[#168D65] transition-colors text-white text-2xl font-medium font-['Inter'] leading-8 tracking-tight resize-none no-scrollbar overflow-hidden text-left"
      />
    </div>
  );
};

const ContactForm: React.FC<ContactFormProps> = ({ brief_link }) => {
  const [activeBudget, setActiveBudget] = useState<string>('1-3 млн');
  const [name, setName] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<{ success?: boolean; message?: string }>({});
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  
  const baseUrl = "/assets/img";
  const budgets = ['до 1 млн', '1-3 млн', '3-7 млн', 'от 7 млн'];
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '+7';
    
    if (digits.length > 1) {
      formatted += ' (' + digits.slice(1, 4);
    }
    if (digits.length > 4) {
      formatted += ') ' + digits.slice(4, 7);
    }
    if (digits.length > 7) {
      formatted += '-' + digits.slice(7, 9);
    }
    if (digits.length > 9) {
      formatted += '-' + digits.slice(9, 11);
    }
    
    return formatted;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFilePath(selectedFile.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    
    // Validate required fields
    if (!name || !phone || !message) {
      console.log('Validation failed - missing required fields');
      setSubmitStatus({ success: false, message: 'Пожалуйста, заполните все обязательные поля.' });
      return;
    }
    
    console.log('Validation passed, submitting form...');
    console.log('Form data:', { name, company, phone, message, budget: activeBudget, file: file?.name });
    
    setIsSubmitting(true);
    setSubmitStatus({});
    
    try {
      // Use WordPress Contact Form 7 API
      const result = await submitContactForm({
        name,
        company: company || '',
        phone,
        message,
        budget: activeBudget,
        file: file || undefined
      });
      
      console.log('WordPress API response:', result);
      
      if (result.success) {
        setSubmitStatus({ success: true, message: result.message || 'Форма успешно отправлена!' });
        setShowSuccess(true);
        
        // Reset form
        setName('');
        setCompany('');
        setPhone('');
        setMessage('');
        setFile(null);
        setFilePath('');
        
        // Hide success message after 5 seconds
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        setSubmitStatus({ 
          success: false, 
          message: result.message || 'Не удалось отправить форму. Пожалуйста, попробуйте еще раз.' 
        });
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus({ 
        success: false, 
        message: 'Ошибка сети. Пожалуйста, проверьте ваше соединение.' 
      });
    } finally {
      console.log('Form submission completed');
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacts" className="pb-6 md:pb-12 px-4 md:px-10 max-w-[1920px] mx-auto">
      <div className="bg-[#333333] rounded-[2.2rem] md:rounded-[4rem] p-5 md:py-[48px] md:px-[56px] text-white overflow-hidden relative">
        
        <h2 className="text-[48px] md:text-[106px] font-medium tracking-[-0.07em] leading-none mb-6 md:mb-[52px] max-w-[50%] md:max-w-none">
          Обсудить проект
        </h2>

        {/* Contact Info Card */}
        <div className="bg-[#FFFFFF14] backdrop-blur-md rounded-[1.5rem] md:rounded-[2.5rem] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 md:mb-[52px]">
          <div className="flex items-start md:items-center gap-5 flex-1">
            <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden bg-zinc-800 flex-shrink-0">
               <img src={`${baseUrl}/icons/cpo.png`} alt="Василина" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-lg md:text-[24px] leading-tight md:mb-2 tracking-tight">
                Заполните форму или напишите в телеграм — мы оперативно с вами свяжемся
              </p>
              <p className="text-[18px] text-zinc-500 tracking-tight">
                Василина Глушкова <span className="mx-1 opacity-30">•</span> Co-Founder & CPO студии
              </p>
            </div>
          </div>
          {/* White Button: 52px height, px-4 py-3.5, fullwidth mobile */}
          <a href={brief_link || 'https://t.me/vglushkovva'} target="_blank" rel="noopener noreferrer" className="h-[52px] w-full md:w-auto px-4 py-3.5 bg-white rounded-2xl inline-flex justify-center items-center gap-2 overflow-hidden hover:bg-zinc-100 transition-all active:scale-95 group">
            <span className="justify-center text-[#1D2023] text-lg font-normal leading-6">Написать в Telegram</span>
          </a>
        </div>

         {/* Form Grid */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[26px] md:gap-14 mb-4 items-end">
          <div className="relative w-full group">
           <label className={`absolute left-0 transition-all duration-300 pointer-events-none font-['Inter'] font-medium tracking-tight ${name ? "-top-4 md:-top-6 text-[13px] text-zinc-500 leading-tight opacity-100" : "top-0 text-white text-lg md:text-2xl leading-8 opacity-50"}`}>
             Имя*
           </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setName(name || '')}
              onBlur={() => setName(name)}
              className="w-full bg-transparent border-b border-white/20 pb-2 md:pb-4 pt-1 focus:outline-none focus:border-[#168D65] transition-colors text-white text-2xl font-medium font-['Inter'] leading-8 tracking-tight text-left"
              required
            />
          </div>
          
          <div className="relative w-full group">
            <label className={`absolute left-0 transition-all duration-300 pointer-events-none font-['Inter'] font-medium tracking-tight ${company ? "-top-4 md:-top-6 text-[13px] text-zinc-500 leading-tight opacity-100" : "top-0 text-white text-lg md:text-2xl leading-8 opacity-50"}`}>
              Компания
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              onFocus={() => setCompany(company || '')}
              onBlur={() => setCompany(company)}
              className="w-full bg-transparent border-b border-white/20 pb-2 md:pb-4 pt-1 focus:outline-none focus:border-[#168D65] transition-colors text-white text-2xl font-medium font-['Inter'] leading-8 tracking-tight text-left"
            />
          </div>
          
           <div className="relative w-full group">
            <label className={`absolute left-0 transition-all duration-300 pointer-events-none font-['Inter'] font-medium tracking-tight ${phone ? "-top-4 md:-top-6 text-[13px] text-zinc-500 leading-tight opacity-100" : "top-0 text-white text-lg md:text-2xl leading-8 opacity-50"}`}>
              Телефон* 
            </label>
             <input
               type="tel"
               value={phone}
               onChange={(e) => setPhone(formatPhone(e.target.value))}
               onFocus={() => setPhone(phone || '+7')}
               onBlur={() => setPhone(phone)}
               placeholder=''
               className="w-full bg-transparent border-b border-white/20 pb-2 md:pb-4 pt-1 focus:outline-none focus:border-[#168D65] transition-colors text-white text-2xl font-medium font-['Inter'] leading-8 tracking-tight text-left"
               required
               maxLength={18}
             />
           </div>
          
          <div className="relative w-full md:col-span-2 lg:col-span-3 group">
           <label className={`absolute left-0 transition-all duration-300 pointer-events-none font-['Inter'] font-medium tracking-tight ${message ? "-top-4 md:-top-6 text-[13px] text-zinc-500 leading-tight opacity-100" : "top-0 text-white text-lg md:text-2xl leading-8 opacity-50"}`}>
             Расскажите о задаче*
           </label>
            <textarea
              ref={textareaRef}
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setMessage(message || '')}
              onBlur={() => setMessage(message)}
              className="w-full bg-transparent border-b border-white/20 pb-4 pt-1 focus:outline-none focus:border-[#168D65] transition-colors text-white text-2xl font-medium font-['Inter'] leading-8 tracking-tight resize-none no-scrollbar overflow-hidden text-left"
              required
            />
          </div>
           {/* Budget and File Upload Sections - moved inside form */}
           <div className="flex flex-col lg:flex-row gap-6 md:gap-20 col-span-full">
             <div className="flex-auto xl:flex-1">
               <label className="block text-lg md:text-2xl font-medium text-white/50 mb-2 md:mb-6 font-['Inter'] text-left leading-8">Бюджет, ₽</label>
               <div className="flex flex-wrap gap-3">
                 {budgets.map((b) => (
                   <button
                     key={b}
                     type="button"
                     onClick={() => setActiveBudget(b)}
                     className={`h-[52px] px-4 py-3.5 rounded-2xl inline-flex justify-center items-center gap-2 overflow-hidden transition-all ${
                       activeBudget === b 
                         ? "bg-white/20 text-white" 
                         : "bg-[#FFFFFF14] text-white/50 hover:bg-[#FFFFFF14]"
                     }`}
                   >
                     <span className="justify-center text-lg font-normal font-['Golos_Text'] leading-6">{b}</span>
                   </button>
                 ))}
               </div>
             </div>

               <div className="flex-auto xl:flex-1">
                 <label className="block text-lg md:text-2xl font-medium text-white/50 mb-2 md:mb-6 font-['Inter'] text-left leading-8">Техническое задание</label>
                 {/* Hidden input for file path */}
                 <input type="hidden" name="your-file" value={filePath} />
                 {/* File upload input */}
                 <input
                   type="file"
                   ref={fileInputRef}
                   onChange={handleFileChange}
                   className="hidden"
                   accept=".pdf,.doc,.docx,.txt,.rtf"
                 />
                {/* Black Button: 52px height, px-4 py-3.5, auto width on mobile */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-[52px] px-4 py-3.5 bg-[#FFFFFF14] hover:bg-[#FFFFFF14] rounded-2xl inline-flex justify-center items-center gap-2 overflow-hidden transition-all group"
                >
                  <span className="justify-center text-white text-lg font-normal font-['Golos_Text'] leading-6">
                    {file ? file.name.substring(0, 20) + (file.name.length > 20 ? '...' : '') : 'Прикрепить файл'}
                  </span>
                </button>
              </div>
             <div className="flex-none xl:flex-1">
             </div>
           </div>

           {/* Submit Block - moved inside form */}
           <div className="col-span-full md:mt-[52px] p-4 bg-[#FFFFFF14] rounded-[1.5rem] md:rounded-[24px] flex flex-col md:flex-row items-center gap-4">
              {/* White Button: 52px height, px-4 py-3.5, fullwidth mobile */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-[52px] w-full md:w-auto min-w-min whitespace-nowrap px-4 py-3.5 bg-white rounded-2xl inline-flex justify-center items-center gap-2 overflow-hidden hover:bg-zinc-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="justify-center text-[#1D2023] text-lg font-normal font-['Golos_Text'] leading-6">Отправка...</span>
                ) : (
                  <span className="justify-center text-[#1D2023] text-lg font-normal font-['Golos_Text'] leading-6">Отправить заявку</span>
                )}
              </button>
              <p className="text-[18px] font-medium text-white text-left leading-tight tracking-tight font-['Inter']">
                Нажимая на кнопку, вы даете согласие на <a target="_blank" href="/privacy.pdf" className="text-white underline underline-offset-4 decoration-white hover:decoration-[#168D65] focus:decoration-[#168D65] transition-all">обработку персональных данных</a> и соглашаетесь с <a target="_blank" href="/privacy.pdf" className="text-white underline underline-offset-4 decoration-white hover:decoration-[#168D65] focus:decoration-[#168D65] transition-all">политикой конфиденциальности</a>.
              </p>
           </div>
         </form>

         {/* Success Modal */}
         {showSuccess && (
           <div className="fixed inset-0 bg-[#333333]/50 backdrop-blur-sm flex items-center justify-center z-50">
             <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 max-w-md mx-4 text-center">
               <h3 className="text-2xl font-medium text-[#333333] mb-4">Спасибо за вашу заявку!</h3>
               <p className="text-[#1D2023] mb-6">Мы свяжемся с вами в ближайшее время.</p>
               <button
                 onClick={() => setShowSuccess(false)}
                 className="h-[52px] px-6 bg-zinc-800 text-white rounded-2xl hover:bg-zinc-700 transition-all"
               >
                 Закрыть
               </button>
             </div>
           </div>
         )}
      </div>
    </section>
  );
};

export default ContactForm;