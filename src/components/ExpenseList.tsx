import React from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatCurrency, cn } from '../lib/utils';
import { Trash2, ShoppingBag, Coffee, Car, Film, Heart, FileText, MoreHorizontal, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const categoryIcons: Record<string, any> = {
  Food: Coffee,
  Transport: Car,
  Shopping: ShoppingBag,
  Entertainment: Film,
  Health: Heart,
  Bills: FileText,
  Other: MoreHorizontal,
};

export default function ExpenseList() {
  const { expenses, deleteExpense, profile } = useFinanceStore();

  const groupedExpenses = expenses.reduce((groups: any, expense) => {
    const date = format(new Date(expense.date), 'MMMM d, yyyy');
    if (!groups[date]) groups[date] = [];
    groups[date].push(expense);
    return groups;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-bold">History</h2>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {expenses.length} Transactions
        </span>
      </div>

      {Object.keys(groupedExpenses).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedExpenses).map(([date, items]: [string, any]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1">{date}</h3>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                <AnimatePresence mode="popLayout">
                  {items.map((expense: any) => {
                    const Icon = categoryIcons[expense.category] || MoreHorizontal;
                    return (
                      <motion.div 
                        key={expense.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="relative group overflow-hidden"
                      >
                        {/* Delete Background */}
                        <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-6">
                          <Trash2 className="w-5 h-5 text-white" />
                        </div>

                        {/* Swipeable Content */}
                        <motion.div
                          drag="x"
                          dragConstraints={{ left: -100, right: 0 }}
                          dragElastic={0.1}
                          onDragEnd={(_, info) => {
                            if (info.offset.x < -80) {
                              deleteExpense(expense.id);
                            }
                          }}
                          className="relative bg-white p-4 flex items-center justify-between gap-4 touch-pan-y"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-colors flex-shrink-0">
                              <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm truncate">{expense.notes || expense.category}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{expense.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <p className="font-bold text-sm font-mono whitespace-nowrap">{formatCurrency(expense.amount, profile.currency, profile.privacyMode)}</p>
                            <div className="w-1 h-8 bg-gray-100 rounded-full ml-2 opacity-20" />
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center flex flex-col items-center justify-center">
          <svg className="w-32 h-32 mb-6 text-gray-200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="currentColor" fillOpacity="0.3"/>
            <path d="M100 60V140M60 100H140" stroke="white" strokeWidth="8" strokeLinecap="round"/>
            <path d="M130 60C130 60 145 75 145 100C145 125 130 140 130 140" stroke="white" strokeWidth="8" strokeLinecap="round" opacity="0.5"/>
            <path d="M70 60C70 60 55 75 55 100C55 125 70 140 70 140" stroke="white" strokeWidth="8" strokeLinecap="round" opacity="0.5"/>
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No expenses yet</h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest max-w-[200px]">
            Your spending history will appear here
          </p>
        </div>
      )}
    </div>
  );
}
