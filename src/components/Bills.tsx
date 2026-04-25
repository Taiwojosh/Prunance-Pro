import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatCurrency, cn } from '../lib/utils';
import { Calendar, Plus, Trash2, Bell, CheckCircle2, X, Settings2 } from 'lucide-react';
import { format, addDays, isAfter, isBefore } from 'date-fns';
import { Bill, Category } from '../types';

export default function Bills() {
  const { bills, addBill, deleteBill, updateBill, profile } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDate) return;
    
    if (editingBillId) {
      updateBill(editingBillId, {
        name,
        amount: Number(amount),
        dueDate: new Date(dueDate).toISOString(),
        frequency,
      });
    } else {
      addBill({
        name,
        amount: Number(amount),
        dueDate: new Date(dueDate).toISOString(),
        frequency,
        category: 'Bills'
      });
    }
    
    resetForm();
  };

  const handleEdit = (bill: Bill) => {
    setEditingBillId(bill.id);
    setName(bill.name);
    setAmount(bill.amount.toString());
    setDueDate(new Date(bill.dueDate).toISOString().split('T')[0]);
    setFrequency(bill.frequency);
    setShowForm(true);
  };

  const resetForm = () => {
    setName('');
    setAmount('');
    setDueDate('');
    setFrequency('monthly');
    setEditingBillId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-bold">Recurring Bills</h2>
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
            {editingBillId ? 'Edit Bill' : 'New Recurring Bill'}
          </h3>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Bill Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium"
              placeholder="e.g. Netflix"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Amount</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Due Date</label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Frequency</label>
            <div className="flex gap-2">
              {['weekly', 'monthly', 'yearly'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f as any)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                    frequency === f ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-400 border-gray-100"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm">
            {editingBillId ? 'Update Bill' : 'Add Recurring Bill'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {bills.length > 0 ? (
          bills.map((bill) => {
            const isUpcoming = isBefore(new Date(bill.dueDate), addDays(new Date(), 3));
            return (
              <div key={bill.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center group gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className={cn(
                    "p-3 rounded-2xl flex-shrink-0",
                    isUpcoming ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-400"
                  )}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{bill.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                        {format(new Date(bill.dueDate), 'MMM d')} • {bill.frequency}
                      </p>
                      {isUpcoming && (
                        <span className="flex items-center gap-1 text-[8px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full uppercase flex-shrink-0">
                          <Bell className="w-2 h-2" /> Reminder Sent
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <p className="font-bold text-sm font-mono whitespace-nowrap">{formatCurrency(bill.amount, profile.currency, profile.privacyMode)}</p>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleEdit(bill)}
                      className="p-2 text-gray-200 hover:text-blue-500 transition-colors"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteBill(bill.id)}
                      className="p-2 text-gray-200 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">No recurring bills yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
