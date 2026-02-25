import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronRight, ChevronLeft, Home, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import { PremiumEstimateModal } from '@/components/PremiumEstimateModal';
import { MALTA_LOCALITIES, PROPERTY_TYPES, BEDROOM_OPTIONS } from '@/lib/malta-localities';

const schema = z.object({
  // Step 1 — Property
  locality: z.string().min(1, 'Select a locality'),
  propertyType: z.string().min(1, 'Select property type'),
  bedrooms: z.string().min(1, 'Select bedrooms'),
  bathrooms: z.string().min(1, 'Select bathrooms'),
  hasPool: z.boolean().optional(),
  hasTerrace: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  // Step 2 — Owner
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Valid email required').max(255),
  phone: z.string().regex(/^\+?[\d\s\-()]{7,20}$/, 'Valid phone number required'),
  // Step 3 — Goals
  currentStatus: z.string().min(1, 'Select current status'),
  targetRevenue: z.string().optional(),
  message: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof schema>;

const STEP_FIELDS: (keyof FormData)[][] = [
  ['locality', 'propertyType', 'bedrooms', 'bathrooms'],
  ['name', 'email', 'phone'],
  ['currentStatus'],
];

const CURRENT_STATUS_OPTIONS = [
  'Not yet renting — ready to start',
  'Currently self-managing',
  'With another agency — looking to switch',
  'Just bought / renovating',
  'Exploring options only',
];

const BATHROOM_OPTIONS = ['1', '2', '3', '4+'];

const STEPS = [
  { title: 'Your Property', subtitle: 'Tell us about the property', icon: Home },
  { title: 'Your Details', subtitle: 'How can we reach you?', icon: User },
  { title: 'Your Goals', subtitle: 'What are you looking to achieve?', icon: MessageSquare },
];

function FieldError({ msg }: { msg?: string | undefined }) {
  if (!msg) return null;
  return <p className="text-xs text-destructive mt-1">{msg}</p>;
}

export default function OwnersEstimate() {
  const [step, setStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      hasPool: false,
      hasTerrace: false,
      hasParking: false,
    },
  });

  const nextStep = async () => {
    const valid = await trigger(STEP_FIELDS[step] as readonly (keyof FormData)[]);
    if (valid) setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const onSubmit = async (data: FormData) => {
    const webhookUrl = import.meta.env.VITE_LEAD_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, source: 'owners-estimate' }),
        });
        setSubmitted(true);
        return;
      } catch { /* fallthrough to mailto */ }
    }
    openMailto(data);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Layout>
        <section className="py-24 text-center">
          <div className="section-container max-w-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
                <Check size={36} className="text-primary" />
              </div>
              <p className="micro-type text-primary mb-3">Received</p>
              <h1 className="font-serif text-3xl font-semibold text-foreground mb-4">Thank you</h1>
              <p className="text-muted-foreground leading-relaxed mb-8">
                We've received your property details and will prepare a personalised rental income estimate within <strong className="text-foreground">24 hours</strong>.
              </p>
              <a
                href="/owners"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Back to Owners Page
              </a>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16">
        <div className="section-container max-w-2xl">
          <p className="micro-type text-primary mb-3">Free Estimate</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-2">
            Assess your property's <span className="gold-text">potential</span>
          </h1>
          <p className="text-sm text-muted-foreground mb-10 leading-relaxed">
            Complete 3 quick steps and receive a personalised rental income projection within 24 hours.
          </p>

          {/* Progress */}
          <div className="flex items-center gap-0 mb-10">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className={`flex flex-col items-center relative ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
                    i < step ? 'bg-primary border-primary' : i === step ? 'border-primary bg-primary/10' : 'border-border bg-card'
                  }`}>
                    {i < step ? (
                      <Check size={16} className="text-primary-foreground" />
                    ) : (
                      <s.icon size={15} className={i === step ? 'text-primary' : 'text-muted-foreground'} />
                    )}
                  </div>
                  <span className={`text-[10px] mt-1.5 uppercase tracking-[0.12em] font-medium ${i === step ? 'text-primary' : 'text-muted-foreground'}`}>
                    {s.title}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px mx-3 mb-5" style={{ background: i < step ? 'hsl(var(--primary))' : 'hsl(var(--border))' }} />
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Premium Modal Trigger */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-gold-light text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <span>✨ Get Premium Estimate</span>
              </button>
              <p className="text-xs text-muted-foreground mt-2">Experience our luxury assessment service</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/30"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <span className="bg-background px-3">Or continue with standard form</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Locality</label>
                    <select {...register('locality')} className="form-input">
                      <option value="">Select locality...</option>
                      {MALTA_LOCALITIES.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                    <FieldError msg={errors.locality?.message} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Property type</label>
                      <select {...register('propertyType')} className="form-input">
                        <option value="">Select...</option>
                        {PROPERTY_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <FieldError msg={errors.propertyType?.message} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Bedrooms</label>
                      <select {...register('bedrooms')} className="form-input">
                        <option value="">Select...</option>
                        {BEDROOM_OPTIONS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                      <FieldError msg={errors.bedrooms?.message} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Bathrooms</label>
                    <div className="flex gap-2">
                      {BATHROOM_OPTIONS.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setValue('bathrooms', b, { shouldValidate: true })}
                          className={`flex-1 py-2.5 text-sm rounded border transition-colors ${
                            watch('bathrooms') === b
                              ? 'border-primary bg-primary/10 text-primary font-semibold'
                              : 'border-border text-muted-foreground hover:border-primary/50'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                    <FieldError msg={errors.bathrooms?.message} />
                  </div>

                  {/* Features toggle */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-2">Property features</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { field: 'hasPool' as const, label: '🏊 Pool' },
                        { field: 'hasTerrace' as const, label: '🌿 Terrace / Balcony' },
                        { field: 'hasParking' as const, label: '🚗 Parking' },
                      ].map(({ field, label }) => (
                        <button
                          key={field}
                          type="button"
                          onClick={() => setValue(field, !watch(field))}
                          className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                            watch(field)
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-muted-foreground hover:border-primary/40'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Full name</label>
                    <input
                      {...register('name')}
                      autoComplete="name"
                      placeholder="Your full name"
                      className="form-input"
                    />
                    <FieldError msg={errors.name?.message} />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email address</label>
                    <input
                      {...register('email')}
                      type="email"
                      autoComplete="email"
                      placeholder="you@email.com"
                      className="form-input"
                    />
                    <FieldError msg={errors.email?.message} />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Phone number</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+356</span>
                      <input
                        {...register('phone')}
                        type="tel"
                        autoComplete="tel"
                        placeholder="7900 0000"
                        className="form-input pl-14"
                        onFocus={(e) => {
                          if (!e.target.value) {
                            setValue('phone', '+356 ');
                          }
                        }}
                      />
                    </div>
                    <FieldError msg={errors.phone?.message} />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-2">Current situation</label>
                    <div className="space-y-2">
                      {CURRENT_STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setValue('currentStatus', opt, { shouldValidate: true })}
                          className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                            watch('currentStatus') === opt
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <FieldError msg={errors.currentStatus?.message} />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                      Monthly revenue target (optional)
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {['€500–1,000', '€1,000–2,000', '€2,000–4,000', '€4,000+', 'Not sure'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setValue('targetRevenue', r)}
                          className={`px-3 py-2 text-xs rounded border transition-colors ${
                            watch('targetRevenue') === r
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-muted-foreground hover:border-primary/40'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                      Anything else you'd like us to know? (optional)
                    </label>
                    <textarea
                      {...register('message')}
                      rows={3}
                      placeholder="Tell us about your property, timeline, or any questions..."
                      className="form-input resize-y"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nav buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/30">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
                >
                  <ChevronLeft size={15} /> Back
                </button>
              ) : <div />}

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Continue <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Get My Free Estimate'} <ChevronRight size={15} />
                </button>
              )}
            </div>
          </form>
            </div>

          <p className="text-[0.65rem] text-muted-foreground text-center leading-relaxed mt-6">
            By submitting, you agree to our{' '}
            <a href="/privacy" className="text-primary underline">Privacy Policy</a>.
            We never share your details with third parties.
          </p>
        </div>
      </section>

      <PremiumEstimateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Layout>
  );
}

function openMailto(data: FormData) {
  const body = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Locality: ${data.locality}`,
    `Type: ${data.propertyType}`,
    `Bedrooms: ${data.bedrooms}`,
    `Bathrooms: ${data.bathrooms}`,
    `Pool: ${data.hasPool ? 'Yes' : 'No'}`,
    `Terrace: ${data.hasTerrace ? 'Yes' : 'No'}`,
    `Parking: ${data.hasParking ? 'Yes' : 'No'}`,
    `Current Status: ${data.currentStatus}`,
    `Revenue Target: ${data.targetRevenue || 'N/A'}`,
    `Message: ${data.message || 'N/A'}`,
  ].join('\n');
  window.location.href = `mailto:info@christianopm.com?subject=${encodeURIComponent('Property Estimate Request')}&body=${encodeURIComponent(body)}`;
}
