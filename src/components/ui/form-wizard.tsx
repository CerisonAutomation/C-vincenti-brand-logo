import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight, Shield, ChartColumn, Clock } from 'lucide-react';

interface FormWizardProps {
  title: string;
  subtitle: string;
  steps: React.ReactElement[];
  onComplete: (data: Record<string, unknown>) => void;
  onClose: () => void;
}

interface StepProps {
  formData: Record<string, unknown>;
  updateFormData: (data: Record<string, unknown>) => void;
  nextStep?: () => void;
  prevStep?: () => void;
}

/**
 * Modal form wizard component with glass morphism design
 * Matches the provided design pattern for all forms
 */
export function FormWizard({ title, subtitle, steps, onComplete, onClose }: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (newData: Record<string, unknown>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  return (
    <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto glass-surface rounded-t-2xl sm:rounded-2xl border border-border/50" role="dialog" aria-modal="true" aria-label={title}>
      {/* Header */}
      <div className="sticky top-0 z-10 glass-surface border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
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
                index <= currentStep ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {steps[currentStep] && React.cloneElement(steps[currentStep], {
          formData,
          updateFormData,
          nextStep,
          prevStep
        })}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 glass-surface border-t border-border/50 px-6 py-4 flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          onClick={nextStep}
          className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {currentStep === steps.length - 1 ? 'Complete' : 'Continue'}
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
  );
}

/**
 * Situation selection step component
 */
export function SituationStep({ formData, updateFormData }: StepProps) {
  const situations = [
    {
      id: 'not-listed',
      title: 'Not listed yet',
      description: 'I have a property I\'d like to start renting',
      selected: formData.situation === 'not-listed'
    },
    {
      id: 'already-listed',
      title: 'Already listed',
      description: 'My property is live but I want better results',
      selected: formData.situation === 'already-listed'
    },
    {
      id: 'switching-manager',
      title: 'Switching manager',
      description: 'I\'m looking for a better management partner',
      selected: formData.situation === 'switching-manager'
    }
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">Where are you starting from?</p>
      {situations.map(situation => (
        <button
          key={situation.id}
          onClick={() => updateFormData({ situation: situation.id })}
          className={`w-full text-left p-4 rounded-lg border transition-all ${
            situation.selected
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/30'
          }`}
        >
          <p className="text-sm font-semibold text-foreground">{situation.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{situation.description}</p>
        </button>
      ))}
    </div>
  );
}
