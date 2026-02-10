import React from 'react';
import ContactForm from '@/components/ContactForm';

const TestContactFormPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Contact Form Test Page</h1>
      <div className="max-w-4xl mx-auto">
        <ContactForm brief_link="https://t.me/test" />
      </div>
    </div>
  );
};

export default TestContactFormPage;