import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Mail, Phone, MapPin } from 'lucide-react';
import Layout from '@/components/Layout';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Valid email required').max(255),
  phone: z.string().regex(/^\+356\s?\d{4}\s?\d{4}$/, 'Valid Malta phone (+356 XXXX XXXX)').optional().or(z.literal('')),
  message: z.string().trim().min(1, 'Message is required').max(1000),
});

type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data: FormData) => {
    const webhookUrl = import.meta.env.VITE_LEAD_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, type: 'contact' }),
        });
        setSubmitted(true);
        return;
      } catch { /* fallback below */ }
    }
    const body = `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'N/A'}\n\n${data.message}`;
    window.location.href = `mailto:info@christianopm.com?subject=${encodeURIComponent('Contact Form')}&body=${encodeURIComponent(body)}`;
  };

  if (submitted) {
    return (
      <Layout>
        <section className="py-20 text-center">
          <div className="section-container">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-4">Message sent</h1>
            <p className="text-muted-foreground">We'll get back to you shortly.</p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div>
              <p className="micro-type text-primary mb-3">Get in Touch</p>
              <h1 className="font-serif text-3xl font-semibold text-foreground mb-4">
                Let's <span className="gold-text">talk</span>
              </h1>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                Whether you're an owner looking to maximise your property's potential or a guest with a question, we're here to help.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-primary" />
                  <a href="mailto:info@christianopm.com" className="text-sm text-foreground hover:text-primary transition-colors">
                    info@christianopm.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-primary" />
                  <a href="tel:+35679274688" className="text-sm text-foreground hover:text-primary transition-colors">
                    +356 7927 4688
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-sm text-muted-foreground">Malta &amp; Gozo</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Field label="Name" error={errors.name?.message}>
                <input {...register('name')} autoComplete="name" placeholder="Your name" className="form-input" />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <input {...register('email')} type="email" autoComplete="email" placeholder="you@email.com" className="form-input" />
              </Field>
              <Field label="Phone (optional)" error={errors.phone?.message}>
                <input {...register('phone')} type="tel" autoComplete="tel" placeholder="+356 7900 0000" className="form-input" />
              </Field>
              <Field label="Message" error={errors.message?.message}>
                <textarea {...register('message')} rows={4} placeholder="How can we help?" className="form-input resize-y" />
              </Field>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 text-sm font-semibold bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
