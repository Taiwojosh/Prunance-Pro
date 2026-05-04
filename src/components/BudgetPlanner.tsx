import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatCurrency, cn } from '../lib/utils';
import { Plus, Trash2, PieChart, Wallet, ArrowUpRight, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { startOfMonth, isAfter } from 'date-fns';

import { Category } from '../types';

const CATEGORIES: Category[] = [
  'Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Other'
];

export default function BudgetPlanner() {
  const { profile, updateBudget, expenses } = useFinanceStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBudget, setNewBudget] = useState<{ category: Category; limit: string }>({ category: 'Food', limit: '' });

  const currentMonthStart = startOfMonth(new Date());
  
  const budgetStats = useMemo(() => {
    return (profile.budgets || []).map(budget => {
      const spent = expenses
        .filter(e => e.category === budget.category && isAfter(new Date(e.date), currentMonthStart))
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        ...budget,
        spent,
        remaining: budget.limit - spent,
        percentage: (spent / budget.limit) * 100
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [profile.budgets, expenses, currentMonthStart]);

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.category || !newBudget.limit) return;
    updateBudget(newBudget.category, Number(newBudget.limit));
    setNewBudget({ category: 'Food', limit: '' });
    setShowAddForm(false);
  };

  const handleDeleteBudget = (category: Category) => {
    updateBudget(category, 0);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end px-1">
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100 active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {showAddForm && (
        <motion.form 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleAddBudget}
          className="bg-white p-6 rounded-[2.5rem] border border-blue-50 shadow-sm space-y-4"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Category</label>
            <select 
              value={newBudget.category}
              onChange={(e) => setNewBudget(prev => ({ ...prev, category: e.target.value as Category }))}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Monthly Limit</label>
            <input 
              type="number"
              placeholder="0.00"
              value={newBudget.limit}
              onChange={(e) => setNewBudget(prev => ({ ...prev, limit: e.target.value }))}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-50 active:scale-[0.98] transition-transform">
            Set Budget
          </button>
        </motion.form>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-6 rounded-[2rem] border border-blue-50">
          <div className="bg-blue-100 w-10 h-10 rounded-xl flex items-center justify-center text-blue-600 mb-4">
            <Wallet className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Budgeted</p>
          <p className="text-xl font-bold font-mono">
            {formatCurrency(profile.budgets.reduce((sum, b) => sum + b.limit, 0), profile.currency, profile.privacyMode)}
          </p>
        </div>
        <div className="bg-slate-50 p-6 rounded-[2rem] border border-blue-50">
          <div className="bg-emerald-100 w-10 h-10 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
            <PieChart className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Spent</p>
          <p className="text-xl font-bold font-mono text-emerald-600">
            {formatCurrency(budgetStats.reduce((sum, b) => sum + b.spent, 0), profile.currency, profile.privacyMode)}
          </p>
        </div>
      </div>

      {/* Budget List */}
      <div className="space-y-4">
        {budgetStats.length > 0 ? (
          budgetStats.map((budget) => (
            <motion.div 
              layout
              key={budget.category}
              className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">{budget.category}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Limit:</span>
                    <span className="text-xs font-bold text-gray-900">
                      {formatCurrency(budget.limit, profile.currency, profile.privacyMode)}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteBudget(budget.category)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available</p>
                    <p className={cn(
                      "text-sm font-bold font-mono",
                      budget.remaining < 0 ? "text-red-500" : "text-gray-900"
                    )}>
                      {formatCurrency(budget.remaining, profile.currency, profile.privacyMode)}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Spent</p>
                    <p className="text-sm font-bold font-mono">
                      {Math.round(budget.percentage)}%
                    </p>
                  </div>
                </div>
                <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      budget.percentage > 90 ? "bg-red-500" : budget.percentage > 70 ? "bg-orange-500" : "bg-blue-600"
                    )}
                  />
                </div>
              </div>

              {budget.remaining < 0 ? (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-2xl">
                  <TrendingDown className="w-4 h-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Over budget by {formatCurrency(Math.abs(budget.remaining), profile.currency, profile.privacyMode)}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-blue-50/50 text-blue-600 rounded-2xl">
                  <ArrowUpRight className="w-4 h-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">On track for {budget.category}</p>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <PieChart className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-gray-400 font-medium">No budgets set yet.</p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="text-blue-600 text-sm font-bold uppercase tracking-widest hover:underline"
            >
              Create your first budget
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
