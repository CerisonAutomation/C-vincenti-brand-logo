import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { openCookieSettings } from "./CookieConsentBanner";
import { Mail, Phone, MapPin } from "lucide-react";
import { BRAND_FULL, BRAND_EMAIL, BRAND_PHONE, BRAND_LOCATION } from '@/lib/brand';

const LINKS = {
  guests: [
    { label: "Properties", href: "/properties" },
    { label: "Book Direct", href: "/book" },
    { label: "Residential", href: "/residential" },
    { label: "FAQ", href: "/faq" },
  ],
  owners: [
    { label: "How It Works", href: "/owners" },
    { label: "Pricing", href: "/owners/pricing" },
    { label: "Free Estimate", href: "/owners/estimate" },
    { label: "Our Standards", href: "/owners/standards" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="section-container py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2 md:col-span-2">
            <Link to="/"><Logo size="sm" /></Link>
            <p className="text-sm text-muted-foreground mt-4 max-w-xs leading-relaxed">
              Full-service short-let management across Malta & Gozo. MTA licensed operator.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <a href={`mailto:${BRAND_EMAIL}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Mail size={13} /> {BRAND_EMAIL}
              </a>
              <a href={`tel:${BRAND_PHONE.replace(/\s/g, '')}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Phone size={13} /> {BRAND_PHONE}
              </a>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin size={13} /> {BRAND_LOCATION}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground mb-4">Guests</h4>
            <ul className="flex flex-col gap-2.5">
              {LINKS.guests.map((l) => (
                <li key={l.href}><Link to={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground mb-4">Owners</h4>
            <ul className="flex flex-col gap-2.5">
              {LINKS.owners.map((l) => (
                <li key={l.href}><Link to={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground mb-4">Company</h4>
            <ul className="flex flex-col gap-2.5">
              {LINKS.company.map((l) => (
                <li key={l.href}><Link to={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link></li>
              ))}
            </ul>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground mt-6 mb-4">Legal</h4>
            <ul className="flex flex-col gap-2.5">
              {LINKS.legal.map((l) => (
                <li key={l.href}><Link to={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link></li>
              ))}
              <li><button onClick={openCookieSettings} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cookie Settings</button></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border/30">
        <div className="section-container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {BRAND_FULL}. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Malta · EUR</p>
        </div>
      </div>
    </footer>
  );
}
