/**
 * Site Configuration - Central JSON config for all site content.
 * Edit this file to update any content on the site.
 * Future: connect to Google Sheets API for live editing.
 */

export interface PropertyConfig {
  id: string;
  title: string;
  location: string;
  type: string;
  guests: number;
  beds: number;
  baths: number;
  pricePerNight: string;
  image: string;
  bookingUrl: string;
  featured: boolean;
}

export interface PlanConfig {
  name: string;
  price: string;
  subtitle: string;
  description: string;
  features: string[];
  highlighted: boolean;
}

export interface FAQConfig {
  question: string;
  answer: string;
}

export interface ProcessStepConfig {
  step: string;
  title: string;
  description: string;
  icon: string;
}

export interface SiteConfig {
  brand: {
    name: string;
    tagline: string;
    subText: string;
    email: string;
    phone: string;
    bookingUrl: string;
  };
  navigation: Array<{ label: string; href: string }>;
  hero: {
    tagline: string;
    headline: string;
    highlightedWord: string;
    description: string;
    ctaText: string;
    secondaryCtaText: string;
  };
  stats: Array<{ value: string; label: string }>;
  proofPoints: Array<{ icon: string; label: string; desc: string }>;
  process: ProcessStepConfig[];
  plans: PlanConfig[];
  faqs: FAQConfig[];
  properties: PropertyConfig[];
  footer: {
    links: Array<{ label: string; href: string }>;
    copyright: string;
  };
}

const SITE_CONFIG: SiteConfig = {
  brand: {
    name: "Christiano Vincenti",
    tagline: "Malta's Premier Property Partner",
    subText: "PROPERTY MANAGEMENT",
    email: "info@christianopm.com",
    phone: "+356 7927 4688",
    bookingUrl: "https://malta.guestybookings.com/",
  },
  navigation: [
    { label: "Process", href: "#process" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  hero: {
    tagline: "Malta's Premier Property Partner",
    headline: "Maximise your rental income,",
    highlightedWord: "effortlessly.",
    description: "Full-service short-let management across Malta & Gozo. We handle everything — you earn more.",
    ctaText: "Get Your Free Assessment",
    secondaryCtaText: "How It Works",
  },
  stats: [
    { value: "€2.4M+", label: "Revenue Generated" },
    { value: "45+", label: "Properties Managed" },
    { value: "4.97", label: "Average Rating" },
    { value: "94%", label: "Occupancy Rate" },
  ],
  proofPoints: [
    { icon: "Shield", label: "No Hidden Markups", desc: "Maintenance at cost" },
    { icon: "BarChart3", label: "Owner Dashboard", desc: "Monthly statements" },
    { icon: "Clock", label: "24hr Response", desc: "Guaranteed reply" },
    { icon: "Star", label: "5-Star Reviews", desc: "Guest satisfaction" },
  ],
  process: [
    { step: "01", title: "Free Assessment", description: "Tell us about your property and goals. We'll analyse your potential income and recommend the right plan.", icon: "ClipboardCheck" },
    { step: "02", title: "We Set You Up", description: "Professional photography, listing optimisation, pricing strategy, and MTA licensing support — all handled.", icon: "Camera" },
    { step: "03", title: "You Earn More", description: "We manage bookings, guests, cleaning, and maintenance. You receive monthly payouts and transparent reports.", icon: "Rocket" },
  ],
  plans: [
    {
      name: "Essentials",
      price: "15%",
      subtitle: "of booking revenue",
      description: "Perfect for owners who want professional listing management with hands-on involvement.",
      features: ["Professional photography", "Multi-platform listing", "Dynamic pricing", "Guest communication", "Monthly reporting", "MTA licence guidance"],
      highlighted: false,
    },
    {
      name: "Complete",
      price: "20%",
      subtitle: "of booking revenue",
      description: "Full hands-off management. We handle everything so you don't have to lift a finger.",
      features: ["Everything in Essentials", "Cleaning coordination", "Maintenance at cost", "Linen & amenities", "Direct booking website", "Owner dashboard access", "Priority 24hr support", "Quarterly strategy review"],
      highlighted: true,
    },
  ],
  faqs: [
    { question: "Do I need an MTA licence to rent short-term in Malta?", answer: "Yes. All short-let properties in Malta require a Malta Tourism Authority (MTA) licence. We guide you through the entire application process as part of our service." },
    { question: "What areas do you cover?", answer: "We manage properties across all of Malta and Gozo, with particular expertise in Sliema, St Julian's, Valletta, Mdina, and Mellieħa." },
    { question: "How quickly can my property go live?", answer: "Most properties are listed within 2–3 weeks of onboarding. This includes professional photography, listing creation, and pricing setup." },
    { question: "What happens with maintenance issues?", answer: "We coordinate all maintenance through our trusted network. Costs are passed through at cost — no markups, ever. You approve anything above a pre-agreed threshold." },
    { question: "Can I block dates for personal use?", answer: "Absolutely. You have full control over your calendar through our owner dashboard. Block dates anytime with no penalties." },
    { question: "What's included in the monthly reporting?", answer: "You receive a detailed monthly statement covering revenue, occupancy, guest reviews, expenses, and a performance summary compared to market benchmarks." },
  ],
  properties: [
    {
      id: "fives",
      title: "The Fives Apartments",
      location: "St Julian's, Malta",
      type: "Apartment",
      guests: 6,
      beds: 3,
      baths: 3,
      pricePerNight: "€180",
      image: "/assets/property-fives.jpg",
      bookingUrl: "https://malta.guestybookings.com/en/properties/6878a53283f1c400114b71e8",
      featured: true,
    },
    {
      id: "ursula",
      title: "123 St Ursula Street",
      location: "Valletta, Malta",
      type: "Apartment",
      guests: 4,
      beds: 1,
      baths: 2,
      pricePerNight: "€150",
      image: "/assets/property-ursula.jpg",
      bookingUrl: "https://malta.guestybookings.com/en/properties/6878a5365a563c0013969391",
      featured: true,
    },
    {
      id: "penthouse",
      title: "St. Julian's Penthouse",
      location: "San Ġiljan, Malta",
      type: "Penthouse",
      guests: 4,
      beds: 2,
      baths: 2,
      pricePerNight: "€155",
      image: "/assets/property-penthouse.jpg",
      bookingUrl: "https://malta.guestybookings.com/en/properties/6878a53de8249000105817f8",
      featured: true,
    },
  ],
  footer: {
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Contact", href: "mailto:info@christianopm.com" },
    ],
    copyright: `© ${new Date().getFullYear()} Christiano Property Management. All rights reserved.`,
  },
};

export function getSiteConfig(): SiteConfig {
  return SITE_CONFIG;
}

export function updateSiteConfig(updates: Partial<SiteConfig>): SiteConfig {
  Object.assign(SITE_CONFIG, updates);
  return SITE_CONFIG;
}
