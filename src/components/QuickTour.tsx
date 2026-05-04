import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinanceStore } from '../store/useFinanceStore';
import { 
  LayoutDashboard, 
  ReceiptText, 
  CalendarClock, 
  Target, 
  Bell, 
  ArrowRight, 
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Wallet,
  TrendingUp,
  UserCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

const steps = [
  {
    id: 'welcome',
    title: "Welcome to Prunance",
    description: "Your all-in-one financial companion designed for clarity and growth. Let's take a quick tour to set you up for success.",
    icon: Sparkles,
    color: "bg-blue-600",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: 'payday',
    title: "Payday Logic",
    description: "Prunance calculates your 'Available to Spend' by looking at your next payday. It automatically accounts for upcoming bills, so you never overspend.",
    icon: CalendarClock,
    color: "bg-indigo-600",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: 'alerts',
    title: "Proactive Alerts",
    description: "The bell icon tracks your financial health. It warns you about spending spikes and budget overages before they become problems.",
    icon: Bell,
    color: "bg-red-500",
    image: "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: 'tracking',
    title: "Smart Tracking",
    description: "Track expenses, recurring bills, and savings goals. Use 'Quick Adds' to log common purchases in a single tap.",
    icon: ReceiptText,
    color: "bg-green-500",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: 'goals',
    title: "Savings Goals",
    description: "Dreaming of a new car or a vacation? Set a goal, track your progress, and Prunance will help you stay motivated.",
    icon: Target,
    color: "bg-orange-500",
    image: "https://images.unsplash.com/photo-1533073526757-2c8ca1df9f1c?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: 'privacy',
    title: "Privacy First",
    description: "Your data stays on your device. You can set a Privacy Lock and export backups anytime in Settings.",
    icon: ShieldCheck,
    color: "bg-purple-600",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800&h=600"
  },
  {
    id: 'setup',
    title: "Quick Setup",
    description: "Let's personalize your experience. Tell us your name, preferred currency, and monthly income to get started.",
    icon: UserCircle,
    color: "bg-blue-600",
    isSetup: true
  }
];

const commonCurrencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar' },
];

export default function QuickTour() {
  const { profile, completeTour, setProfile } = useFinanceStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [setupData, setSetupData] = useState({
    name: '',
    income: '',
    currency: profile.currency || 'USD'
  });

  if (profile.hasSeenTour) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      setProfile({
        ...profile,
        name: setupData.name || 'User',
        monthlyIncome: Number(setupData.income) || 0,
        currency: setupData.currency,
        hasSeenTour: true
      });
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-white flex flex-col"
      >
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-8 text-center space-y-8">
          <motion.div
            key={currentStep}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-full max-w-sm space-y-8"
          >
            <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-100", step.color)}>
              <step.icon className="w-10 h-10 text-white" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">{step.title}</h2>
              <p className="text-gray-500 leading-relaxed">{step.description}</p>
            </div>

            {step.isSetup ? (
              <div className="space-y-4 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Your Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Alex"
                    value={setupData.name}
                    onChange={(e) => setSetupData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Preferred Currency</label>
                  <select 
                    value={setupData.currency}
                    onChange={(e) => setSetupData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                  >
                    {commonCurrencies.map(c => (
                      <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Monthly Income</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      {commonCurrencies.find(c => c.code === setupData.currency)?.symbol || '$'}
                    </span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={setupData.income}
                      onChange={(e) => setSetupData(prev => ({ ...prev, income: e.target.value }))}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-10 pr-5 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img 
                  src={step.image} 
                  alt={step.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}
          </motion.div>
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100">
          <div className="max-w-sm mx-auto space-y-6">
            <div className="flex justify-center gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === currentStep ? "w-8 bg-blue-600" : "w-2 bg-gray-200"
                  )}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-bold shadow-xl shadow-blue-100 flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              {isLast ? "Finish Setup" : "Next Step"}
              {isLast ? <CheckCircle2 className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </button>

            {!isLast && (
              <button 
                onClick={completeTour}
                className="w-full text-gray-400 text-sm font-bold uppercase tracking-widest hover:text-gray-600 transition-colors"
              >
                Skip Tour
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
