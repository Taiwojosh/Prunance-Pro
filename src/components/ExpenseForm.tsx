import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Category, QuickAddTemplate } from '../types';
import { X, Receipt, Plus, History, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, getCurrencySymbol, cn } from '../lib/utils';

const categories: Category[] = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Other'];

export default function ExpenseForm({ onClose }: { onClose: () => void }) {
  const { addExpense, profile, addQuickAdd } = useFinanceStore();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    
    const expenseAmount = Number(amount);
    
    addExpense({
      amount: expenseAmount,
      category,
      notes,
      date: new Date(date).toISOString(),
    });

    if (saveAsTemplate && templateName) {
      addQuickAdd({
        name: templateName,
        amount: expenseAmount,
        category
      });
    }

    onClose();
  };

  const handleQuickAdd = (template: QuickAddTemplate) => {
    addExpense({
      amount: template.amount,
      category: template.category,
      notes: `Quick add: ${template.name}`,
      date: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] shadow-2xl overflow-y-auto max-h-[90vh] pb-12"
      >
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 rounded-full" />
        
        <div className="p-8 pt-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold text-slate-900 line-none">New Entry</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Record your transaction</p>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

        {/* Quick Add Section */}
        {(profile.quickAdds || []).length > 0 && (
          <section className="mb-10">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-5 flex items-center gap-2">
              <Plus className="w-3 h-3" /> Frequent
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {(profile.quickAdds || []).map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleQuickAdd(t)}
                  className="p-5 bg-white rounded-3xl border border-slate-100 text-left hover:border-blue-500 hover:shadow-lg hover:shadow-blue-50 transition-all group relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <p className="font-bold text-slate-900 group-hover:text-blue-600 truncate">{t.name}</p>
                    <p className="text-xs text-slate-400 font-bold font-mono mt-1 truncate">{formatCurrency(t.amount, profile.currency)}</p>
                  </div>
                  <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-blue-50 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Manual Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Value</label>
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-display font-bold text-3xl group-focus-within:text-blue-500 transition-colors">
                {getCurrencySymbol(profile.currency)}
              </span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-50 border-2 border-transparent rounded-[2rem] py-8 pl-16 pr-6 text-5xl font-display font-bold tracking-tighter text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-200"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Type</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "px-6 py-3 rounded-2xl text-xs font-bold transition-all border-2",
                    category === c 
                      ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200" 
                      : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">When</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Detail</label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Purpose?"
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all placeholder:text-slate-300"
                />
                <div className="flex flex-wrap gap-2">
                  {(category === 'Food' ? ['Coffee', 'Groceries', 'Lunch', 'Takeout'] :
                    category === 'Transport' ? ['Fuel', 'Uber', 'Parking', 'Toll'] :
                    category === 'Shopping' ? ['Clothes', 'Tech', 'Home', 'Gift'] :
                    ['Standard', 'Service', 'Misc']).map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setNotes(chip)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        notes === chip ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      )}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100/50 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Save className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Recurring Pattern?</span>
                  <p className="text-[10px] text-slate-400 font-medium">Save this setup as a frequent action</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSaveAsTemplate(!saveAsTemplate)}
                className={cn(
                  "w-12 h-7 rounded-full transition-all relative p-1",
                  saveAsTemplate ? "bg-emerald-500" : "bg-slate-200"
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full shadow-sm transition-all",
                  saveAsTemplate ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>
            {saveAsTemplate && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Template ID (e.g. Daily Espresso)"
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold focus:border-blue-500 transition-all outline-none"
                />
              </motion.div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-display font-bold text-lg shadow-2xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Authorize Transaction
          </button>
        </form>
      </div>
    </motion.div>
  </div>
  );
}
