'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, CheckCircle, Shield, Zap, Database } from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const tourSteps: TourStep[] = [
  {
    title: 'Welcome to PayGateway',
    description: 'This demo showcases a production-grade payment gateway with idempotency protection, webhooks, and automated settlements.',
    icon: <CheckCircle className="w-6 h-6" />
  },
  {
    title: 'Idempotency Protection',
    description: 'The most important feature: prevents duplicate charges. If the same payment request is sent twice, the second one is automatically blocked.',
    icon: <Shield className="w-6 h-6" />
  },
  {
    title: 'Try the Checkout Demo',
    description: 'Go to the checkout page to test payments. Use the Developer Tools to simulate different bank outcomes and test idempotency replay.',
    icon: <Zap className="w-6 h-6" />
  },
  {
    title: 'View Your Data',
    description: 'The dashboard shows all your payments, settlements, and revenue. All data is stored in PostgreSQL with proper audit trails.',
    icon: <Database className="w-6 h-6" />
  }
];

export function GuidedTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenGuidedTour');
    if (!hasSeenTour) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    setIsDismissed(true);
    localStorage.setItem('hasSeenGuidedTour', 'true');
  };

  const handleRestart = () => {
    setIsOpen(true);
    setCurrentStep(0);
    setIsDismissed(false);
    localStorage.removeItem('hasSeenGuidedTour');
  };

  if (!isOpen && isDismissed) {
    return (
      <button
        onClick={handleRestart}
        className="fixed bottom-4 right-4 rounded-xl bg-[var(--midnight-navy)] px-4 py-2 text-sm font-medium text-white shadow-[0_10px_22px_rgba(11,18,32,0.2)] transition hover:bg-[var(--midnight-navy-soft)]"
      >
        Show Tour
      </button>
    );
  }

  if (!isOpen) return null;

  const step = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(11,18,32,0.52)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2 text-[var(--royal-blue)]">
              {step.icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--midnight-navy)]">{step.title}</h2>
              <p className="text-sm text-[var(--secondary-text)]">
                Step {currentStep + 1} of {tourSteps.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 flex gap-1">
          {tourSteps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition ${
                idx <= currentStep ? 'bg-[var(--royal-blue)]' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        <p className="mt-6 text-sm leading-relaxed text-slate-700">{step.description}</p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleDismiss}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Skip Tour
          </button>
          <button
            onClick={handleNext}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--royal-blue)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] transition hover:bg-[var(--royal-blue-strong)]"
          >
            {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
            {currentStep < tourSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
