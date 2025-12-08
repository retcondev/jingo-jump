"use client";

import { faqs } from "./data";

export function FAQSection() {
  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const content = button.nextElementSibling;
    const icon = button.querySelector('i');
    
    content?.classList.toggle('hidden');
    icon?.classList.toggle('rotate-180');
  };

  return (
    <section id="faq" className="py-20 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-[#1a1a1a] mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                className="faq-toggle w-full text-left px-6 py-5 flex items-center justify-between font-semibold text-lg text-[#1a1a1a] hover:bg-gray-50 transition"
                onClick={handleToggle}
              >
                <span>{faq.question}</span>
                <i className="fa-solid fa-chevron-down text-primary-500 transition-transform"></i>
              </button>
              <div className="faq-content hidden px-6 pb-5 text-gray-600">
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
