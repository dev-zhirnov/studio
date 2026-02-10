import React from 'react';
import SimpleContactForm from '@/components/SimpleContactForm';

const TestSimpleContactFormPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <SimpleContactForm brief_link="https://t.me/test" />
    </div>
  );
};

export default TestSimpleContactFormPage;