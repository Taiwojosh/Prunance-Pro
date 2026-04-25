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
        
        <div className="p-6 pt-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Add Expense</h2>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

        {/* Quick Add Section */}
        {(profile.quickAdds || []).length > 0 && (
          <section className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
              <Plus className="w-3 h-3" /> Quick Add
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(profile.quickAdds || []).map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleQuickAdd(t)}
                  className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left hover:bg-blue-50 hover:border-blue-100 transition-all group min-w-0"
                >
                  <p className="font-bold text-sm group-hover:text-blue-600 truncate">{t.name}</p>
                  <p className="text-xs text-gray-400 font-mono mt-1 truncate">{formatCurrency(t.amount, profile.currency)}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Manual Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Receipt className="w-3 h-3" /> Manual Entry
          </h3>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                {getCurrencySymbol(profile.currency)}
              </span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-16 pr-4 text-xl font-bold font-mono focus:ring-2 focus:ring-blue-500 transition-all"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "py-3 rounded-xl text-xs font-bold transition-all border",
                    category === c 
                      ? "bg-blue-600 text-white border-blue-600" 
                      : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What for?"
                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold text-gray-600 uppercase">Save as Quick Add?</span>
              </div>
              <button
                type="button"
                onClick={() => setSaveAsTemplate(!saveAsTemplate)}
                className={cn(
                  "w-10 h-6 rounded-full transition-all relative",
                  saveAsTemplate ? "bg-blue-600" : "bg-gray-200"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  saveAsTemplate ? "left-5" : "left-1"
                )} />
              </button>
            </div>
            {saveAsTemplate && (
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template Name (e.g. Morning Coffee)"
                className="w-full bg-white border-none rounded-xl py-2 px-3 text-xs font-medium focus:ring-2 focus:ring-blue-500 transition-all"
              />
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all mt-4"
          >
            Save Expense
          </button>
        </form>
      </div>
    </motion.div>
  </div>
  );
}
