import React from 'react';
import { PageTemplate, BlockType } from './PageTemplate';

interface TermsPageTemplateProps {
  className?: string;
}

export const TermsPageTemplate: React.FC<TermsPageTemplateProps> = ({
  className = '',
}) => {
  const blocks: BlockType[] = [
    {
      type: 'hero',
      props: {
        title: 'Terms of Service',
        subtitle: 'Legal Information',
        description: 'Please read our terms of service carefully before using our services.',
      },
    },
    {
      type: 'content',
      props: {
        title: 'Acceptance of Terms',
        content: 'By accessing and using Christiano Vincenti Property Management services, you accept and agree to be bound by the terms and provision of this agreement.',
      },
    },
    {
      type: 'content',
      props: {
        title: 'Services',
        content: 'We provide professional property management services including but not limited to property leasing, maintenance coordination, financial reporting, and tenant relations management.',
      },
    },
    {
      type: 'content',
      props: {
        title: 'User Responsibilities',
        content: 'Clients are responsible for providing accurate information, maintaining property insurance, and complying with local laws and regulations.',
      },
    },
    {
      type: 'content',
      props: {
        title: 'Fees and Payment',
        content: 'Management fees are calculated as a percentage of gross rental income. Additional fees may apply for specialized services.',
      },
    },
    {
      type: 'content',
      props: {
        title: 'Termination',
        content: 'Either party may terminate this agreement with 30 days written notice. Outstanding fees and obligations remain due upon termination.',
      },
    },
  ];

  return <PageTemplate blocks={blocks} className={className} />;
};
