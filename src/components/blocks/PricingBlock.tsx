import React from 'react';

interface PricingBlockProps {
  title?: string;
  plans: Array<{
    name: string;
    price: string;
    description: string;
    features: string[];
    popular?: boolean;
    buttonText: string;
    buttonOnClick: () => void;
  }>;
  className?: string;
}

export const PricingBlock: React.FC<PricingBlockProps> = ({
  title = 'Pricing Plans',
  plans,
  className = '',
}) => {
  const gridCols = plans.length === 1 ? 'max-w-md mx-auto' : plans.length === 2 ? 'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 max-w-4xl' : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <section className={`py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 ${className}`} aria-labelledby="pricing-title">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 id="pricing-title" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground text-center mb-8 sm:mb-10 lg:mb-12 xl:mb-16">
            {title}
          </h2>
        )}
        <div className={`grid gap-6 sm:gap-8 ${gridCols} mx-auto`} role="list">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-card p-6 sm:p-8 lg:p-10 rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md ${
                plan.popular
                  ? 'border-primary ring-2 ring-primary/20 relative'
                  : 'border-border'
              }`}
              role="listitem"
              aria-labelledby={`plan-name-${index}`}
              aria-describedby={`plan-description-${index}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2" aria-label="Most popular plan">
                  <div className="text-xs font-semibold text-primary bg-primary px-3 py-1 rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                </div>
              )}
              <div className={plan.popular ? 'pt-4' : ''}>
                <h3 id={`plan-name-${index}`} className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-4 sm:mb-6" aria-label={`Price: ${plan.price}`}>{plan.price}</div>
                <p id={`plan-description-${index}`} className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">{plan.description}</p>
                <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10" role="list" aria-label="Plan features">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start" role="listitem">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0" aria-hidden="true"></span>
                      <span className="text-sm sm:text-base leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={plan.buttonOnClick}
                  className={`w-full py-3 sm:py-4 px-6 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                  aria-label={`Select ${plan.name} plan`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
