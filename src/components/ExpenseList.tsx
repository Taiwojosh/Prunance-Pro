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
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-400 font-medium">No expenses logged yet.</p>
        </div>
      )}
    </div>
  );
}
