import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Loader2, Tag, AlertCircle, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { useCreateQuote, useUpdateCoupon, useCreateInstantReservation, useCreateInquiry } from '@/lib/guesty';
import type { Quote, Listing } from '@/lib/guesty/types';
import { formatCurrency } from '@/lib/content';
import { guestyClient } from '@/lib/guesty/client';
import { z } from 'zod';

const guestSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  email: z.string().trim().email('Valid email required').max(255),
  phone: z.string().trim().min(6, 'Phone number required').max(20),
  message: z.string().max(500).optional(),
});

type GuestData = z.infer<typeof guestSchema>;

interface BookingFlowProps {
  listing: Listing;
  checkIn: string;
  checkOut: string;
  guests: number;
  onClose: () => void;
}

type Step = 'quote' | 'details' | 'confirm' | 'success';

export default function BookingFlow({ listing, checkIn, checkOut, guests, onClose }: BookingFlowProps) {
  const [step, setStep] = useState<Step>('quote');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [guestData, setGuestData] = useState<GuestData>({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof GuestData, string>>>({});
  const [confirmationCode, setConfirmationCode] = useState('');
  const [globalError, setGlobalError] = useState('');

  const createQuote = useCreateQuote();
  const updateCoupon = useUpdateCoupon();
  const createReservation = useCreateInstantReservation();
  const createInquiry = useCreateInquiry();

  const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));

  // Step 1: Get quote
  const handleGetQuote = async () => {
    setGlobalError('');
    try {
      const q = await createQuote.mutateAsync({
        listingId: listing._id,
        checkInDateLocalized: checkIn,
        checkOutDateLocalized: checkOut,
        guestsCount: guests,
      });
      setQuote(q);
      setStep('details');
    } catch (err: unknown) {
      setGlobalError(err instanceof Error && 'error_code' in err ? guestyClient.formatError(err as any) : 'Failed to get pricing. Please try different dates.');
    }
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!quote || !couponCode.trim()) return;
    setCouponError('');
    try {
      const updated = await updateCoupon.mutateAsync({ quoteId: quote._id, coupon: couponCode.trim() });
      setQuote(updated);
    } catch (err: unknown) {
      setCouponError(err instanceof Error && 'error_code' in err ? guestyClient.formatError(err as any) : 'Invalid promo code');
    }
  };

  // Validate guest form
  const validateGuest = (): boolean => {
    const result = guestSchema.safeParse(guestData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof GuestData, string>> = {};
      result.error.errors.forEach(e => {
        const field = e.path[0] as keyof GuestData;
        fieldErrors[field] = e.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  // Step 3: Confirm & book
  const handleBook = async () => {
    if (!validateGuest()) return;
    if (!quote) return;
    setGlobalError('');

    try {
      const res = await createReservation.mutateAsync({
        quoteId: quote._id,
        guestData: {
          firstName: guestData.firstName.trim(),
          lastName: guestData.lastName.trim(),
          email: guestData.email.trim(),
          phone: guestData.phone.trim(),
          message: guestData.message?.trim(),
        },
      });
      setConfirmationCode(res.confirmationCode || res._id);
      setStep('success');
    } catch (err: unknown) {
      // Fallback to inquiry if instant booking fails
      try {
        const res = await createInquiry.mutateAsync({
          quoteId: '',
          guestData: {
            guest: {
              firstName: guestData.firstName.trim(),
              lastName: guestData.lastName.trim(),
              email: guestData.email.trim(),
              phone: guestData.phone.trim(),
            },
          },
        });
        setConfirmationCode(res.confirmationCode || res._id);
        setStep('success');
      } catch (inquiryErr: unknown) {
        setGlobalError(inquiryErr instanceof Error && 'error_code' in inquiryErr ? guestyClient.formatError(inquiryErr as any) : 'Booking failed. Please try again or contact us.');
      }
    }
  };

  const isLoading = createQuote.isPending || createReservation.isPending || createInquiry.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/90 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full h-full sm:h-auto sm:max-h-[90vh] max-w-lg sm:max-w-xl md:max-w-2xl bg-card border-0 sm:border border-border rounded-none sm:rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border/50 bg-card">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">
              {step === 'quote' && 'Step 1 — Pricing'}
              {step === 'details' && 'Step 2 — Your Details'}
              {step === 'confirm' && 'Step 3 — Confirm'}
              {step === 'success' && 'Booking Confirmed'}
            </p>
            <h2 className="font-serif text-lg font-semibold text-foreground mt-0.5">{listing.title}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Enhanced Progress Indicator */}
        {step !== 'success' && (
          <div className="px-5 pt-6 pb-2">
            <div className="flex items-center justify-between relative">
              {/* Progress line background */}
              <div className="absolute top-5 left-6 right-6 h-0.5 bg-border/50 rounded-full" />

              {/* Active progress line */}
              <motion.div
                className="absolute top-5 left-6 h-0.5 bg-gradient-to-r from-primary via-primary to-primary/60 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${((['quote', 'details', 'confirm'].indexOf(step) + 1) / 3) * 100}%`
                }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />

              {/* Steps */}
              {[
                { key: 'quote', label: 'Pricing', icon: Tag, description: 'Get exact price' },
                { key: 'details', label: 'Details', icon: User, description: 'Your information' },
                { key: 'confirm', label: 'Confirm', icon: CreditCard, description: 'Review & book' }
              ].map((stepConfig, index) => {
                const isCompleted = index < ['quote', 'details', 'confirm'].indexOf(step);
                const isCurrent = stepConfig.key === step;

                return (
                  <motion.div
                    key={stepConfig.key}
                    className="flex flex-col items-center relative z-10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    {/* Step circle */}
                    <motion.div
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center relative ${
                        isCompleted
                          ? 'bg-primary border-primary text-primary-foreground'
                          : isCurrent
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground'
                      }`}
                      animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 2, repeat: isCurrent ? Infinity : 0 }}
                    >
                      {isCompleted ? (
                        <Check size={20} />
                      ) : (
                        <stepConfig.icon size={20} />
                      )}

                      {/* Pulse effect for current step */}
                      {isCurrent && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-primary"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>

                    {/* Step label */}
                    <motion.div
                      className="mt-3 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <div className={`text-xs font-semibold uppercase tracking-wider ${
                        isCompleted || isCurrent ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {stepConfig.label}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${
                        isCurrent ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {stepConfig.description}
                      </div>
                    </motion.div>

                    {/* Step number badge */}
                    <motion.div
                      className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        isCompleted
                          ? 'bg-primary text-primary-foreground'
                          : isCurrent
                            ? 'bg-primary/20 text-primary border border-primary'
                            : 'bg-muted text-muted-foreground'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
                    >
                      {index + 1}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-5 space-y-5">
          {/* Stay summary (always shown) */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{new Date(checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} → {new Date(checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span>·</span>
            <span>{nights} night{nights !== 1 ? 's' : ''}</span>
            <span>·</span>
            <span>{guests} guest{guests !== 1 ? 's' : ''}</span>
          </div>

          {/* Global error */}
          {globalError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{globalError}</p>
            </div>
          )}

          {/* ── STEP: Quote ── */}
          {step === 'quote' && (
            <>
              <div className="satin-surface rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{formatCurrency(listing.pricing.basePrice)} × {nights} nights</span>
                  <span className="text-foreground">{formatCurrency(listing.pricing.basePrice * nights)}</span>
                </div>
                {listing.pricing.cleaningFee && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cleaning fee</span>
                    <span className="text-foreground">{formatCurrency(listing.pricing.cleaningFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border/30">
                  <span className="text-foreground">Estimated total</span>
                  <span className="text-primary">{formatCurrency(listing.pricing.basePrice * nights + (listing.pricing.cleaningFee || 0))}</span>
                </div>
              </div>

              <button
                onClick={handleGetQuote}
                disabled={isLoading}
                className="w-full py-3.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <><Loader2 size={16} className="animate-spin" /> Getting exact price...</> : <>Get Exact Price <ChevronRight size={16} /></>}
              </button>
            </>
          )}

          {/* ── STEP: Details ── */}
          {step === 'details' && quote && (
            <>
              {/* Price breakdown from quote */}
              <div className="satin-surface rounded-xl p-4 space-y-2">
                {Object.entries(quote.priceBreakdown).map(([key, value], i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-foreground">{formatCurrency(value)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border/30">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">{formatCurrency(quote.priceBreakdown.total)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder="Promo code"
                    className="form-input pl-9 text-xs"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  disabled={updateCoupon.isPending || !couponCode.trim()}
                  className="px-4 py-2 border border-primary text-primary text-xs font-semibold rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
                >
                  {updateCoupon.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                </button>
              </div>
              {couponError && <p className="text-xs text-destructive">{couponError}</p>}

              {/* Guest form */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1">First Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={guestData.firstName}
                        onChange={e => setGuestData(d => ({ ...d, firstName: e.target.value }))}
                        className="form-input pl-9 text-xs"
                        placeholder="John"
                      />
                    </div>
                    {errors.firstName && <p className="text-xs text-destructive mt-0.5">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1">Last Name</label>
                    <input
                      type="text"
                      value={guestData.lastName}
                      onChange={e => setGuestData(d => ({ ...d, lastName: e.target.value }))}
                      className="form-input text-xs"
                      placeholder="Doe"
                    />
                    {errors.lastName && <p className="text-xs text-destructive mt-0.5">{errors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1">Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={guestData.email}
                      onChange={e => setGuestData(d => ({ ...d, email: e.target.value }))}
                      className="form-input pl-9 text-xs"
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive mt-0.5">{errors.email}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1">Phone</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="tel"
                      value={guestData.phone}
                      onChange={e => setGuestData(d => ({ ...d, phone: e.target.value }))}
                      className="form-input pl-9 text-xs"
                      placeholder="+356 1234 5678"
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-destructive mt-0.5">{errors.phone}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1">Message (optional)</label>
                  <div className="relative">
                    <MessageSquare size={14} className="absolute left-3 top-3 text-muted-foreground" />
                    <textarea
                      value={guestData.message}
                      onChange={e => setGuestData(d => ({ ...d, message: e.target.value }))}
                      className="form-input pl-9 text-xs min-h-[70px] resize-none"
                      placeholder="Any special requests..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('quote')}
                  className="flex-1 py-3 border border-border text-sm text-muted-foreground rounded-lg hover:text-foreground hover:border-foreground/30 transition-colors flex items-center justify-center gap-1"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={() => {
                    if (validateGuest()) setStep('confirm');
                  }}
                  className="flex-[2] py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
                >
                  Review & Confirm <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}

          {/* ── STEP: Confirm ── */}
          {step === 'confirm' && quote && (
            <>
              <div className="satin-surface rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Booking Summary</h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property</span>
                    <span className="text-foreground font-medium">{listing.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guest</span>
                    <span className="text-foreground">{guestData.firstName} {guestData.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="text-foreground">{guestData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dates</span>
                    <span className="text-foreground">{new Date(checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {new Date(checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="text-foreground">{guests}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border/30">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary text-lg">{formatCurrency(quote.totalPrice)}</span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                By confirming, you agree to the property's cancellation policy and house rules.
                A confirmation email will be sent to {guestData.email}.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('details')}
                  className="flex-1 py-3 border border-border text-sm text-muted-foreground rounded-lg hover:text-foreground transition-colors flex items-center justify-center gap-1"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={handleBook}
                  disabled={isLoading}
                  className="flex-[2] py-3.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <>Confirm Booking <Check size={16} /></>}
                </button>
              </div>
            </>
          )}

          {/* ── STEP: Success ── */}
          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
                <Check size={28} className="text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-semibold text-foreground mb-1">Booking Confirmed!</h3>
                <p className="text-sm text-muted-foreground">Your reservation has been submitted.</p>
              </div>
              {confirmationCode && (
                <div className="satin-surface rounded-lg p-3 inline-block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-0.5">Confirmation Code</p>
                  <p className="text-lg font-mono font-semibold text-primary">{confirmationCode}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                A confirmation email has been sent to <strong className="text-foreground">{guestData.email}</strong>.
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
