import React from 'react';

interface NewsletterSignupProps {
  onSubscribe: (email: string) => void;
  className?: string;
  placeholder?: string;
  buttonText?: string;
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  onSubscribe,
  className = '',
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
}) => {
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubscribe(email);
      setEmail('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        required
        disabled={isSubmitting}
      />
      <button
        type="submit"
        disabled={isSubmitting || !email.trim()}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Subscribing...' : buttonText}
      </button>
    </form>
  );
};
