import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Mail, Phone } from 'lucide-react';
import Layout from '@/components/Layout';
import { BRAND_FULL, BRAND_EMAIL, BRAND_PHONE } from '@/lib/brand';

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get('reservationId') || '';
  const confirmationCode = searchParams.get('confirmationCode') || '';

  return (
    <Layout>
      <div className="section-container py-16 max-w-2xl text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-primary" />
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-3">
          Booking confirmed
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Thank you for choosing {BRAND_FULL}. Your reservation has been confirmed and a confirmation email has been sent.
        </p>

        {(confirmationCode || reservationId) && (
          <div className="satin-surface rounded-2xl p-6 mb-8 satin-glow text-left">
            <h2 className="font-serif text-lg font-semibold text-foreground mb-4">Reservation details</h2>
            <div className="space-y-3 text-sm">
              {confirmationCode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confirmation code</span>
                  <span className="text-foreground font-semibold font-mono text-primary">{confirmationCode}</span>
                </div>
              )}
              {reservationId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="text-foreground font-mono text-xs">{reservationId}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="satin-surface rounded-2xl p-6 mb-8 text-left">
          <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">What's next?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Check your email for the full confirmation with check-in instructions</li>
            <li>✓ You'll receive property access details 24 hours before check-in</li>
            <li>✓ Our team is available for any questions before and during your stay</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            View more stays <ArrowRight size={16} />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground rounded-full font-semibold text-sm hover:bg-accent transition-colors"
          >
            Contact support
          </Link>
        </div>

        <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-muted-foreground">
          <a href={`mailto:${BRAND_EMAIL}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Mail size={13} /> {BRAND_EMAIL}
          </a>
          <a href={`tel:${BRAND_PHONE.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Phone size={13} /> {BRAND_PHONE}
          </a>
        </div>
      </div>
    </Layout>
  );
}
