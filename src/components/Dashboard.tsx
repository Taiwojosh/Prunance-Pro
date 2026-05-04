import React, { useMemo } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAlerts } from '../hooks/useAlerts';
import { formatCurrency, cn } from '../lib/utils';
import { AlertCircle, TrendingUp, TrendingDown, CheckCircle2, ArrowRight, Plus, Target, Sparkles, CalendarClock, Activity } from 'lucide-react';
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

  const systemHealth = useMemo(() => {
    const totalLimit = budgetProgress.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgetProgress.reduce((sum, b) => sum + b.spent, 0);
    if (totalLimit === 0) return 100;
    const usage = (totalSpent / totalLimit) * 100;
    return Math.max(0, 100 - usage);
  }, [budgetProgress]);

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
      <section className="flex justify-between items-start pt-4">
        <div className="space-y-1">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Live Portfolio</span>
          </motion.div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900">
            Hello, <span className="text-blue-600">{profile.name || 'Friend'}</span>
          </h2>
        </div>
        <div className="bg-white/50 backdrop-blur-md border border-white p-3 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Portfolio Value</p>
          <p className="text-lg font-display font-bold text-slate-900">
            {formatCurrency(profile.monthlyIncome - expenses.reduce((sum, e) => sum + e.amount, 0), profile.currency, profile.privacyMode)}
          </p>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-6 grid-rows-3 gap-4 h-[420px]">
        {/* Main Income Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="col-span-4 row-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between"
        >
          <div className="relative z-10 space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Monthly Revenue</p>
            <h3 className="text-5xl font-display font-bold leading-none tracking-tighter">
              {formatCurrency(profile.monthlyIncome, profile.currency, profile.privacyMode)}
            </h3>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5% from last month</span>
            </div>
          </div>

          {/* Abstract background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] -ml-24 -mb-24" />
        </motion.div>

        {/* Info Card: Tip */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="col-span-2 row-span-1 bg-blue-600 rounded-[2.5rem] p-6 text-white relative overflow-hidden flex flex-col justify-center"
        >
          <Sparkles className="w-6 h-6 mb-3 text-blue-200" />
          <p className="text-[11px] leading-snug font-medium italic opacity-90 line-clamp-3">
            "{dailyTip}"
          </p>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        </motion.div>

        {/* Info Card: Bills */}
        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => onNavigate('strategy')}
          className="col-span-2 row-span-1 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-center gap-1 cursor-pointer"
        >
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">To Pay</p>
          <p className="text-2xl font-display font-bold text-orange-600">
            {formatCurrency(totalUpcoming, profile.currency, profile.privacyMode)}
          </p>
          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
            <CalendarClock className="w-3 h-3" />
            <span>7 DAYS REMAINING</span>
          </div>
        </motion.div>

        {/* Info Card: Budget Stats */}
        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => onNavigate('strategy')}
          className="col-span-3 row-span-1 bg-[#F1F5F9] rounded-[2.5rem] p-6 flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Budget Utility</p>
            <p className="text-2xl font-display font-bold text-slate-900">
              {budgetProgress.length > 0 
                ? Math.round((budgetProgress.reduce((sum, b) => sum + b.spent, 0) / budgetProgress.reduce((sum, b) => sum + b.limit, 0)) * 100) 
                : 0}%
            </p>
          </div>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
            <Plus className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Info Card: System Health */}
        <div className="col-span-3 row-span-1 bg-white rounded-[2.5rem] p-6 flex flex-col justify-between relative overflow-hidden border border-slate-100 shadow-sm group">
          <div className="flex justify-between items-start relative z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Health</p>
            <div className={cn(
              "w-6 h-6 rounded-lg flex items-center justify-center transition-colors",
              systemHealth > 50 ? "bg-emerald-50 text-emerald-600" :
              systemHealth > 20 ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"
            )}>
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="space-y-2 relative z-10">
            <div className="flex items-end gap-1.5">
              <span className="text-3xl font-display font-bold text-slate-900 tracking-tight">
                {systemHealth > 80 ? 'Prime' : systemHealth > 50 ? 'Stable' : systemHealth > 20 ? 'Degraded' : 'Critical'}
              </span>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest pb-1.5",
                systemHealth > 50 ? "text-emerald-500" :
                systemHealth > 20 ? "text-orange-500" : "text-red-500"
              )}>
                {Math.round(systemHealth)}%
              </span>
            </div>
            <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${systemHealth}%` }}
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  systemHealth > 50 ? "bg-emerald-500" :
                  systemHealth > 20 ? "bg-orange-500" : "bg-red-500"
                )}
              />
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-slate-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
        </div>
      </div>

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
            onClick={() => onNavigate('strategy')}
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
