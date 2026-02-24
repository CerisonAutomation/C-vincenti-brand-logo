import { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Loader2, AlertCircle, Check } from 'lucide-react';
import { z } from 'zod';
import Layout from '@/components/Layout';
import { guestyClient } from '@/lib/guesty/client';
import { useListing, useCreateQuote, usePaymentProvider } from '@/lib/guesty/hooks';
import { normalizeListingDetail } from '@/lib/guesty/normalizer';
import { formatCurrency } from '@/lib/content';
import { BRAND_FULL } from '@/lib/brand';
import { Skeleton } from '@/components/ui/skeleton';

const guestSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Valid email required').max(255),
  phone: z.string().trim().min(5, 'Phone is required').max(30),
  specialRequests: z.string().max(1000).optional(),
});

type GuestFormData = z.infer<typeof guestSchema>;

export default function Checkout() {
  const { listingId } = useParams<{ listingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = parseInt(searchParams.get('guests') || '2') || 2;

  const { data: rawListing, isLoading: listingLoading } = useListing(listingId);
  const { data: paymentProvider } = usePaymentProvider(listingId);
  const quoteMutation = useCreateQuote();

  const property = useMemo(() => rawListing ? normalizeListingDetail(rawListing) : null, [rawListing]);

  const [form, setForm] = useState<GuestFormData>({
    firstName: '', lastName: '', email: '', phone: '', specialRequests: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof GuestFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [quoteData, setQuoteData] = useState<any>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  // Create quote on mount
  useEffect(() => {
    if (!listingId || !checkIn || !checkOut) return;
    setQuoteLoading(true);
    setQuoteError('');

    guestyClient.createQuote({
      listingId,
      checkInDateLocalized: checkIn,
      checkOutDateLocalized: checkOut,
      guestsCount: guests,
    })
      .then(q => { setQuoteData(q); setQuoteLoading(false); })
      .catch(err => {
        const msg = err?.error_code ? guestyClient.formatError(err) : 'Could not create quote. Please try again.';
        setQuoteError(msg);
        setQuoteLoading(false);
      });
  }, [listingId, checkIn, checkOut, guests]);

  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (86400000))
    : 0;

  function updateField(field: keyof GuestFormData, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  }

  async function applyCoupon() {
    if (!quoteData?._id || !coupon.trim()) return;
    try {
      const updated = await guestyClient.updateCouponInQuote(quoteData._id, coupon.trim());
      setQuoteData(updated);
      setCouponApplied(true);
    } catch {
      setErrors(e => ({ ...e, specialRequests: 'Invalid or expired promo code' }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');

    const result = guestSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!quoteData?._id) {
      setSubmitError('No quote available. Please go back and try again.');
      return;
    }

    setSubmitting(true);
    try {
      // TODO: Replace with real payment token from GuestyPay / Stripe
      // Per Guesty docs: API supports Stripe SCA tokens (pm_...) only
      const paymentToken = `demo_token_${Date.now()}`;

      const reservation = await guestyClient.createInstantReservation(quoteData._id, {
        guest: {
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          email: result.data.email,
          phone: result.data.phone,
        },
        payment: {
          token: paymentToken,
        },
      });

      // Navigate to success
      navigate(`/booking/success?reservationId=${reservation._id}&confirmationCode=${reservation.confirmationCode || ''}`);
    } catch (err: any) {
      const msg = err?.error_code ? guestyClient.formatError(err) : 'Booking failed. Please try again or contact us.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (!checkIn || !checkOut || !listingId) {
    return (
      <Layout>
        <div className="section-container py-20 text-center">
          <h1 className="font-serif text-2xl text-foreground mb-2">Missing booking details</h1>
          <p className="text-sm text-muted-foreground mb-6">Please select dates and guests from a property page.</p>
          <Link to="/properties" className="text-primary hover:underline text-sm">Browse Properties</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section-container py-8 max-w-5xl">
        <Link
          to={`/properties/${listingId}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to property
        </Link>

        <h1 className="font-serif text-3xl font-semibold text-foreground mb-8">Complete your booking</h1>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Left: Guest form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
            <div className="satin-surface rounded-2xl p-6 space-y-5">
              <h2 className="font-serif text-lg font-semibold text-foreground">Guest details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1">First name</label>
                  <input
                    value={form.firstName} onChange={e => updateField('firstName', e.target.value)}
                    className={`form-input text-sm ${errors.firstName ? 'border-destructive' : ''}`}
                    placeholder="John"
                  />
                  {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1">Last name</label>
                  <input
                    value={form.lastName} onChange={e => updateField('lastName', e.target.value)}
                    className={`form-input text-sm ${errors.lastName ? 'border-destructive' : ''}`}
                    placeholder="Doe"
                  />
                  {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1">Email</label>
                <input
                  type="email" value={form.email} onChange={e => updateField('email', e.target.value)}
                  className={`form-input text-sm ${errors.email ? 'border-destructive' : ''}`}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1">Phone</label>
                <input
                  type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)}
                  className={`form-input text-sm ${errors.phone ? 'border-destructive' : ''}`}
                  placeholder="+356 7927 4688"
                />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-1">Special requests (optional)</label>
                <textarea
                  value={form.specialRequests || ''} onChange={e => updateField('specialRequests', e.target.value)}
                  className="form-input text-sm resize-none h-20"
                  placeholder="Late check-in, extra towels, etc."
                />
              </div>
            </div>

            {/* Promo code */}
            <div className="satin-surface rounded-2xl p-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Promo code</h3>
              <div className="flex gap-2">
                <input
                  value={coupon} onChange={e => setCoupon(e.target.value)}
                  className="form-input text-sm flex-1"
                  placeholder="Enter code"
                  disabled={couponApplied}
                />
                <button
                  type="button" onClick={applyCoupon}
                  disabled={couponApplied || !coupon.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                >
                  {couponApplied ? <Check size={14} /> : 'Apply'}
                </button>
              </div>
            </div>

            {/* Payment note */}
            <div className="satin-surface rounded-2xl p-6">
              <h2 className="font-serif text-lg font-semibold text-foreground mb-3">Payment</h2>
              <p className="text-sm text-muted-foreground">
                Payment will be processed securely through our payment provider. Your card will not be charged until the booking is confirmed.
              </p>
              {/* TODO: Integrate GuestyPay / Stripe Elements here */}
              <div className="mt-4 p-4 border border-border/50 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground">
                  <Shield size={12} className="inline mr-1 text-primary" />
                  Payment integration pending — demo mode active. In production, a Stripe or GuestyPay form will appear here.
                </p>
              </div>
            </div>

            {submitError && (
              <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
                <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">{submitError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || quoteLoading || !!quoteError}
              className="w-full py-4 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Processing...</>
              ) : (
                <>Confirm & book · {quoteData?.totalPrice ? formatCurrency(quoteData.totalPrice) : 'Loading...'}</>
              )}
            </button>

            <p className="text-[10px] text-muted-foreground text-center">
              By confirming, you agree to the house rules, cancellation policy, and our terms of service.
            </p>
          </form>

          {/* Right: Order summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <div className="satin-surface rounded-2xl p-6 satin-glow">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Booking summary</h3>

                {/* Property preview */}
                {listingLoading ? (
                  <Skeleton className="aspect-video rounded-xl mb-4" />
                ) : property ? (
                  <div className="mb-4">
                    <div className="aspect-video rounded-xl overflow-hidden mb-3">
                      <img src={property.heroImage} alt={property.title} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-serif text-sm font-semibold text-foreground">{property.title}</h4>
                    <p className="text-xs text-muted-foreground">{property.city}, {property.country}</p>
                  </div>
                ) : null}

                {/* Dates & guests */}
                <div className="space-y-2 text-xs border-t border-border/30 pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in</span>
                    <span className="text-foreground font-medium">{new Date(checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out</span>
                    <span className="text-foreground font-medium">{new Date(checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nights</span>
                    <span className="text-foreground font-medium">{nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="text-foreground font-medium">{guests}</span>
                  </div>
                </div>

                {/* Quote breakdown */}
                {quoteLoading && (
                  <div className="mt-4 pt-4 border-t border-border/30 space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                )}

                {quoteError && (
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <p className="text-xs text-destructive">{quoteError}</p>
                  </div>
                )}

                {quoteData && !quoteLoading && (
                  <div className="mt-4 pt-4 border-t border-border/30 space-y-2 text-xs">
                    {quoteData.priceBreakdown?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-muted-foreground">{item.description || item.type}</span>
                        <span className="text-foreground">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                    {couponApplied && (
                      <div className="flex justify-between text-primary">
                        <span>Promo discount</span>
                        <span>Applied ✓</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-foreground text-sm pt-2 border-t border-border/30">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(quoteData.totalPrice)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{quoteData.currency || 'EUR'}</p>
                  </div>
                )}
              </div>

              <div className="text-center text-[10px] text-muted-foreground/60 space-y-1">
                <p className="flex items-center justify-center gap-1"><Shield size={10} /> Secure booking</p>
                <p>Managed by {BRAND_FULL}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
