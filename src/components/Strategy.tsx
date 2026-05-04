import React, { useState } from 'react';
import { CalendarClock, Target, Wallet, BarChart3, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import Bills from './Bills';
import Goals from './Goals';
import BudgetPlanner from './BudgetPlanner';

type StrategyMode = 'bills' | 'goals' | 'budget';

export default function Strategy() {
  const [mode, setMode] = useState<StrategyMode>('budget');

  const modes = [
    { id: 'budget', label: 'Allocations', icon: Wallet, description: 'Budget limits & protocols' },
    { id: 'bills', label: 'Obligations', icon: CalendarClock, description: 'Recurring billing cycles' },
    { id: 'goals', label: 'Aspirations', icon: Target, description: 'Long-term capital targets' },
  ] as const;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end px-1">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Strategy</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Resource Planning Hub</p>
        </div>
      </div>

      {/* Segmented Control */}
      <div className="flex bg-slate-100 p-1.5 rounded-[2rem] gap-1 shadow-inner border border-slate-200">
        {modes.map((m) => {
          const isActive = mode === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[1.5rem] transition-all relative overflow-hidden",
                isActive ? "bg-white text-blue-600 shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-slate-400")} />
              <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {mode === 'bills' && <Bills />}
          {mode === 'goals' && <Goals />}
          {mode === 'budget' && <BudgetPlanner />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
