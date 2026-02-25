import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
    .refine((val) => val.trim().length > 0, 'Message cannot be empty'),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void> | void;
  className?: string;
  title?: string;
  description?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  onSubmit,
  className = '',
  title = 'Get In Touch',
  description = 'Send us a message and we\'ll get back to you shortly.',
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const messageLength = watch('message')?.length || 0;

  const onSubmitHandler = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await onSubmit(data);
      setSubmitStatus('success');
      reset();
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      // Auto-hide error message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } },
  };

  const errorVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`max-w-2xl mx-auto ${className}`}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">{title}</h2>
        <p className="text-muted-foreground text-lg">{description}</p>
      </div>

      <motion.form
        onSubmit={handleSubmit(onSubmitHandler)}
        className="space-y-6 bg-card p-8 rounded-lg shadow-lg border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Success Message */}
        <AnimatePresence>
          {submitStatus === 'success' && (
            <motion.div
              variants={errorVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Message sent successfully! We'll get back to you soon.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {submitStatus === 'error' && (
            <motion.div
              variants={errorVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Failed to send message. Please try again or contact us directly.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name Field */}
        <motion.div
          variants={inputVariants}
          whileFocus="focus"
          className="space-y-2"
        >
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-foreground"
          >
            Name
          </label>
          <input
            {...register('name')}
            id="name"
            type="text"
            placeholder="Enter your full name"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
              errors.name
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-border focus:ring-primary focus:border-primary'
            }`}
            aria-describedby={errors.name ? 'name-error' : undefined}
            aria-invalid={!!errors.name}
          />
          <AnimatePresence>
            {errors.name && (
              <motion.p
                id="name-error"
                variants={errorVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-sm text-red-600 flex items-center gap-1"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.name.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Email Field */}
        <motion.div
          variants={inputVariants}
          whileFocus="focus"
          className="space-y-2"
        >
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-foreground"
          >
            Email
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            placeholder="Enter your email address"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
              errors.email
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-border focus:ring-primary focus:border-primary'
            }`}
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={!!errors.email}
          />
          <AnimatePresence>
            {errors.email && (
              <motion.p
                id="email-error"
                variants={errorVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-sm text-red-600 flex items-center gap-1"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Message Field */}
        <motion.div
          variants={inputVariants}
          whileFocus="focus"
          className="space-y-2"
        >
          <div className="flex justify-between items-center">
            <label
              htmlFor="message"
              className="block text-sm font-semibold text-foreground"
            >
              Message
            </label>
            <span className={`text-xs ${messageLength < 10 ? 'text-red-500' : messageLength > 800 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
              {messageLength}/1000
            </span>
          </div>
          <textarea
            {...register('message')}
            id="message"
            rows={6}
            placeholder="Tell us how we can help you..."
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
              errors.message
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-border focus:ring-primary focus:border-primary'
            }`}
            aria-describedby={errors.message ? 'message-error' : 'message-help'}
            aria-invalid={!!errors.message}
          />
          <div className="text-xs text-muted-foreground" id="message-help">
            Please provide details about your inquiry or property needs.
          </div>
          <AnimatePresence>
            {errors.message && (
              <motion.p
                id="message-error"
                variants={errorVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-sm text-red-600 flex items-center gap-1"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.message.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting || !isValid || !isDirty}
          className={`w-full py-4 px-6 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 ${
            isSubmitting || !isValid || !isDirty
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary shadow-lg hover:shadow-xl'
          }`}
          whileHover={!isSubmitting && isValid && isDirty ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting && isValid && isDirty ? { scale: 0.98 } : {}}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending Message...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Send Message
            </>
          )}
        </motion.button>

        {/* Form Status */}
        <div className="text-center text-sm text-muted-foreground">
          {!isDirty && 'Fill out the form to get started'}
          {isDirty && !isValid && 'Please correct the errors above'}
          {isValid && isDirty && !isSubmitting && 'Ready to send!'}
        </div>
      </motion.form>
    </motion.div>
  );
};
