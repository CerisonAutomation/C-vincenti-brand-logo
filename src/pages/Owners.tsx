import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Shield, BarChart3, Clock, Zap, Brain, DollarSign, Users, Calendar, PieChart, Target, Award, Star, Activity, Globe, Smartphone, Cloud, Lock, Eye, Heart } from 'lucide-react';
import Layout from '@/components/Layout';
import PricingSection from '@/components/PricingSection';
import FAQSection from '@/components/FAQSection';
import ProofStrip from '@/components/ProofStrip';
import ProcessSection from '@/components/ProcessSection';

const STATS = [
  { value: '€2.4M+', label: 'Revenue Generated' },
  { value: '45+', label: 'Properties Managed' },
  { value: '4.97', label: 'Average Rating' },
  { value: '94%', label: 'Occupancy Rate' },
];

const TRUST = [
  { icon: Shield, label: 'No Hidden Markups', desc: 'Maintenance passed at cost, always.' },
  { icon: BarChart3, label: 'Owner Dashboard', desc: 'Live bookings, revenue & statements.' },
  { icon: Clock, label: '24hr Response', desc: 'Guaranteed reply, every time.' },
  { icon: TrendingUp, label: 'Dynamic Pricing', desc: 'AI-optimised nightly rates.' },
];

const PREMIUM_FEATURES = [
  {
    icon: Brain,
    title: 'AI Revenue Optimization',
    description: 'Machine learning algorithms analyze market trends, competitor pricing, and booking patterns to maximize your rental income.',
    metrics: '+23% average revenue increase'
  },
  {
    icon: Activity,
    title: 'Real-Time Analytics',
    description: 'Live dashboard with booking rates, occupancy trends, and predictive analytics for future performance.',
    metrics: 'Updated every 15 minutes'
  },
  {
    icon: Users,
    title: 'Guest Profiling',
    description: 'AI-powered guest insights help you understand preferences and deliver personalized experiences.',
    metrics: '85% repeat guest rate'
  },
  {
    icon: Globe,
    title: 'Global Marketing',
    description: 'Multi-channel marketing across 50+ platforms with automated content generation and distribution.',
    metrics: '12M+ monthly impressions'
  },
  {
    icon: Smartphone,
    title: 'Smart Property Management',
    description: 'IoT integration for automated check-ins, maintenance alerts, and energy optimization.',
    metrics: '€1,200 avg. annual savings'
  },
  {
    icon: Cloud,
    title: 'Cloud Infrastructure',
    description: 'Enterprise-grade hosting with 99.9% uptime, automatic backups, and disaster recovery.',
    metrics: 'Zero downtime incidents'
  }
];

const DASHBOARD_METRICS = [
  { label: 'Monthly Revenue', value: '€8,450', change: '+12%', trend: 'up' },
  { label: 'Occupancy Rate', value: '94%', change: '+2%', trend: 'up' },
  { label: 'Average Rating', value: '4.97', change: '+0.1', trend: 'up' },
  { label: 'Response Time', value: '<1hr', change: '-15min', trend: 'up' },
];

export default function Owners() {
  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="py-20 satin-glow border-b border-border/30">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">Premium Property Management</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6">
              Turn your property into a{' '}
              <span className="gold-text">performing asset</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed text-lg max-w-xl mb-10">
              Full-service short-let management across Malta and Gozo with AI-powered revenue optimization, real-time analytics, and enterprise-grade infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/owners/estimate"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Get Your Free Estimate <ArrowRight size={14} />
              </Link>
              <Link
                to="/owners/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border text-foreground rounded font-semibold text-sm hover:border-primary hover:text-primary transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </motion.div>

          {/* Enhanced Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-16">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="satin-surface rounded-lg p-5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -translate-y-8 translate-x-8"></div>
                <p className="font-serif text-3xl font-bold text-primary mb-1">{s.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive Dashboard Preview ── */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="section-container">
          <div className="text-center mb-16">
            <p className="micro-type text-primary mb-3">Real-Time Analytics</p>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Your Property, <span className="gold-text">Performs</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Monitor your investment with live dashboards, predictive analytics, and AI-driven insights.
            </p>
          </div>

          {/* Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              {/* Dashboard Header */}
              <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-bold">Villa Paradise Dashboard</h3>
                    <p className="text-primary-foreground/80">Live Performance Analytics</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm">Live</span>
                    </div>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="p-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {DASHBOARD_METRICS.map((metric, i) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                        <div className={`flex items-center gap-1 text-xs font-semibold ${
                          metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.trend === 'up' ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                          {metric.change}
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Charts Placeholder */}
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Revenue Trends</h4>
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="h-40 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg flex items-end justify-center">
                      <div className="w-full h-24 bg-gradient-to-t from-primary/20 to-transparent rounded-b-lg"></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Last 12 months performance</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Occupancy Calendar</h4>
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 35 }, (_, i) => (
                        <div
                          key={i}
                          className={`aspect-square rounded ${
                            Math.random() > 0.3 ? 'bg-primary' : 'bg-gray-200'
                          }`}
                        ></div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Next 5 weeks availability</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── AI-Powered Features ── */}
      <section className="py-20 border-t border-border/30">
        <div className="section-container">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="w-6 h-6 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">AI-Powered Management</span>
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Intelligence That <span className="gold-text">Works for You</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our proprietary AI algorithms continuously optimize pricing, predict demand, and maximize your revenue potential.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PREMIUM_FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <feature.icon className="w-6 h-6 text-primary group-hover:text-white" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">{feature.description}</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Target className="w-4 h-4" />
                  {feature.metrics}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust signals ── */}
      <ProofStrip />

      {/* ── How It Works ── */}
      <ProcessSection />

      {/* ── Why Choose Us ── */}
      <section className="py-16 border-t border-border/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <p className="micro-type text-primary mb-3">Why Christiano Vincenti</p>
            <h2 className="font-serif text-3xl font-semibold text-foreground">
              The difference is in the <span className="gold-text">detail</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRUST.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="satin-surface rounded-xl p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <t.icon size={18} className="text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{t.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <PricingSection onOpenWizard={() => { window.location.href = '/owners/estimate'; }} />

      {/* ── FAQ ── */}
      <FAQSection />

      {/* ── Enhanced CTA ── */}
      <section className="py-16 border-t border-border/30">
        <div className="section-container">
          <div className="satin-surface rounded-2xl p-10 text-center satin-glow">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Award className="w-6 h-6 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">Limited Time Offer</span>
            </div>
            <p className="micro-type text-primary mb-3">Ready to begin?</p>
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-4">
              Get a free, no-obligation estimate
            </h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
              Tell us about your property and we'll provide a detailed rental income projection within 24 hours, plus a free market analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/owners/estimate"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Start Free Estimate <ArrowRight size={14} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 border border-border text-foreground rounded font-semibold text-sm hover:border-primary hover:text-primary transition-colors"
              >
                Schedule Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
