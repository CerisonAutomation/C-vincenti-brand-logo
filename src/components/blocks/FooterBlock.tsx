import React from 'react';

interface FooterBlockProps {
  brandName: string;
  links: Array<{
    title: string;
    items: Array<{
      label: string;
      href: string;
    }>;
  }>;
  socialLinks?: Array<{
    icon: React.ReactNode;
    href: string;
    label: string;
  }>;
  copyright: string;
  className?: string;
}

export const FooterBlock: React.FC<FooterBlockProps> = ({
  brandName,
  links,
  socialLinks,
  copyright,
  className = '',
}) => {
  return (
    <footer className={`bg-secondary py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">{brandName}</h3>
            <p className="text-muted-foreground">
              Luxury property management for Malta's finest residences.
            </p>
          </div>
          {links.map((linkGroup, index) => (
            <div key={index}>
              <h4 className="font-semibold text-foreground mb-4">{linkGroup.title}</h4>
              <ul className="space-y-2">
                {linkGroup.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <a
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border">
          <p className="text-muted-foreground text-sm">{copyright}</p>
          {socialLinks && (
            <div className="flex space-x-4 mt-4 md:mt-0">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
