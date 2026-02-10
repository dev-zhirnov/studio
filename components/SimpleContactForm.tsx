import React, { useState } from 'react';

interface SimpleContactFormProps {
  brief_link?: string;
}

const SimpleContactForm: React.FC<SimpleContactFormProps> = ({ brief_link }) => {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<{ success?: boolean; message?: string }>({});
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

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
    setIsSubmitting(true);
    setSubmitStatus({});
    
    try {
      // Check if we're in development mode
      const isDevelopment = process.env.NODE_ENV === 'development';
      console.log('Environment:', isDevelopment ? 'development' : 'production');
      
      if (isDevelopment) {
        // Mock successful submission for local development
        console.log('DEV MODE: Mock form submission with data:', { name, phone, message });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful response
        const mockResponse = {
          success: true,
          message: 'Форма успешно отправлена! (Режим разработки - фактическая отправка не производится)'
        };
        
        console.log('Mock response:', mockResponse);
        setSubmitStatus({ success: true, message: mockResponse.message });
        setShowSuccess(true);
        
        // Reset form
        setName('');
        setPhone('');
        setMessage('');
        
        // Hide success message after 5 seconds
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        // Production submission logic would go here
        console.log('Production submission would be handled here');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus({ 
        success: false, 
        message: 'Ошибка при отправке формы. Пожалуйста, попробуйте еще раз.' 
      });
    } finally {
      console.log('Form submission completed');
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacts" className="py-12 px-4 max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-3xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-8">Обсудить проект</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Имя*</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Телефон*</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Расскажите о задаче*</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 min-h-[120px]"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-white text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
          </button>
        </form>
        
        {/* Form Status Messages */}
        {submitStatus.message && (
          <div className={`mb-4 p-4 rounded-lg ${submitStatus.success ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
            <p className={`text-lg font-medium ${submitStatus.success ? 'text-green-300' : 'text-red-300'}`}>
              {submitStatus.message}
            </p>
          </div>
        )}
        
        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 max-w-md mx-4 text-center">
              <h3 className="text-2xl font-medium text-gray-800 mb-4">Спасибо за вашу заявку!</h3>
              <p className="text-gray-600 mb-6">Мы свяжемся с вами в ближайшее время.</p>
              <button
                onClick={() => setShowSuccess(false)}
                className="h-[52px] px-6 bg-gray-800 text-white rounded-2xl hover:bg-gray-700 transition-all"
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

export default SimpleContactForm;