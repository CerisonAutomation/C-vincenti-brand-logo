import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { PageTemplate, BlockType } from './PageTemplate';

interface PricingPageTemplateProps {
  onPlanSelect: (planName: string) => void;
  className?: string;
}

export const PricingPageTemplate: React.FC<PricingPageTemplateProps> = ({
  onPlanSelect,
  className = '',
}) => {
  const { data: pricingPlans, isLoading, error } = useQuery<Database['public']['Tables']['cms_pricing_plans']['Row'][]>({
    queryKey: ['pricing-plans'],
    queryFn: async (): Promise<Database['public']['Tables']['cms_pricing_plans']['Row'][]> => {
      const { data, error } = await supabase
        .from('cms_pricing_plans')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data as Database['public']['Tables']['cms_pricing_plans']['Row'][]) || [];
    },
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Christiano Property Management",
    "url": "https://www.christianopropertymanagement.com",
    "email": "info@christianopropertymanagement.com",
    "telephone": "+35679790202",
    "description": "Luxury short-term rental and property management in Malta. Specialising in Airbnb, Booking.com and direct booking management for residential and holiday properties.",
    "areaServed": {
      "@type": "Country",
      "name": "Malta"
    },
    "priceRange": "15%–18% of Net Room Revenue",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Property Management Plans",
      "itemListElement": pricingPlans?.map(plan => ({
        "@type": "Offer",
        "name": plan.name,
        "description": plan.description,
        "price": plan.price.includes('%') ? plan.price.split('%')[0] : plan.price,
        "priceCurrency": plan.price.includes('%') ? "PERCENT" : "EUR",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": plan.price.includes('%') ? plan.price.split('%')[0] : plan.price.replace('€', ''),
          "unitText": plan.price.includes('%') ? "% of Net Room Revenue" : "EUR"
        }
      })) || []
    },
    "sameAs": [
      "https://www.airbnb.com",
      "https://www.booking.com"
    ]
  };

  const blocks: BlockType[] = [
    {
      type: 'hero' as const,
      props: {
        title: 'Management Plans',
        subtitle: 'One fee. No surprises.',
        description: 'A single commission on net room revenue. All new properties launch with Superhost credibility from day one. Essentials covers core operations with transparent per-service fees. Complete includes everything — reporting, callouts, strategic reviews, and annual photography — with no additional charges. Choose the level of service that fits how you want to own.',
      },
    },
    ...(pricingPlans ? [{
      type: 'pricing' as const,
      props: {
        plans: pricingPlans.map(plan => ({
          name: plan.name,
          price: plan.price,
          description: plan.description,
          features: plan.features,
          popular: plan.popular,
          buttonText: 'Get started',
          buttonOnClick: () => onPlanSelect(plan.name),
        })),
      },
    }] : []),
    {
      type: 'content' as const,
      props: {
        title: 'Why Choose Our Pricing?',
        content: 'Our pricing is designed to provide maximum value while ensuring we can deliver institutional-grade service. No setup fees, no hidden costs, just transparent pricing that scales with your needs.',
        reverse: true,
        image: '/api/placeholder/600/400',
        imageAlt: 'Transparent pricing',
      },
    },
    {
      type: 'faq' as const,
      props: {
        title: 'Pricing FAQ',
        faqs: [
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
    },
    {
      type: 'cta' as const,
      props: {
        title: 'Ready to Get Started?',
        description: 'Begin with a free property assessment and see how professional management can transform your investment.',
        buttonText: 'Start Free Assessment',
        buttonOnClick: () => onPlanSelect('assessment'),
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Pricing</h1>
          <p className="text-muted-foreground">Unable to load pricing information. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Pricing Plans | Christiano Property Management</title>
        <meta
          name="description"
          content="Transparent property management pricing in Malta. Two plans — Essentials at 15% and Complete at 18% of Net Room Revenue. No setup fees, no hidden markups. Luxury short-term rental management for Airbnb, Booking.com & direct bookings."
        />
        <meta property="og:title" content="Pricing Plans | Christiano Property Management" />
        <meta property="og:description" content="Transparent property management pricing in Malta. Two plans — Essentials at 15% and Complete at 18% of Net Room Revenue. No setup fees, no hidden markups." />
        <meta property="og:url" content="https://www.christianopropertymanagement.com/pricing-plans" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.christianopropertymanagement.com/pricing-plans" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <PageTemplate blocks={blocks} className={className} />

      {/* Extras Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-12">Available on both plans — charged separately</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <h4 className="font-semibold mb-2">Professional photoshoot</h4>
              <p className="text-sm text-muted-foreground">On quotation. Recommended before going live. (Annual refresh included in Complete)</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-2">Annual deep clean</h4>
              <p className="text-sm text-muted-foreground">On quotation. Scheduled once per year.</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-2">MTA licensing</h4>
              <p className="text-sm text-muted-foreground">€150 one-time fee + associated authority fees.</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-2">Procurement & setup works</h4>
              <p className="text-sm text-muted-foreground">€25/hr + VAT. Furniture, fixtures, pre-launch preparation.</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-2">Mail & bills handling</h4>
              <p className="text-sm text-muted-foreground">€10/month. Included in Complete, charged separately in Essentials.</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-2">Interior design</h4>
              <p className="text-sm text-muted-foreground">On quotation. Spatial and aesthetic upgrades.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footnote */}
      <section className="py-12 bg-secondary/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            Net Room Revenue is calculated on gross rental income, excluding platform commissions, VAT, cleaning fees, damage deposits, and optional extras.
          </p>
        </div>
      </section>
    </>
  );
};
