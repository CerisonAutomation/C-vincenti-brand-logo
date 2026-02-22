import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Plus, Trash2, ArrowLeft, Eye, Settings, Home, Image, DollarSign, HelpCircle, BarChart3, FileText } from "lucide-react";
import { getSiteConfig, updateSiteConfig, type SiteConfig, type PropertyConfig, type PlanConfig, type FAQConfig } from "@/lib/site-config";
import { Logo } from "@/components/Logo";

type Tab = "hero" | "stats" | "process" | "properties" | "pricing" | "faqs" | "navigation" | "brand";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "brand", label: "Brand", icon: Settings },
  { id: "hero", label: "Hero", icon: Home },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "properties", label: "Properties", icon: Image },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
  { id: "navigation", label: "Navigation", icon: FileText },
];

export default function Admin() {
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  const [saved, setSaved] = useState(false);

  const save = () => {
    updateSiteConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateField = (path: string, value: any) => {
    setConfig((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-card/50 flex flex-col">
        <div className="p-4 border-b border-border">
          <Logo size="sm" onClick={() => window.location.href = "/"} />
          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-primary mt-1 font-semibold">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded transition-colors ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-2">
          <a href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Eye size={16} /> View Site
          </a>
          <a href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} /> Back
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 glass-surface border-b border-border px-6 py-3 flex items-center justify-between">
          <h1 className="font-serif text-lg font-semibold text-foreground capitalize">{activeTab}</h1>
          <button
            onClick={save}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded transition-all ${
              saved
                ? "bg-green-600 text-white"
                : "bg-primary text-primary-foreground hover:bg-gold-light"
            }`}
          >
            <Save size={14} />
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>

        <div className="max-w-3xl mx-auto p-6">
          {activeTab === "brand" && <BrandEditor config={config} updateField={updateField} />}
          {activeTab === "hero" && <HeroEditor config={config} updateField={updateField} />}
          {activeTab === "stats" && <StatsEditor config={config} setConfig={setConfig} />}
          {activeTab === "properties" && <PropertiesEditor config={config} setConfig={setConfig} />}
          {activeTab === "pricing" && <PricingEditor config={config} setConfig={setConfig} />}
          {activeTab === "faqs" && <FAQsEditor config={config} setConfig={setConfig} />}
          {activeTab === "navigation" && <NavigationEditor config={config} setConfig={setConfig} />}
        </div>
      </main>
    </div>
  );
}

function FieldInput({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {type === "textarea" ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary min-h-[80px] resize-y" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
      )}
    </div>
  );
}

function BrandEditor({ config, updateField }: { config: SiteConfig; updateField: (p: string, v: any) => void }) {
  return (
    <div className="space-y-4">
      <FieldInput label="Brand Name" value={config.brand.name} onChange={(v) => updateField("brand.name", v)} />
      <FieldInput label="Tagline" value={config.brand.tagline} onChange={(v) => updateField("brand.tagline", v)} />
      <FieldInput label="Sub Text" value={config.brand.subText} onChange={(v) => updateField("brand.subText", v)} />
      <FieldInput label="Email" value={config.brand.email} onChange={(v) => updateField("brand.email", v)} type="email" />
      <FieldInput label="Phone" value={config.brand.phone} onChange={(v) => updateField("brand.phone", v)} type="tel" />
      <FieldInput label="Booking URL" value={config.brand.bookingUrl} onChange={(v) => updateField("brand.bookingUrl", v)} type="url" />
    </div>
  );
}

function HeroEditor({ config, updateField }: { config: SiteConfig; updateField: (p: string, v: any) => void }) {
  return (
    <div className="space-y-4">
      <FieldInput label="Tagline" value={config.hero.tagline} onChange={(v) => updateField("hero.tagline", v)} />
      <FieldInput label="Headline" value={config.hero.headline} onChange={(v) => updateField("hero.headline", v)} />
      <FieldInput label="Highlighted Word" value={config.hero.highlightedWord} onChange={(v) => updateField("hero.highlightedWord", v)} />
      <FieldInput label="Description" value={config.hero.description} onChange={(v) => updateField("hero.description", v)} type="textarea" />
      <FieldInput label="CTA Text" value={config.hero.ctaText} onChange={(v) => updateField("hero.ctaText", v)} />
      <FieldInput label="Secondary CTA" value={config.hero.secondaryCtaText} onChange={(v) => updateField("hero.secondaryCtaText", v)} />
    </div>
  );
}

function StatsEditor({ config, setConfig }: { config: SiteConfig; setConfig: (c: SiteConfig) => void }) {
  const update = (i: number, field: "value" | "label", val: string) => {
    const stats = [...config.stats];
    stats[i] = { ...stats[i], [field]: val };
    setConfig({ ...config, stats });
  };
  return (
    <div className="space-y-4">
      {config.stats.map((s, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex-1"><FieldInput label="Value" value={s.value} onChange={(v) => update(i, "value", v)} /></div>
          <div className="flex-1"><FieldInput label="Label" value={s.label} onChange={(v) => update(i, "label", v)} /></div>
        </div>
      ))}
    </div>
  );
}

function PropertiesEditor({ config, setConfig }: { config: SiteConfig; setConfig: (c: SiteConfig) => void }) {
  const updateProp = (i: number, field: keyof PropertyConfig, val: any) => {
    const properties = [...config.properties];
    properties[i] = { ...properties[i], [field]: val };
    setConfig({ ...config, properties });
  };
  const addProp = () => {
    setConfig({
      ...config,
      properties: [...config.properties, { id: `prop-${Date.now()}`, title: "", location: "", type: "Apartment", guests: 2, beds: 1, baths: 1, pricePerNight: "€100", image: "", bookingUrl: "", featured: true }],
    });
  };
  const removeProp = (i: number) => {
    setConfig({ ...config, properties: config.properties.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-6">
      {config.properties.map((p, i) => (
        <div key={p.id} className="glass-surface rounded-lg p-5 space-y-3 relative">
          <button onClick={() => removeProp(i)} className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
          <FieldInput label="Title" value={p.title} onChange={(v) => updateProp(i, "title", v)} />
          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Location" value={p.location} onChange={(v) => updateProp(i, "location", v)} />
            <FieldInput label="Type" value={p.type} onChange={(v) => updateProp(i, "type", v)} />
          </div>
          <div className="grid grid-cols-4 gap-3">
            <FieldInput label="Guests" value={String(p.guests)} onChange={(v) => updateProp(i, "guests", parseInt(v) || 0)} />
            <FieldInput label="Beds" value={String(p.beds)} onChange={(v) => updateProp(i, "beds", parseInt(v) || 0)} />
            <FieldInput label="Baths" value={String(p.baths)} onChange={(v) => updateProp(i, "baths", parseInt(v) || 0)} />
            <FieldInput label="Price/Night" value={p.pricePerNight} onChange={(v) => updateProp(i, "pricePerNight", v)} />
          </div>
          <FieldInput label="Booking URL" value={p.bookingUrl} onChange={(v) => updateProp(i, "bookingUrl", v)} type="url" />
          <FieldInput label="Image URL" value={p.image} onChange={(v) => updateProp(i, "image", v)} />
        </div>
      ))}
      <button onClick={addProp} className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary transition-colors">
        <Plus size={14} /> Add Property
      </button>
    </div>
  );
}

function PricingEditor({ config, setConfig }: { config: SiteConfig; setConfig: (c: SiteConfig) => void }) {
  const updatePlan = (i: number, field: keyof PlanConfig, val: any) => {
    const plans = [...config.plans];
    plans[i] = { ...plans[i], [field]: val };
    setConfig({ ...config, plans });
  };

  return (
    <div className="space-y-6">
      {config.plans.map((plan, i) => (
        <div key={plan.name} className="glass-surface rounded-lg p-5 space-y-3">
          <FieldInput label="Plan Name" value={plan.name} onChange={(v) => updatePlan(i, "name", v)} />
          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Price" value={plan.price} onChange={(v) => updatePlan(i, "price", v)} />
            <FieldInput label="Subtitle" value={plan.subtitle} onChange={(v) => updatePlan(i, "subtitle", v)} />
          </div>
          <FieldInput label="Description" value={plan.description} onChange={(v) => updatePlan(i, "description", v)} type="textarea" />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Features (one per line)</label>
            <textarea
              value={plan.features.join("\n")}
              onChange={(e) => updatePlan(i, "features", e.target.value.split("\n").filter(Boolean))}
              className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary min-h-[120px] resize-y"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input type="checkbox" checked={plan.highlighted} onChange={(e) => updatePlan(i, "highlighted", e.target.checked)} className="accent-primary" />
            Highlighted (Most Popular)
          </label>
        </div>
      ))}
    </div>
  );
}

function FAQsEditor({ config, setConfig }: { config: SiteConfig; setConfig: (c: SiteConfig) => void }) {
  const updateFaq = (i: number, field: "question" | "answer", val: string) => {
    const faqs = [...config.faqs];
    faqs[i] = { ...faqs[i], [field]: val };
    setConfig({ ...config, faqs });
  };
  const addFaq = () => {
    setConfig({ ...config, faqs: [...config.faqs, { question: "", answer: "" }] });
  };
  const removeFaq = (i: number) => {
    setConfig({ ...config, faqs: config.faqs.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-4">
      {config.faqs.map((faq, i) => (
        <div key={i} className="glass-surface rounded-lg p-4 space-y-3 relative">
          <button onClick={() => removeFaq(i)} className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
          <FieldInput label="Question" value={faq.question} onChange={(v) => updateFaq(i, "question", v)} />
          <FieldInput label="Answer" value={faq.answer} onChange={(v) => updateFaq(i, "answer", v)} type="textarea" />
        </div>
      ))}
      <button onClick={addFaq} className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary transition-colors">
        <Plus size={14} /> Add FAQ
      </button>
    </div>
  );
}

function NavigationEditor({ config, setConfig }: { config: SiteConfig; setConfig: (c: SiteConfig) => void }) {
  const updateNav = (i: number, field: "label" | "href", val: string) => {
    const navigation = [...config.navigation];
    navigation[i] = { ...navigation[i], [field]: val };
    setConfig({ ...config, navigation });
  };
  const addNav = () => {
    setConfig({ ...config, navigation: [...config.navigation, { label: "", href: "#" }] });
  };
  const removeNav = (i: number) => {
    setConfig({ ...config, navigation: config.navigation.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-4">
      {config.navigation.map((nav, i) => (
        <div key={i} className="flex gap-3 items-end">
          <div className="flex-1"><FieldInput label="Label" value={nav.label} onChange={(v) => updateNav(i, "label", v)} /></div>
          <div className="flex-1"><FieldInput label="Link" value={nav.href} onChange={(v) => updateNav(i, "href", v)} /></div>
          <button onClick={() => removeNav(i)} className="p-2 mb-0.5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
        </div>
      ))}
      <button onClick={addNav} className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary transition-colors">
        <Plus size={14} /> Add Link
      </button>
    </div>
  );
}
