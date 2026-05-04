import React, { useState, useRef } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { personas } from '../lib/mockData';
import { User, Shield, Database, Trash2, UserCircle, Wallet, Plus, Target, Settings2, Download, Upload, RefreshCw, ShieldCheck, HelpCircle, Lock, ChevronRight } from 'lucide-react';
import { dbHelper } from '../lib/db';
import { Category } from '../types';
import { formatCurrency, getCurrencySymbol, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const categories: Category[] = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Other'];

const commonCurrencies = [
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'GBP', name: 'British Pound (£)' },
  { code: 'JPY', name: 'Japanese Yen (¥)' },
  { code: 'CAD', name: 'Canadian Dollar ($)' },
  { code: 'AUD', name: 'Australian Dollar ($)' },
  { code: 'CNY', name: 'Chinese Yuan (¥)' },
  { code: 'INR', name: 'Indian Rupee (₹)' },
  { code: 'NGN', name: 'Nigerian Naira (₦)' },
  { code: 'BRL', name: 'Brazilian Real (R$)' },
];

export default function Settings() {
  const { profile, setProfile, updateBudget, deleteQuickAdd, clearAllData, exportData, importData, setPrivacyLock, completeTour } = useFinanceStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editIncome, setEditIncome] = useState(profile.monthlyIncome.toString());
  const [editPayday, setEditPayday] = useState(profile.payday.toString());
  const [editCurrency, setEditCurrency] = useState(profile.currency);
  const [editThreshold, setEditThreshold] = useState(profile.lowBalanceThreshold.toString());
  const [isImporting, setIsImporting] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState(profile.privacyLock || '');
  const [modal, setModal] = useState<{
    type: 'confirm' | 'alert';
    title: string;
    message: string;
    onConfirm?: () => void;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showAlert = (title: string, message: string) => {
    setModal({ type: 'alert', title, message });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModal({ type: 'confirm', title, message, onConfirm });
  };

  const handleSaveProfile = () => {
    setProfile({
      ...profile,
      name: editName,
      monthlyIncome: Number(editIncome),
      payday: Number(editPayday),
      currency: editCurrency,
      lowBalanceThreshold: Number(editThreshold)
    });
    setIsEditingProfile(false);
  };

  const handleLoadPersona = async (personaKey: keyof typeof personas) => {
    showConfirm(
      'Load Persona?',
      'This will clear your current data and load the demo persona. Continue?',
      async () => {
        const p = personas[personaKey];
        await clearAllData();
        
        for (const e of p.expenses) await dbHelper.put('expenses', e);
        for (const b of p.bills) await dbHelper.put('bills', b);
        for (const g of p.goals) await dbHelper.put('goals', g);
        
        setProfile({
          ...p.profile,
          budgets: [],
          hasSeenTour: true,
          quickAdds: [
            { id: 'q1', name: 'Coffee', amount: 4.5, category: 'Food' },
            { id: 'q2', name: 'Lunch', amount: 12, category: 'Food' },
            { id: 'q3', name: 'Bus Fare', amount: 2.5, category: 'Transport' },
            { id: 'q4', name: 'Grocery', amount: 45, category: 'Food' },
          ]
        });
        window.location.reload();
      }
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        await importData(content);
        showAlert('Success', 'Data restored successfully!');
      } catch (error) {
        showAlert('Error', 'Failed to restore data. Please ensure the file is a valid Prosper backup.');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="flex justify-between items-end px-1">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Control</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">System Architecture</p>
        </div>
      </div>

      {/* Profile Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <UserCircle className="w-3 h-3" /> Identity
          </h3>
          <button 
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="text-[10px] font-bold text-blue-600 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all font-display"
          >
            {isEditingProfile ? 'Cancel' : 'Modify'}
          </button>
        </div>
        
        <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm space-y-6">
          {isEditingProfile ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Alias/Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Monthly Inflow</label>
                  <input 
                    type="number" 
                    value={editIncome} 
                    onChange={(e) => setEditIncome(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Pay Cycle Day</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="31"
                    value={editPayday} 
                    onChange={(e) => setEditPayday(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Currency Standard</label>
                  <select 
                    value={editCurrency} 
                    onChange={(e) => setEditCurrency(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none appearance-none"
                  >
                    {commonCurrencies.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Alert Threshold</label>
                  <input 
                    type="number" 
                    value={editThreshold} 
                    onChange={(e) => setEditThreshold(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>
              <button 
                onClick={handleSaveProfile}
                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-display font-bold text-lg shadow-xl shadow-slate-200 active:scale-[0.98] transition-all"
              >
                Apply Protocols
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white font-display font-bold text-3xl shadow-xl shadow-blue-100">
                {profile.name[0]}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-display font-bold text-slate-900 leading-tight">{profile.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                    {profile.currency} • {formatCurrency(profile.monthlyIncome, profile.currency, profile.privacyMode)} Volume
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black tracking-widest uppercase">Verified</div>
                  <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black tracking-widest uppercase">Gold Tier</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Budget & Commands Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-2 flex items-center gap-2">
            <Wallet className="w-3 h-3" /> Allocation
          </h3>
          <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden p-2">
            {categories.map(cat => {
              const budget = (profile.budgets || []).find(b => b.category === cat);
              return (
                <div key={cat} className="p-4 flex items-center justify-between group hover:bg-slate-50 rounded-2xl transition-colors">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{cat}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{getCurrencySymbol(profile.currency)}</span>
                    <input 
                      type="number"
                      placeholder="0"
                      value={budget?.limit || ''}
                      onChange={(e) => updateBudget(cat, Number(e.target.value))}
                      className="w-20 bg-slate-100 border-none rounded-xl py-2 px-3 text-right text-sm font-bold font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-2 flex items-center gap-2">
            <Plus className="w-3 h-3" /> Commands
          </h3>
          <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden p-4 space-y-3">
            {(profile.quickAdds || []).map(qa => (
              <div key={qa.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between group transition-all">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{qa.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{qa.category} • {formatCurrency(qa.amount, profile.currency, profile.privacyMode)}</p>
                </div>
                <button 
                  onClick={() => deleteQuickAdd(qa.id)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors hover:bg-red-50 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(profile.quickAdds || []).length === 0 && (
              <div className="py-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                No custom protocols established.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Security & Data Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-2 flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" /> Security
          </h3>
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">Privacy Vault</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Biometric/PIN Access</p>
                </div>
              </div>
              <button
                onClick={() => setShowPinInput(!showPinInput)}
                className={cn(
                  "w-12 h-7 rounded-full transition-all relative p-1",
                  profile.privacyLock ? "bg-purple-600 shadow-lg shadow-purple-200" : "bg-slate-200"
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full transition-all shadow-sm",
                  profile.privacyLock ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>
            
            {showPinInput && (
              <div className="flex gap-3 animate-in fade-in slide-in-from-top-2">
                <input 
                  type="password"
                  maxLength={4}
                  placeholder="0000"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-xl font-bold font-mono text-center tracking-[0.5em] focus:border-purple-500 outline-none transition-all"
                />
                <button 
                  onClick={() => {
                    setPrivacyLock(pin || undefined);
                    setShowPinInput(false);
                  }}
                  className="bg-purple-600 text-white px-6 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-purple-700 active:scale-95 transition-all"
                >
                  Verify
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-2 flex items-center gap-2">
            <Database className="w-3 h-3" /> Infrastructure
          </h3>
          <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden divide-y divide-slate-50">
            <button 
              onClick={exportData}
              className="w-full p-6 flex items-center gap-5 text-slate-900 hover:bg-slate-50 transition-colors group"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                <Download className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold">Cold Storage Backup</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Serialise records to JSON</p>
              </div>
            </button>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full p-6 flex items-center gap-5 text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50 group"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                {isImporting ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
              </div>
              <div className="text-left">
                <p className="text-lg font-bold">Synchronize Protocol</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Inject archive into hardware</p>
              </div>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".json" 
              className="hidden" 
            />

            <button 
              onClick={() => {
                showConfirm(
                  'Initialization Request?',
                  'This will permanently delete all records from this node. Proceed with wipe?',
                  async () => {
                    await clearAllData();
                    window.location.reload();
                  }
                );
              }}
              className="w-full p-6 flex items-center gap-5 text-red-600 hover:bg-red-50 transition-colors group"
            >
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold">Initialize Wipe</p>
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Reset non-volatile memory</p>
              </div>
            </button>
          </div>
        </section>
      </div>

      {/* Personas Section */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1 flex items-center gap-2">
          <Shield className="w-3 h-3" /> Archetypes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(personas).map(([key, p]) => (
            <button
              key={key}
              onClick={() => handleLoadPersona(key as any)}
              className="p-6 bg-white rounded-[2.5rem] border border-slate-50 shadow-sm text-left hover:border-blue-500 hover:shadow-xl hover:shadow-blue-50 transition-all flex justify-between items-center group gap-4 active:scale-95"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xl font-display font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{p.profile.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                  Strategy: {formatCurrency(p.profile.monthlyIncome, profile.currency, profile.privacyMode)} Volume
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-blue-500 transition-all" />
            </button>
          ))}
        </div>
      </section>

      {/* Support Section */}
      <section className="space-y-6 pt-12 pb-24">
        <div className="bg-slate-900 p-10 rounded-[3rem] text-white text-center space-y-6 relative overflow-hidden group shadow-2xl shadow-slate-200">
          <div className="relative z-10 space-y-4">
            <h4 className="text-3xl font-display font-bold">Institutional Security</h4>
            <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
              Your financial identity is cryptographically isolated on this device. Prunance does not use cloud relays for personal data.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] -ml-24 -mb-24" />
        </div>
        
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
            <Target className="w-6 h-6 text-slate-300" />
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.6em]">Prunance Interface 1.0.2</p>
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Advanced Terminal System</p>
          </div>
        </div>
      </section>

      {/* Custom Modal */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModal(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl space-y-8"
            >
              <div className="text-center space-y-3">
                <h4 className="text-2xl font-display font-bold text-slate-900">{modal.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{modal.message}</p>
              </div>
              <div className="flex gap-3">
                {modal.type === 'confirm' && (
                  <button
                    onClick={() => setModal(null)}
                    className="flex-1 py-4 px-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Abuse
                  </button>
                )}
                <button
                  onClick={() => {
                    if (modal.onConfirm) modal.onConfirm();
                    setModal(null);
                  }}
                  className={cn(
                    "flex-1 py-4 px-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-white active:scale-95 transition-all shadow-lg",
                    modal.type === 'confirm' ? "bg-red-600 shadow-red-100" : "bg-slate-900 shadow-slate-100"
                  )}
                >
                  {modal.type === 'confirm' ? 'Confirm' : 'Accept'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
