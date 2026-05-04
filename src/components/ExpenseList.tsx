import React from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatCurrency, cn } from '../lib/utils';
import { Trash2, ShoppingBag, Coffee, Car, Film, Heart, FileText, MoreHorizontal, Receipt, Search, Filter } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Category } from '../types';

const categories: Category[] = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Other'];

const categoryIcons: Record<string, any> = {
  Food: Coffee,
  Transport: Car,
  Shopping: ShoppingBag,
  Entertainment: Film,
  Health: Heart,
  Bills: FileText,
  Other: MoreHorizontal,
};

function formatDateLabel(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE, MMM d');
}

export default function ExpenseList() {
  const { expenses, deleteExpense, profile } = useFinanceStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<string>('All');

  const filteredExpenses = expenses.filter(e => 
    (searchTerm === '' || e.category.toLowerCase().includes(searchTerm.toLowerCase()) || (e.notes || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
    (activeFilter === 'All' || e.category === activeFilter)
  );

  const groupedExpenses = filteredExpenses.reduce((groups: any, expense) => {
    const date = format(new Date(expense.date), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(expense);
    return groups;
  }, {});

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex justify-between items-end px-1">
          <div>
            <h2 className="text-3xl font-display font-bold text-slate-900">Ledger</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Movement of Funds</p>
          </div>
          <div className="flex gap-2">
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
              {filteredExpenses.length} Entries
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-[1.5rem] py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 shadow-sm transition-all outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
            {['All', ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border-2 whitespace-nowrap transition-all active:scale-95",
                  activeFilter === cat 
                    ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200" 
                    : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {Object.keys(groupedExpenses).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedExpenses).sort((a, b) => b[0].localeCompare(a[0])).map(([date, items]: [string, any]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-4 px-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                  {formatDateLabel(date)}
                </span>
                <div className="h-px w-full bg-slate-100" />
              </div>
              
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {items.map((expense: any) => {
                    const Icon = categoryIcons[expense.category] || MoreHorizontal;
                    return (
                      <motion.div 
                        key={expense.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group relative bg-white p-5 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 truncate">{expense.notes || expense.category}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{expense.category}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-200" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {format(new Date(expense.date), 'h:mm a')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <p className="text-lg font-display font-bold text-slate-900">
                            -{formatCurrency(expense.amount, profile.currency, profile.privacyMode)}
                          </p>
                          <button 
                            onClick={() => deleteExpense(expense.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all md:opacity-0 md:group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm">
            <Receipt className="w-10 h-10 text-slate-200" />
          </div>
          <div>
            <p className="text-slate-900 font-bold text-lg">Clean slate</p>
            <p className="text-slate-400 text-sm max-w-[200px] mx-auto">No transactions match your current view or Ledger is empty.</p>
          </div>
        </div>
      )}
    </div>
  );
}
