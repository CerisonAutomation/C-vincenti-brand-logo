import React from 'react';

interface FAQBlockProps {
  title?: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  className?: string;
}

export const FAQBlock: React.FC<FAQBlockProps> = ({
  title = 'Frequently Asked Questions',
  faqs,
  className = '',
}) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className={`py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground text-center mb-8 sm:mb-10 lg:mb-12 xl:mb-16">
            {title}
          </h2>
        )}
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 lg:space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left p-4 sm:p-6 lg:p-8 flex justify-between items-center hover:bg-secondary/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-foreground pr-4 leading-tight">
                  {faq.question}
                </h3>
                <svg
                  className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div
                  id={`faq-answer-${index}`}
                  className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 border-t border-border"
                >
                  <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed pt-4">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
