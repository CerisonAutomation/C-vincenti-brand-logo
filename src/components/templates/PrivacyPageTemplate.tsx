import React from 'react';
import { PageTemplate, BlockType } from './PageTemplate';

interface PrivacyPageTemplateProps {
  className?: string;
}

export const PrivacyPageTemplate: React.FC<PrivacyPageTemplateProps> = ({
  className = '',
}) => {
  const blocks: BlockType[] = [
    {
      type: 'hero',
      props: {
        title: 'Privacy Policy',
        subtitle: 'Data Protection',
        description: 'We are committed to protecting your privacy and personal information.',
      },
    },
    {
      type: 'content',
      props: {
        title: 'Information We Collect',
        content: 'We collect personal information necessary to provide our property management services, including contact details, property information, and financial data.',
      },
    },
    {
      type: 'content',
      props: {
        title: 'How We Use Your Information',
        content: 'Your information is used to provide property management services, communicate with you, and comply with legal obligations.',
      },
    },
    {
      type: 'content',
      props: {
        title: 'Data Security',
        content: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
      },
    },
    {
      type: 'content',
      props: {
        title: 'Data Sharing',
        content: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law.',
      },
    },
    {
      type: 'content',
      props: {
        title: 'Your Rights',
        content: 'You have the right to access, update, or delete your personal information. Contact us to exercise these rights.',
      },
    },
  ];

  return <PageTemplate blocks={blocks} className={className} />;
};
