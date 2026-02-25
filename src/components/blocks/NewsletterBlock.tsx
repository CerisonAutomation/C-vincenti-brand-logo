import React from 'react';

interface NewsletterBlockProps {
  title: string;
  description: string;
  placeholder: string;
  buttonText: string;
  onSubscribe: (email: string) => void;
  className?: string;
}

export const NewsletterBlock: React.FC<NewsletterBlockProps> = ({
  title,
  description,
  placeholder,
  buttonText,
  onSubscribe,
  className = '',
}) => {
  const [email, setEmail] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onSubscribe(email);
      setEmail('');
    }
  };

  return (
    <section className={`py-20 bg-primary ${className}`}>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
          {title}
        </h2>
        <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-8">
          {description}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            required
            className="flex-1 px-4 py-3 rounded-lg text-foreground"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-primary-foreground text-primary font-semibold rounded-lg hover:bg-primary-foreground/90 transition-colors"
          >
            {buttonText}
          </button>
        </form>
      </div>
    </section>
  );
};
