// Content configuration for all templates - no hardcoded values
export const LANDING_CONTENT = {
  hero: {
    title: 'Luxury Property Management',
    subtitle: 'Owner Services',
    description: 'Maximize your asset\'s performance through our proprietary operational protocols. Professional stewardship for Malta\'s most distinguished portfolios.',
    primaryButton: {
      text: 'Initialize Management',
      onClick: () => console.log('Hero action'),
    },
  },
  features: {
    title: 'Why Choose Us',
    description: 'Comprehensive property management solutions tailored for luxury markets.',
    items: [
      {
        icon: '🏠',
        title: 'Property Management',
        description: 'Full-service management for residential and commercial properties.',
      },
      {
        icon: '💰',
        title: 'Revenue Optimization',
        description: 'Maximize rental income through strategic pricing and marketing.',
      },
      {
        icon: '🛡️',
        title: 'Risk Management',
        description: 'Comprehensive insurance and legal protection for property owners.',
      },
    ],
  },
  stats: [
    { value: '500+', label: 'Properties Managed' },
    { value: '€50M+', label: 'Assets Under Management' },
    { value: '98%', label: 'Client Satisfaction' },
    { value: '15+', label: 'Years Experience' },
  ],
  testimonial: {
    quotes: [
      {
        quote: 'Exceptional service and attention to detail. Our property portfolio has never performed better.',
        author: 'Maria Rodriguez',
        role: 'Property Investor',
      },
      {
        quote: 'Professional, reliable, and results-driven. Highly recommended for luxury property management.',
        author: 'John Smith',
        role: 'Real Estate Developer',
      },
    ],
  },
  cta: {
    title: 'Ready to Get Started?',
    description: 'Contact us today for a free consultation and property assessment.',
    buttonText: 'Contact Us',
    buttonOnClick: () => console.log('CTA action'),
  },
  newsletter: {
    title: 'Stay Updated',
    description: 'Get the latest insights on Malta property market and management best practices.',
    placeholder: 'Enter your email',
    buttonText: 'Subscribe',
    onSubscribe: (email: string) => console.log('Subscribe:', email),
  },
};

export const ABOUT_CONTENT = {
  hero: {
    title: 'About Christiano Vincenti',
    subtitle: 'Our Story',
    description: 'Over 15 years of excellence in luxury property management across Malta and Gozo.',
  },
  mission: {
    title: 'Our Mission',
    content: 'To provide institutional-grade property management services while maintaining the personal touch that our clients deserve. We combine cutting-edge technology with deep local market knowledge.',
    image: '/api/placeholder/600/400',
    imageAlt: 'Our team at work',
  },
  timeline: {
    title: 'Our History',
    events: [
      {
        date: '2008',
        title: 'Founded',
        description: 'Christiano Vincenti Property Management was established with a vision to revolutionize property management in Malta.',
      },
      {
        date: '2012',
        title: 'Expansion',
        description: 'Expanded services to include commercial properties and international client management.',
      },
      {
        date: '2018',
        title: 'Technology Integration',
        description: 'Launched proprietary management platform with real-time reporting and analytics.',
      },
      {
        date: '2024',
        title: 'Market Leadership',
        description: 'Recognized as Malta\'s premier luxury property management firm with €50M+ AUM.',
      },
    ],
  },
  team: {
    title: 'Meet Our Team',
    members: [
      {
        name: 'Christiano Vincenti',
        role: 'Founder & CEO',
        bio: 'With over 20 years in real estate, Christiano leads our vision for excellence in property management.',
        avatar: '/api/placeholder/150/150',
      },
      {
        name: 'Maria Rodriguez',
        role: 'Operations Director',
        bio: 'Maria oversees day-to-day operations and ensures our clients receive exceptional service.',
        avatar: '/api/placeholder/150/150',
      },
      {
        name: 'John Smith',
        role: 'Finance Director',
        bio: 'John manages financial reporting and optimization strategies for our property portfolios.',
        avatar: '/api/placeholder/150/150',
      },
    ],
  },
  quote: {
    quote: 'Success in property management comes from understanding that every property tells a story, and every owner has unique needs.',
    author: 'Christiano Vincenti',
    role: 'Founder & CEO',
  },
  stats: [
    { value: '15+', label: 'Years Experience' },
    { value: '500+', label: 'Properties' },
    { value: '€50M+', label: 'Assets Managed' },
    { value: '98%', label: 'Client Retention' },
  ],
};

export const SERVICES_CONTENT = {
  hero: {
    title: 'Our Services',
    subtitle: 'Comprehensive Property Management',
    description: 'From acquisition to disposition, we provide end-to-end property management solutions tailored for luxury markets.',
  },
  features: {
    title: 'Property Management Services',
    description: 'Complete suite of services designed to maximize your property\'s potential.',
    items: [
      {
        icon: '📊',
        title: 'Financial Management',
        description: 'Comprehensive accounting, budgeting, and financial reporting for optimal cash flow management.',
      },
      {
        icon: '🏠',
        title: 'Property Maintenance',
        description: '24/7 maintenance coordination and quality assurance for property upkeep.',
      },
      {
        icon: '👥',
        title: 'Tenant Relations',
        description: 'Professional tenant screening, lease management, and relationship building.',
      },
      {
        icon: '📈',
        title: 'Marketing & Leasing',
        description: 'Strategic marketing campaigns and lease optimization for maximum occupancy.',
      },
      {
        icon: '🛡️',
        title: 'Risk Management',
        description: 'Insurance coordination, legal compliance, and risk mitigation strategies.',
      },
      {
        icon: '💻',
        title: 'Technology Solutions',
        description: 'Proprietary management platform with real-time analytics and reporting.',
      },
    ],
  },
  institutional: {
    title: 'Institutional Approach',
    content: 'We apply institutional-grade standards to every property we manage, ensuring consistent performance and professional stewardship.',
    image: '/api/placeholder/600/400',
    imageAlt: 'Professional property management',
  },
  pricing: {
    plans: [
      {
        name: 'Essentials',
        price: '15% of Net Room Revenue + VAT',
        description: 'Core operations. Your property listed, managed, and maintained — without the extras.',
        features: [
          'Multi-channel listing creation & management',
          'Superhost status from day one — inherit established credibility',
          'Smart seasonal pricing — rule-based optimisation',
          'Reviews & reputation management',
          'Guest communication & 24/7 concierge',
          'Check-in & check-out coordination',
          'Professional cleaning & laundry after every stay',
          'Maintenance coordination — at cost, no markup',
          'Payment collection & eco-tax compliance',
          'Damage claim management',
          'Monthly payout statements — €35 per report',
          'Callout fees — €20 + VAT per incident',
        ],
        buttonText: 'Get started',
      },
      {
        name: 'Complete',
        price: '18% of Net Room Revenue + VAT',
        description: 'Full-service management. The guest experience and owner visibility that drives better returns.',
        features: [
          'Everything in Essentials, plus',
          'Welcome amenities — wine, water, coffee, tea, toiletries & household essentials included as standard',
          'Guest property manual — reduces questions, improves stay quality',
          'Property assessment & readiness checklist at onboarding',
          'Monthly reporting included — saves €420/year',
          'All callout fees included — saves €240+/year',
          'Mail & utilities management included — saves €120/year',
          'Annual photography refresh included — saves ~€300/year',
          '€100 annual platform fee waived',
          'Quarterly performance reviews — rate strategy, competitive positioning, optimisation recommendations',
          'Priority operations guarantee — 24-hour owner response time (vs 48 hours in Essentials)',
          'Quarterly market & competitive analysis — occupancy trends, rate benchmarking, review sentiment',
          'Owner use coordination — when you want to use your property, we handle the logistics',
          'Owner dashboard — live bookings, revenue & communications',
          '24/7 owner support',
          'Dedicated direct booking webpage — your property, your guests, lower platform costs',
        ],
        popular: true,
        buttonText: 'Get started',
      },
    ],
  },
  faq: {
    title: 'Service FAQs',
    items: [
      {
        question: 'What properties do you manage?',
        answer: 'We specialize in luxury residential and commercial properties across Malta and Gozo. Our expertise covers apartments, villas, townhouses, and commercial spaces.',
      },
      {
        question: 'How do you ensure property quality?',
        answer: 'We maintain strict quality standards with regular inspections, professional maintenance coordination, and comprehensive reporting to property owners.',
      },
      {
        question: 'What is your management fee?',
        answer: 'Our fees vary by service level and property type, typically ranging from 8-12% of gross rental income. We offer customized packages based on your needs.',
      },
      {
        question: 'How do you handle emergencies?',
        answer: 'We provide 24/7 emergency response coordination and have established relationships with trusted local contractors for immediate service.',
      },
    ],
  },
  cta: {
    title: 'Ready to Experience Professional Property Management?',
    description: 'Contact us today for a comprehensive property assessment and personalized service proposal.',
    buttonText: 'Schedule Consultation',
    buttonOnClick: () => console.log('Contact click'),
  },
};

export const CONTACT_CONTENT = {
  hero: {
    title: 'Contact Us',
    subtitle: 'Get In Touch',
    description: 'Ready to discuss your property management needs? We\'re here to help with personalized solutions.',
  },
  intro: {
    title: 'Let\'s Start a Conversation',
    content: 'Whether you\'re looking to list your property for management or have questions about our services, our team is ready to assist you.',
    image: '/api/placeholder/600/400',
    imageAlt: 'Contact our team',
  },
  info: {
    title: 'Contact Information',
    description: 'Reach out to us through any of these channels.',
    email: 'info@christianopropertymanagement.com',
    phone: '+35679790202',
    address: 'Valletta, Malta',
  },
  map: {
    title: 'Visit Our Office',
    description: 'Located in the heart of Valletta, our office is easily accessible by car or public transport.',
    address: '123 Merchant Street, Valletta, Malta',
    latitude: 35.8989,
    longitude: 14.5146,
  },
  faq: {
    title: 'Common Questions',
    items: [
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
};

export const BLOG_CONTENT = {
  hero: {
    title: 'Property Insights',
    subtitle: 'Blog & News',
    description: 'Stay informed with the latest trends, market analysis, and expert insights from the Malta property market.',
  },
  title: 'Latest Articles',
  cta: {
    title: 'Stay Updated',
    description: 'Subscribe to our newsletter for weekly property market insights and management tips.',
    buttonText: 'Subscribe Now',
    buttonOnClick: () => console.log('Subscribe clicked'),
  },
};

export const PRICING_CONTENT = {
  hero: {
    title: 'Management Plans',
    subtitle: 'One fee. No surprises.',
    description: 'A single commission on net room revenue. All new properties launch with Superhost credibility from day one. Essentials covers core operations with transparent per-service fees. Complete includes everything — reporting, callouts, strategic reviews, and annual photography — with no additional charges. Choose the level of service that fits how you want to own.',
  },
  plans: [
    {
      name: 'Essentials',
      price: '15% of Net Room Revenue + VAT',
      description: 'Core operations. Your property listed, managed, and maintained — without the extras.',
      features: [
        'Multi-channel listing creation & management',
        'Superhost status from day one — inherit established credibility',
        'Smart seasonal pricing — rule-based optimisation',
        'Reviews & reputation management',
        'Guest communication & 24/7 concierge',
        'Check-in & check-out coordination',
        'Professional cleaning & laundry after every stay',
        'Maintenance coordination — at cost, no markup',
        'Payment collection & eco-tax compliance',
        'Damage claim management',
        'Monthly payout statements — €35 per report',
        'Callout fees — €20 + VAT per incident',
      ],
      buttonText: 'Get started',
    },
    {
      name: 'Complete',
      price: '18% of Net Room Revenue + VAT',
      description: 'Full-service management. The guest experience and owner visibility that drives better returns.',
      features: [
        'Everything in Essentials, plus',
        'Welcome amenities — wine, water, coffee, tea, toiletries & household essentials included as standard',
        'Guest property manual — reduces questions, improves stay quality',
        'Property assessment & readiness checklist at onboarding',
        'Monthly reporting included — saves €420/year',
        'All callout fees included — saves €240+/year',
        'Mail & utilities management included — saves €120/year',
        'Annual photography refresh included — saves ~€300/year',
        '€100 annual platform fee waived',
        'Quarterly performance reviews — rate strategy, competitive positioning, optimisation recommendations',
        'Priority operations guarantee — 24-hour owner response time',
        'Quarterly market & competitive analysis — occupancy trends, rate benchmarking, review sentiment',
        'Owner use coordination — when you want to use your property, we handle the logistics',
        'Owner dashboard — live bookings, revenue & communications',
        '24/7 owner support',
        'Dedicated direct booking webpage — your property, your guests, lower platform costs',
      ],
      popular: true,
      buttonText: 'Get started',
    },
  ],
  about: {
    title: 'Why Choose Our Pricing?',
    content: 'Our pricing is designed to provide maximum value while ensuring we can deliver institutional-grade service. No setup fees, no hidden costs, just transparent pricing that scales with your needs.',
    image: '/api/placeholder/600/400',
    imageAlt: 'Transparent pricing',
  },
  faq: {
    title: 'Pricing FAQ',
    items: [
      {
        question: 'Is there a setup fee?',
        answer: 'No, we don\'t charge any setup or onboarding fees. You only pay the monthly management fee.',
      },
      {
        question: 'Can I change plans?',
        answer: 'Yes, you can upgrade or downgrade your plan at any time with no penalties.',
      },
      {
        question: 'What\'s included in the price?',
        answer: 'All management fees include full property management services. Additional services like renovations are billed separately.',
      },
      {
        question: 'Do you offer discounts for multiple properties?',
        answer: 'Yes, we offer volume discounts for portfolios with 5+ properties. Contact us for a custom quote.',
      },
    ],
  },
  cta: {
    title: 'Ready to Get Started?',
    description: 'Begin with a free property assessment and see how professional management can transform your investment.',
    buttonText: 'Start Free Assessment',
    buttonOnClick: () => console.log('Assessment click'),
  },
};

export const PORTFOLIO_CONTENT = {
  hero: {
    title: 'Our Portfolio',
    subtitle: 'Managed Properties',
    description: 'Explore our curated collection of premium properties across Malta and Gozo.',
  },
  title: 'Featured Properties',
  about: {
    title: 'Property Management Excellence',
    content: 'Each property in our portfolio receives the same level of professional care and attention to detail. From luxury villas to premium apartments, we ensure every property performs at its highest potential.',
    image: '/api/placeholder/600/400',
    imageAlt: 'Property management excellence',
  },
  stats: [
    { value: '500+', label: 'Total Properties' },
    { value: '€50M+', label: 'Portfolio Value' },
    { value: '15+', label: 'Years Average' },
    { value: '98%', label: 'Occupancy Rate' },
  ],
};

export const CAREERS_CONTENT = {
  hero: {
    title: 'Join Our Team',
    subtitle: 'Careers',
    description: 'Be part of Malta\'s leading luxury property management firm. We\'re always looking for talented individuals to join our growing team.',
  },
  about: {
    title: 'Why Work With Us?',
    content: 'We offer competitive salaries, professional development opportunities, and the chance to work with premium properties in one of Europe\'s most beautiful locations.',
    image: '/api/placeholder/600/400',
    imageAlt: 'Our office environment',
  },
  benefits: {
    title: 'What We Offer',
    description: 'Comprehensive benefits and growth opportunities for our team members.',
    items: [
      {
        icon: '💰',
        title: 'Competitive Salary',
        description: 'Market-leading compensation with performance bonuses.',
      },
      {
        icon: '📚',
        title: 'Professional Development',
        description: 'Ongoing training and certification opportunities.',
      },
      {
        icon: '🏖️',
        title: 'Work-Life Balance',
        description: 'Flexible working arrangements and generous vacation time.',
      },
      {
        icon: '🌍',
        title: 'International Exposure',
        description: 'Work with clients from around the world in a multicultural environment.',
      },
    ],
  },
  openings: {
    title: 'Current Openings',
    items: [
      {
        name: 'Property Manager',
        role: 'Full-time',
        bio: 'Manage a portfolio of luxury residential properties. Requires 3+ years experience in property management.',
      },
      {
        name: 'Marketing Coordinator',
        role: 'Full-time',
        bio: 'Develop marketing strategies for property listings. Experience in digital marketing preferred.',
      },
      {
        name: 'Financial Analyst',
        role: 'Full-time',
        bio: 'Analyze property performance and financial metrics. Accounting background required.',
      },
    ],
  },
  cta: {
    title: 'Ready to Apply?',
    description: 'Send us your resume and cover letter. We\'re excited to hear from you!',
    buttonText: 'Apply Now',
    buttonOnClick: () => console.log('Apply click'),
  },
};
