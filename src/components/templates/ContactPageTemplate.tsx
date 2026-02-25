import React from 'react';
import { PageTemplate, BlockType } from './PageTemplate';

interface ContactPageTemplateProps {
  onFormSubmit: (data: any) => void;
  className?: string;
}

export const ContactPageTemplate: React.FC<ContactPageTemplateProps> = ({
  onFormSubmit,
  className = '',
}) => {
  const blocks: BlockType[] = [
    {
      type: 'hero',
      props: {
        title: 'Contact Us',
        subtitle: 'Get In Touch',
        description: 'Ready to discuss your property management needs? We\'re here to help with personalized solutions.',
      },
    },
    {
      type: 'content',
      props: {
        title: 'Let\'s Start a Conversation',
        content: 'Whether you\'re looking to list your property for management or have questions about our services, our team is ready to assist you.',
        image: '/api/placeholder/600/400',
        imageAlt: 'Contact our team',
      },
    },
    {
      type: 'contact',
      props: {
        title: 'Contact Information',
        description: 'Reach out to us through any of these channels.',
        email: 'info@christianopm.com',
        phone: '+356 7927 4688',
        address: 'Valletta, Malta',
      },
    },
    {
      type: 'map',
      props: {
        title: 'Visit Our Office',
        description: 'Located in the heart of Valletta, our office is easily accessible by car or public transport.',
        address: '123 Merchant Street, Valletta, Malta',
        latitude: 35.8989,
        longitude: 14.5146,
      },
    },
    {
      type: 'faq',
      props: {
        title: 'Common Questions',
        faqs: [
          {
            question: 'How quickly can you respond to inquiries?',
            answer: 'We aim to respond to all inquiries within 24 hours during business days.',
          },
          {
            question: 'Do you offer virtual consultations?',
            answer: 'Yes, we offer virtual consultations via video call for clients who prefer remote meetings.',
          },
          {
            question: 'What areas do you serve?',
            answer: 'We serve properties throughout Malta and Gozo, with a focus on premium residential and commercial properties.',
          },
          {
            question: 'Can you provide references?',
            answer: 'Yes, we can provide references from satisfied clients upon request and NDA.',
          },
        ],
      },
    },
  ];

  return <PageTemplate blocks={blocks} className={className} />;
};
