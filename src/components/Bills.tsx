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
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Vendor/Service</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
              placeholder="e.g. AWS Infrastructure"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Fee</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Next Settlement</label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Interval</label>
            <div className="flex gap-2">
              {['weekly', 'monthly', 'yearly'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f as any)}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border-2 transition-all",
                    frequency === f ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-50 hover:border-slate-100"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-display font-bold text-lg shadow-xl shadow-blue-50 hover:bg-blue-700 active:scale-[0.98] transition-all">
            {editingBillId ? 'Update Subscription' : 'Initialize Obligation'}
          </button>
        </form>
      )}

      <div className="space-y-6">
        {bills.length > 0 ? (
          bills.map((bill) => {
            const isUpcoming = isBefore(new Date(bill.dueDate), addDays(new Date(), 3));
            return (
              <div key={bill.id} className="group bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm flex justify-between items-center gap-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors",
                    isUpcoming ? "bg-orange-50 text-orange-600" : "bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white"
                  )}>
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-slate-900 truncate tracking-tight">{bill.name}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        {format(new Date(bill.dueDate), 'MMMM d')}
                      </p>
                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        {bill.frequency}
                      </p>
                      {isUpcoming && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-lg">
                          <div className="w-1 h-1 rounded-full bg-orange-600 animate-pulse" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Priority</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-xl font-display font-bold text-slate-900">{formatCurrency(bill.amount, profile.currency, profile.privacyMode)}</p>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleEdit(bill)}
                      className="p-2 text-slate-200 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteBill(bill.id)}
                      className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm">
              <Calendar className="w-10 h-10 text-slate-200" />
            </div>
            <div>
              <p className="text-slate-900 font-bold text-lg">No Active Obligations</p>
              <p className="text-slate-400 text-sm">Your recurring bills will be tracks here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
