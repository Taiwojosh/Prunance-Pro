import React, { useState, useRef } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { personas } from '../lib/mockData';
import { User, Shield, Database, Trash2, UserCircle, Wallet, Plus, Target, Settings2, Download, Upload, RefreshCw, ShieldCheck, HelpCircle, Lock } from 'lucide-react';
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
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Profile Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <UserCircle className="w-3 h-3" /> User Profile
          </h3>
          <button 
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="text-xs font-bold text-blue-600 uppercase"
          >
            {isEditingProfile ? 'Cancel' : 'Edit'}
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          {isEditingProfile ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl py-2 px-3 text-sm font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Monthly Income</label>
                  <input 
                    type="number" 
                    value={editIncome} 
                    onChange={(e) => setEditIncome(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-xl py-2 px-3 text-sm font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Payday (Day of Month)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="31"
                    value={editPayday} 
                    onChange={(e) => setEditPayday(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-xl py-2 px-3 text-sm font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Currency</label>
                  <select 
                    value={editCurrency} 
                    onChange={(e) => setEditCurrency(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-xl py-2 px-3 text-sm font-medium"
                  >
                    {commonCurrencies.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Low Balance Threshold</label>
                  <input 
                    type="number" 
                    value={editThreshold} 
                    onChange={(e) => setEditThreshold(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-xl py-2 px-3 text-sm font-medium"
                  />
                </div>
              </div>
              <button 
                onClick={handleSaveProfile}
                className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold text-sm"
              >
                Save Profile
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                {profile.name[0]}
              </div>
              <div>
                <p className="font-bold text-lg">{profile.name}</p>
                <p className="text-xs text-gray-400 font-medium">Income: {formatCurrency(profile.monthlyIncome, profile.currency, profile.privacyMode)} • Payday: {profile.payday}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Budget Planner Section */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1 flex items-center gap-2">
          <Wallet className="w-3 h-3" /> Budget Planner
        </h3>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          {categories.map(cat => {
            const budget = (profile.budgets || []).find(b => b.category === cat);
            return (
              <div key={cat} className="p-4 flex items-center justify-between gap-4">
                <span className="text-sm font-bold text-gray-700 truncate">{cat}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    {getCurrencySymbol(profile.currency)}
                  </span>
                  <input 
                    type="number"
                    placeholder="0"
                    value={budget?.limit || ''}
                    onChange={(e) => updateBudget(cat, Number(e.target.value))}
                    className="w-20 bg-gray-50 border-none rounded-lg py-1 px-2 text-right text-sm font-bold font-mono"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Adds Management */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1 flex items-center gap-2">
          <Plus className="w-3 h-3" /> Manage Quick Adds
        </h3>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          {(profile.quickAdds || []).map(qa => (
            <div key={qa.id} className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate">{qa.name}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase truncate">{qa.category} • {formatCurrency(qa.amount, profile.currency, profile.privacyMode)}</p>
              </div>
              <button 
                onClick={() => deleteQuickAdd(qa.id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {(profile.quickAdds || []).length === 0 && (
            <div className="p-8 text-center text-xs text-gray-400 font-medium">
              No custom quick-adds yet. Add them from the expense form!
            </div>
          )}
        </div>
      </section>

      {/* Data Management Section */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1 flex items-center gap-2">
          <ShieldCheck className="w-3 h-3" /> Privacy & Security
        </h3>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Lock className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <p className="text-sm font-bold">Privacy Lock</p>
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Require PIN on startup</p>
                </div>
              </div>
              <button
                onClick={() => setShowPinInput(!showPinInput)}
                className={cn(
                  "w-10 h-6 rounded-full transition-all relative",
                  profile.privacyLock ? "bg-purple-600" : "bg-gray-200"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  profile.privacyLock ? "left-5" : "left-1"
                )} />
              </button>
            </div>
            
            {showPinInput && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                <input 
                  type="password"
                  maxLength={4}
                  placeholder="4-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 bg-gray-50 border-none rounded-xl py-2 px-3 text-sm font-bold font-mono text-center tracking-widest"
                />
                <button 
                  onClick={() => {
                    setPrivacyLock(pin || undefined);
                    setShowPinInput(false);
                  }}
                  className="bg-purple-600 text-white px-4 rounded-xl text-xs font-bold"
                >
                  Set
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1 flex items-center gap-2">
          <Database className="w-3 h-3" /> Data Management
        </h3>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          <button 
            onClick={exportData}
            className="w-full p-4 flex items-center gap-4 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <p className="text-sm font-bold">Backup Data</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase">Export all your data to a JSON file</p>
            </div>
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full p-4 flex items-center gap-4 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isImporting ? <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" /> : <Upload className="w-5 h-5 text-blue-600" />}
            <div className="text-left">
              <p className="text-sm font-bold">Restore Data</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase">Import data from a backup file</p>
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
                'Factory Reset?',
                'Are you sure you want to clear all data? This will reset your profile, expenses, bills, and goals. This action cannot be undone.',
                async () => {
                  await clearAllData();
                  window.location.reload();
                }
              );
            }}
            className="w-full p-4 flex items-center gap-4 text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <div className="text-left">
              <p className="text-sm font-bold">Clear All Data</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase">Wipe everything and start fresh</p>
            </div>
          </button>
        </div>
      </section>

      {/* Demo Personas */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1 flex items-center gap-2">
          <Shield className="w-3 h-3" /> Demo Personas
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(personas).map(([key, p]) => (
            <button
              key={key}
              onClick={() => handleLoadPersona(key as any)}
              className="p-4 bg-white rounded-2xl border border-gray-100 text-left hover:border-blue-500 transition-all flex justify-between items-center group gap-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm group-hover:text-blue-600 truncate">{p.profile.name}</p>
                <p className="text-[10px] text-gray-400 font-medium uppercase mt-1 truncate">
                  Income: {formatCurrency(p.profile.monthlyIncome, profile.currency, profile.privacyMode)} • {p.expenses.length} Expenses
                </p>
              </div>
              <Shield className="w-4 h-4 text-gray-200 group-hover:text-blue-500 flex-shrink-0" />
            </button>
          ))}
        </div>
      </section>

      {/* Help & Support */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1 flex items-center gap-2">
          <HelpCircle className="w-3 h-3" /> Help & Support
        </h3>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          <button 
            onClick={async () => {
              // Reset tour flag to false
              const newProfile = { ...profile, hasSeenTour: false };
              await dbHelper.put('profile', { ...newProfile, id: 'current' });
              window.location.reload();
            }}
            className="w-full p-4 flex items-center gap-4 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <p className="text-sm font-bold">Quick Tour</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase">Re-watch the onboarding tour</p>
            </div>
          </button>
          
          <div className="p-4 flex items-center gap-4 text-gray-700">
            <Shield className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <p className="text-sm font-bold">Privacy Policy</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase">Your data never leaves this device</p>
            </div>
          </div>
        </div>
        <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest py-4">
          Prosper Finance v1.0.0
        </p>
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
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <h4 className="text-xl font-bold">{modal.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{modal.message}</p>
              </div>
              <div className="flex gap-3">
                {modal.type === 'confirm' && (
                  <button
                    onClick={() => setModal(null)}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => {
                    if (modal.onConfirm) modal.onConfirm();
                    setModal(null);
                  }}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-2xl font-bold text-sm text-white",
                    modal.type === 'confirm' ? "bg-red-600" : "bg-blue-600"
                  )}
                >
                  {modal.type === 'confirm' ? 'Confirm' : 'OK'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
