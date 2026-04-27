import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

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
  const { profile, setProfile } = useFinanceStore();
  const [setupData, setSetupData] = useState({
    name: '',
    income: '',
    currency: profile.currency || 'USD'
  });

  if (profile.hasSeenTour) return null;

  const handleFinish = () => {
    setProfile({
      ...profile,
      name: setupData.name || 'User',
      monthlyIncome: Number(setupData.income) || 0,
      currency: setupData.currency,
      hasSeenTour: true // This will close the modal and trigger Joyride
    });
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          <div className="bg-blue-600 p-8 text-center text-white space-y-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-md">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Welcome to Prunance</h2>
            <p className="text-blue-100 text-sm">Let's set up your profile to personalize your experience.</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Your Name</label>
              <input 
                type="text" 
                placeholder="e.g. Alex"
                value={setupData.name}
                onChange={(e) => setSetupData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Preferred Currency</label>
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

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Monthly Income</label>
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

            <button
              onClick={handleFinish}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-100 flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-[0.98] transition-all mt-8"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
