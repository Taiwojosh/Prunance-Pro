import React, { useMemo } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAlerts } from '../hooks/useAlerts';
import { formatCurrency, cn } from '../lib/utils';
import { AlertCircle, TrendingUp, TrendingDown, CheckCircle2, ArrowRight, Plus, Target, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { format, addDays, isAfter, isBefore, startOfWeek, endOfWeek, subWeeks, startOfMonth } from 'date-fns';
import { getTipOfTheDay } from '../lib/tips';

export default function Dashboard({ onAddExpense, onNavigate }: { onAddExpense: () => void, onNavigate: (tab: string) => void }) {
  const { expenses, bills, goals, profile } = useFinanceStore();
  const { activeAlerts } = useAlerts();

  const upcomingBills = useMemo(() => {
    const next7Days = addDays(new Date(), 7);
    return bills
      .filter(b => isBefore(new Date(b.dueDate), next7Days))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [bills]);

  const budgetProgress = useMemo(() => {
    const currentMonthStart = startOfMonth(new Date());
    const monthExpenses = expenses.filter(e => isAfter(new Date(e.date), currentMonthStart));
    
    return (profile.budgets || []).map(budget => {
      const spent = monthExpenses
        .filter(e => e.category === budget.category)
        .reduce((sum, e) => sum + e.amount, 0);
      return { ...budget, spent };
    });
  }, [expenses, profile.budgets]);

  const totalUpcoming = upcomingBills.reduce((sum, b) => sum + b.amount, 0);

  const dailyTip = useMemo(() => getTipOfTheDay(), []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Pull to Refresh Indicator (Visual) */}
      <motion.div 
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={() => window.location.reload()}
        className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none"
      >
        <div className="bg-white p-2 rounded-full shadow-md border border-gray-100">
          <Plus className="w-4 h-4 text-blue-600 animate-spin" />
        </div>
      </motion.div>

      {/* Welcome Section */}
      <section className="flex justify-between items-end">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Welcome back,</p>
          <h2 className="text-3xl font-bold tracking-tight">{profile.name || 'Friend'}</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Today</p>
          <p className="text-sm font-bold text-gray-900">{format(new Date(), 'MMM d, yyyy')}</p>
        </div>
      </section>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-blue-50 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 truncate">Monthly Income</p>
            <p className="text-xl font-bold font-mono text-emerald-600 truncate" title={formatCurrency(profile.monthlyIncome, profile.currency, profile.privacyMode)}>
              {formatCurrency(profile.monthlyIncome, profile.currency, profile.privacyMode)}
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-100/30 rounded-full blur-xl" />
        </div>
        <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-blue-50 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 truncate">Upcoming Bills</p>
            <p className="text-xl font-bold font-mono text-orange-600 truncate" title={formatCurrency(totalUpcoming, profile.currency, profile.privacyMode)}>
              {formatCurrency(totalUpcoming, profile.currency, profile.privacyMode)}
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-orange-100/30 rounded-full blur-xl" />
        </div>
      </div>

      {/* Prudence Tip */}
      <section className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Prudence Tip</span>
          </div>
          <p className="text-lg font-medium leading-tight text-gray-900">"{dailyTip}"</p>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-50" />
      </section>

      {/* Budget Progress */}
      {budgetProgress.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1">Monthly Budgets</h3>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
            {budgetProgress.map(budget => {
              const percent = (budget.spent / budget.limit) * 100;
              return (
                <div key={budget.category} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold gap-2">
                    <span className="text-gray-700 truncate">{budget.category}</span>
                    <span className={cn("flex-shrink-0", percent > 100 ? "text-red-600" : "text-gray-400")}>
                      {formatCurrency(budget.spent, profile.currency, profile.privacyMode)} / {formatCurrency(budget.limit, profile.currency, profile.privacyMode)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percent, 100)}%` }}
                      className={cn(
                        "h-full rounded-full transition-all",
                        percent > 100 ? "bg-red-500" : percent > 80 ? "bg-orange-500" : "bg-blue-500"
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Upcoming Bills Widget */}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-sm">Upcoming Bills</h3>
          <span className="text-[10px] font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-500 uppercase tracking-widest">
            Next 7 Days
          </span>
        </div>
        <div className="divide-y divide-gray-50">
          {upcomingBills.length > 0 ? (
            upcomingBills.map(bill => (
              <div key={bill.id} className="p-5 flex justify-between items-center hover:bg-gray-50 transition-colors gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm truncate">{bill.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 truncate">
                    Due {format(new Date(bill.dueDate), 'MMM d')}
                  </p>
                </div>
                <p className="font-bold text-sm font-mono whitespace-nowrap">{formatCurrency(bill.amount, profile.currency, profile.privacyMode)}</p>
              </div>
            ))
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">All Clear!</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No bills due this week</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Savings Goals Preview */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Savings Goals</h3>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('goals')}
            className="text-blue-600 text-xs font-bold flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </motion.button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {goals.length > 0 ? (
            goals.map(goal => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal.id} className="min-w-[180px] bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-4">
                  <div className="relative w-14 h-14">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="#f3f4f6" strokeWidth="5" />
                      <circle 
                        cx="28" cy="28" r="24" fill="none" stroke="#3b82f6" strokeWidth="5" 
                        strokeDasharray={150.8} 
                        strokeDashoffset={150.8 - (150.8 * Math.min(progress, 100)) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                      {Math.round(progress)}%
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{goal.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 truncate">
                      {formatCurrency(goal.currentAmount, profile.currency, profile.privacyMode)} / {formatCurrency(goal.targetAmount, profile.currency, profile.privacyMode)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="w-full bg-white p-10 rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-400">No active goals</p>
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Start saving for your dreams</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Floating Action Button for Quick Add */}
      <motion.button 
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        onClick={onAddExpense}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200 flex items-center justify-center transition-all z-30"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </motion.div>
  );
}
