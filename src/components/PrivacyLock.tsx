import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Delete, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

export default function PrivacyLock() {
  const { profile } = useFinanceStore();
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState(false);

  if (!profile.privacyLock || isUnlocked) return null;

  const handleNumber = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        if (newPin === profile.privacyLock) {
          setIsUnlocked(true);
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center p-8"
    >
      <div className="w-full max-w-xs space-y-12 text-center">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-10 h-10 text-purple-600" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Privacy Lock</h2>
            <p className="text-sm text-gray-400 font-medium uppercase tracking-widest">Enter your 4-digit PIN</p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i}
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-200",
                pin.length > i ? "bg-purple-600 border-purple-600 scale-125" : "border-gray-200",
                error && "bg-red-500 border-red-500 animate-bounce"
              )}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumber(num.toString())}
              className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-700 hover:bg-gray-100 active:scale-90 transition-all"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleNumber('0')}
            className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-700 hover:bg-gray-100 active:scale-90 transition-all"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 active:scale-90 transition-all"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
          Securely stored on your device
        </p>
      </div>
    </motion.div>
  );
}
