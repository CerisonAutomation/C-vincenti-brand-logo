import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, ArrowLeft, ArrowRight, Shield, ChartColumn, Clock, Home, User, MessageSquare, MapPin, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MALTA_LOCALITIES, PROPERTY_TYPES, BEDROOM_OPTIONS } from '@/lib/malta-localities';

const schema = z.object({
  locality: z.string().min(1, 'Select a locality'),
  propertyType: z.string().min(1, 'Select property type'),
  bedrooms: z.string().min(1, 'Select bedrooms'),
  bathrooms: z.string().min(1, 'Select bathrooms'),
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Valid email required').max(255),
  phone: z.string().regex(/^\+?[\d\s\-()]{7,20}$/, 'Valid phone number required'),
  currentStatus: z.string().min(1, 'Select current status'),
  targetRevenue: z.string().optional(),
  message: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof schema>;

interface PremiumEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Premium estimate modal with glass morphism and luxury design
 * Matches the high-end aesthetic of the site
 */
export function PremiumEstimateModal({ isOpen, onClose }: PremiumEstimateModalProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<FormData>>({});

  const steps = [
    { title: 'Your Property', subtitle: 'Tell us about your property', icon: Home },
    { title: 'Your Details', subtitle: 'How can we reach you?', icon: User },
    { title: 'Your Goals', subtitle: 'What are you looking to achieve?', icon: MessageSquare },
  ];

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const updateFormData = (newData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleSubmit = () => {
    openMailto(formData as FormData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="glass-surface rounded-t-2xl sm:rounded-2xl border border-border/50 shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 glass-surface border-b border-border/50 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold text-foreground">{steps[step].title}</h2>
              <p className="text-xs text-muted-foreground">{steps[step].subtitle}</p>
            </div>
            <button 
              aria-label="Close" 
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress */}
          <div className="px-6 pt-4">
            <div className="flex gap-1.5">
              {steps.map((_, index) => (
                <div 
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index <= step ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <AnimatePresence mode="wait">
              {step === 0 && <PropertyStep key="property" formData={formData} updateFormData={updateFormData} />}
              {step === 1 && <DetailsStep key="details" formData={formData} updateFormData={updateFormData} />}
              {step === 2 && <GoalsStep key="goals" formData={formData} updateFormData={updateFormData} onSubmit={handleSubmit} />}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 glass-surface border-t border-border/50 px-6 py-4 flex items-center justify-between">
            <button 
              onClick={prevStep}
              disabled={step === 0}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <button 
              onClick={step === steps.length - 1 ? handleSubmit : nextStep}
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {step === steps.length - 1 ? 'Get Estimate' : 'Continue'}
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Trust indicators */}
          <div className="px-6 pb-4 flex items-center gap-4 text-[0.65rem] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield size={10} />
              No markups
            </span>
            <span className="flex items-center gap-1">
              <ChartColumn size={10} />
              Owner dashboard
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              24hr reply
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PropertyStep({ formData, updateFormData }: { formData: Partial<FormData>; updateFormData: (data: Partial<FormData>) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Location</label>
        <select 
          value={formData.locality || ''}
          onChange={(e) => updateFormData({ locality: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select locality</option>
          {MALTA_LOCALITIES.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Property Type</label>
          <select 
            value={formData.propertyType || ''}
            onChange={(e) => updateFormData({ propertyType: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select type</option>
            {PROPERTY_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Bedrooms</label>
          <select 
            value={formData.bedrooms || ''}
            onChange={(e) => updateFormData({ bedrooms: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select</option>
            {BEDROOM_OPTIONS.map(beds => (
              <option key={beds} value={beds}>{beds}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Bathrooms</label>
        <div className="flex gap-2 flex-wrap">
          {['1', '2', '3', '4+'].map(bath => (
            <button
              key={bath}
              type="button"
              onClick={() => updateFormData({ bathrooms: bath })}
              className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                formData.bathrooms === bath
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {bath}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function DetailsStep({ formData, updateFormData }: { formData: Partial<FormData>; updateFormData: (data: Partial<FormData>) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Full Name</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder="Your full name"
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email Address</label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => updateFormData({ email: e.target.value })}
          placeholder="you@email.com"
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Phone Number</label>
        <input
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => updateFormData({ phone: e.target.value })}
          placeholder="+356 7900 0000"
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </motion.div>
  );
}

function GoalsStep({ formData, updateFormData, onSubmit }: { 
  formData: Partial<FormData>; 
  updateFormData: (data: Partial<FormData>) => void; 
  onSubmit: () => void; 
}) {
  const statusOptions = [
    'Not yet renting — ready to start',
    'Currently self-managing',
    'With another agency — looking to switch',
    'Just bought / renovating',
    'Exploring options only',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Current Situation</label>
        <div className="space-y-2">
          {statusOptions.map(status => (
            <button
              key={status}
              type="button"
              onClick={() => updateFormData({ currentStatus: status })}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                formData.currentStatus === status
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <p className="text-sm font-medium">{status}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Monthly Revenue Target (Optional)</label>
        <div className="flex gap-2 flex-wrap">
          {['€500–1,000', '€1,000–2,000', '€2,000–4,000', '€4,000+', 'Not sure'].map(revenue => (
            <button
              key={revenue}
              type="button"
              onClick={() => updateFormData({ targetRevenue: revenue })}
              className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                formData.targetRevenue === revenue
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {revenue}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Additional Details (Optional)</label>
        <textarea
          value={formData.message || ''}
          onChange={(e) => updateFormData({ message: e.target.value })}
          rows={3}
          placeholder="Tell us about your property, timeline, or any questions..."
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
        />
      </div>
    </motion.div>
  );
}

function openMailto(data: FormData) {
  const body = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Location: ${data.locality}`,
    `Property Type: ${data.propertyType}`,
    `Bedrooms: ${data.bedrooms}`,
    `Bathrooms: ${data.bathrooms}`,
    `Current Status: ${data.currentStatus}`,
    `Revenue Target: ${data.targetRevenue || 'N/A'}`,
    `Message: ${data.message || 'N/A'}`,
  ].join('\n');
  
  window.location.href = `mailto:info@christianopm.com?subject=${encodeURIComponent('Property Estimate Request')}&body=${encodeURIComponent(body)}`;
}
