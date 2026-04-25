import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatCurrency, getCurrencySymbol, cn } from '../lib/utils';
import { Target, Plus, Trash2, TrendingUp, Calendar, ChevronRight, Lock, Unlock, Settings2, X } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { SavingsGoal } from '../types';
import { motion } from 'motion/react';

export default function Goals() {
  const { goals, addGoal, deleteGoal, topUpGoal, updateGoal, profile } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [contribution, setContribution] = useState('');
  const [customTopUpId, setCustomTopUpId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target || !deadline) return;
    
    if (editingGoalId) {
      updateGoal(editingGoalId, {
        name,
        targetAmount: Number(target),
        deadline: new Date(deadline).toISOString(),
        monthlyContribution: contribution ? Number(contribution) : undefined
      });
    } else {
      addGoal({
        name,
        targetAmount: Number(target),
        currentAmount: 0,
        deadline: new Date(deadline).toISOString(),
        monthlyContribution: contribution ? Number(contribution) : undefined,
        isLocked: false
      });
    }
    
    resetForm();
  };

  const handleEdit = (goal: SavingsGoal) => {
    if (goal.isLocked) return;
    setEditingGoalId(goal.id);
    setName(goal.name);
    setTarget(goal.targetAmount.toString());
    setDeadline(new Date(goal.deadline).toISOString().split('T')[0]);
    setContribution(goal.monthlyContribution?.toString() || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setName('');
    setTarget('');
    setDeadline('');
    setContribution('');
    setEditingGoalId(null);
    setShowForm(false);
  };

  const toggleLock = (goal: SavingsGoal) => {
    updateGoal(goal.id, { isLocked: !goal.isLocked });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-bold">Savings Goals</h2>
        <button 
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className={cn(
            "p-2 rounded-full shadow-lg transition-all",
            showForm ? "bg-gray-100 text-gray-500" : "bg-blue-600 text-white shadow-blue-100"
          )}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
            {editingGoalId ? 'Edit Goal' : 'New Savings Goal'}
          </h3>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Goal Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium"
              placeholder="e.g. New Laptop"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Target Amount</label>
              <input 
                type="number" 
                value={target} 
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Deadline</label>
              <input 
                type="date" 
                value={deadline} 
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Monthly Contribution (Optional)</label>
            <input 
              type="number" 
              value={contribution} 
              onChange={(e) => setContribution(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium"
              placeholder="0.00"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm">
            {editingGoalId ? 'Update Goal' : 'Create Goal'}
          </button>
        </form>
      )}

      <div className="space-y-6">
        {goals.length > 0 ? (
          goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const daysLeft = differenceInDays(new Date(goal.deadline), new Date());
          const projectedDate = goal.monthlyContribution && goal.monthlyContribution > 0
            ? addDays(new Date(), ((goal.targetAmount - goal.currentAmount) / (goal.monthlyContribution / 30)))
            : null;

          return (
            <div key={goal.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 relative overflow-hidden">
              {goal.isLocked && (
                <div className="absolute top-4 right-4 text-blue-600">
                  <Lock className="w-4 h-4" />
                </div>
              )}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg truncate">{goal.name}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">
                      Target: {formatCurrency(goal.targetAmount, profile.currency, profile.privacyMode)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => toggleLock(goal)}
                    className={cn(
                      "p-2 rounded-xl transition-colors",
                      goal.isLocked ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-400 hover:text-blue-600"
                    )}
                  >
                    {goal.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleEdit(goal)}
                    disabled={goal.isLocked}
                    className={cn(
                      "p-2 rounded-xl transition-colors",
                      goal.isLocked ? "bg-gray-50 text-gray-200 cursor-not-allowed" : "bg-gray-50 text-gray-400 hover:text-blue-600"
                    )}
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteGoal(goal.id)}
                    disabled={goal.isLocked}
                    className={cn(
                      "p-2 rounded-xl transition-colors",
                      goal.isLocked ? "bg-gray-50 text-gray-200 cursor-not-allowed" : "bg-gray-50 text-gray-400 hover:text-red-600"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-400 uppercase">Progress</span>
                  <span className="text-blue-600">{Math.round(progress)}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-1">
                  <span>{formatCurrency(goal.currentAmount, profile.currency, profile.privacyMode)} saved</span>
                  <span>{formatCurrency(goal.targetAmount - goal.currentAmount, profile.currency, profile.privacyMode)} left</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Deadline</span>
                  </div>
                  <p className="text-xs font-bold">{format(new Date(goal.deadline), 'MMM d, yyyy')}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{daysLeft} days left</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Projection</span>
                  </div>
                  <p className="text-xs font-bold">
                    {projectedDate ? format(projectedDate, 'MMM yyyy') : 'N/A'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Based on plan</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => topUpGoal(goal.id, 10)}
                  className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl font-bold text-xs hover:bg-blue-100 transition-all"
                >
                  + {getCurrencySymbol(profile.currency)}10
                </button>
                <button 
                  onClick={() => topUpGoal(goal.id, 50)}
                  className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl font-bold text-xs hover:bg-blue-100 transition-all"
                >
                  + {getCurrencySymbol(profile.currency)}50
                </button>
                <button 
                  onClick={() => {
                    if (customTopUpId === goal.id) {
                      if (customAmount && !isNaN(Number(customAmount))) {
                        topUpGoal(goal.id, Number(customAmount));
                        setCustomAmount('');
                        setCustomTopUpId(null);
                      }
                    } else {
                      setCustomTopUpId(goal.id);
                    }
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-xs hover:bg-blue-700 transition-all"
                >
                  {customTopUpId === goal.id ? 'Add' : 'Custom'}
                </button>
              </div>

              {customTopUpId === goal.id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-2 flex gap-2"
                >
                  <input 
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="flex-1 bg-gray-50 border-none rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      setCustomTopUpId(null);
                      setCustomAmount('');
                    }}
                    className="px-4 bg-gray-100 text-gray-500 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                </motion.div>
              )}
            </div>
          );
        })
      ) : (
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-400 font-medium">No savings goals yet.</p>
        </div>
      )}
      </div>
    </div>
  );
}
