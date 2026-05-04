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
      <div className="flex justify-end px-1">
        <button 
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className={cn(
            "p-3 rounded-2xl shadow-lg transition-all",
            showForm ? "bg-slate-100 text-slate-500" : "bg-blue-600 text-white shadow-blue-100 active:scale-95"
          )}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Asset/Goal Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
              placeholder="e.g. Real Estate Downpayment"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Target Capital</label>
              <input 
                type="number" 
                value={target} 
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Horizon Date</label>
              <input 
                type="date" 
                value={deadline} 
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Monthly Yield (Optional)</label>
            <input 
              type="number" 
              value={contribution} 
              onChange={(e) => setContribution(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
              placeholder="0.00"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-display font-bold text-lg shadow-xl shadow-blue-50 hover:bg-blue-700 active:scale-[0.98] transition-all">
            {editingGoalId ? 'Update Aspiration' : 'Initialize Strategy'}
          </button>
        </form>
      )}

      <div className="space-y-8">
        {goals.length > 0 ? (
          goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const daysLeft = differenceInDays(new Date(goal.deadline), new Date());
          const projectedDate = goal.monthlyContribution && goal.monthlyContribution > 0
            ? addDays(new Date(), ((goal.targetAmount - goal.currentAmount) / (goal.monthlyContribution / 30)))
            : null;

          return (
            <div key={goal.id} className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm space-y-8 group transition-all hover:shadow-xl hover:shadow-slate-100">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                    <Target className="w-8 h-8" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-2xl font-display font-bold text-slate-900 truncate tracking-tight">{goal.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Objective</span>
                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] font-mono">
                        {formatCurrency(goal.targetAmount, profile.currency, profile.privacyMode)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl">
                  <button 
                    onClick={() => toggleLock(goal)}
                    className={cn(
                      "p-2.5 rounded-xl transition-all active:scale-95",
                      goal.isLocked ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-900"
                    )}
                  >
                    {goal.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleEdit(goal)}
                    disabled={goal.isLocked}
                    className={cn(
                      "p-2.5 rounded-xl transition-all active:scale-95",
                      goal.isLocked ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:text-blue-600"
                    )}
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteGoal(goal.id)}
                    disabled={goal.isLocked}
                    className={cn(
                      "p-2.5 rounded-xl transition-all active:scale-95",
                      goal.isLocked ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:text-red-500"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Current Equilibrium</p>
                    <p className="text-3xl font-display font-bold text-slate-900">
                      {formatCurrency(goal.currentAmount, profile.currency, profile.privacyMode)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Completion</p>
                    <p className="text-xl font-display font-bold text-blue-600">{Math.round(progress)}%</p>
                  </div>
                </div>
                <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                  />
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  <span>Authorized Capital</span>
                  <span>Gap: {formatCurrency(goal.targetAmount - goal.currentAmount, profile.currency, profile.privacyMode)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100/50">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Maturity Date</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{format(new Date(goal.deadline), 'MMMM d, yyyy')}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{daysLeft} Days Remaining</p>
                </div>
                <div className="bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100/50">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Pace Analysis</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {projectedDate ? format(projectedDate, 'MMMM yyyy') : 'Inactive'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Est. Reality</p>
                </div>
              </div>

              <div className="flex gap-3">
                {[10, 50].map((val) => (
                  <button 
                    key={val}
                    onClick={() => topUpGoal(goal.id, val)}
                    className="flex-1 bg-white border-2 border-slate-100 text-slate-900 py-4 rounded-3xl font-bold text-xs hover:border-blue-500 hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Deploy {getCurrencySymbol(profile.currency)}{val}
                  </button>
                ))}
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
                  className="flex-[1.5] bg-slate-900 text-white py-4 rounded-3xl font-display font-bold text-xs hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                  {customTopUpId === goal.id ? 'Authorize' : 'Custom Deployment'}
                </button>
              </div>

              {customTopUpId === goal.id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-2 flex gap-3"
                >
                  <input 
                    type="number"
                    placeholder="Enter amount..."
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 text-sm font-bold focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      setCustomTopUpId(null);
                      setCustomAmount('');
                    }}
                    className="px-6 bg-slate-100 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest"
                  >
                    Abuse
                  </button>
                </motion.div>
              )}
            </div>
          );
        })
      ) : (
        <div className="py-24 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm">
            <Target className="w-10 h-10 text-slate-200" />
          </div>
          <div>
            <p className="text-slate-900 font-bold text-lg">No Active Aspirations</p>
            <p className="text-slate-400 text-sm">Define what you are saving for.</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
