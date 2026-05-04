import React from 'react';
import { LayoutDashboard, ReceiptText, CalendarClock, Target, PieChart, Settings, Bell, Eye, EyeOff, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAlerts } from '../hooks/useAlerts';
import { useFinanceStore } from '../store/useFinanceStore';
import { motion, AnimatePresence } from 'motion/react';
import Calculator from './Calculator';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { activeAlerts } = useAlerts();
  const { profile, togglePrivacyMode } = useFinanceStore();
  const alertCount = activeAlerts.length;

  const tabs = [
    { id: 'dashboard', label: 'Pulse', icon: LayoutDashboard },
    { id: 'expenses', label: 'Ledger', icon: ReceiptText },
    { id: 'strategy', label: 'Strategy', icon: Wallet },
    { id: 'reports', label: 'Analysis', icon: PieChart },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFC] pb-32 font-sans text-slate-900">
      <header className="sticky top-0 z-20 bg-[#FBFBFC]/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white font-display font-bold text-lg">P</span>
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-slate-900">Prunance</h1>
          </div>
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm ring-1 ring-slate-100">
            <button 
              onClick={togglePrivacyMode} 
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-500"
              title={profile.privacyMode ? "Show amounts" : "Hide amounts"}
            >
              {profile.privacyMode ? <EyeOff className="w-5 h-5 text-blue-600" /> : <Eye className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setActiveTab('notifications')} 
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors relative"
            >
              <Bell className={cn("w-5 h-5", activeTab === 'notifications' ? "text-blue-600 fill-blue-50" : "text-slate-500")} />
              {alertCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {alertCount}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('settings')} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <Settings className={cn("w-5 h-5", activeTab === 'settings' ? "text-blue-600 fill-blue-50" : "text-slate-500")} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <Calculator />

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-slate-900/90 backdrop-blur-2xl border border-white/10 px-4 py-3 rounded-[2.5rem] z-30 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] safe-area-bottom">
        <div className="flex justify-between items-center px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-200 relative py-2 px-1 rounded-2xl",
                  isActive ? "text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "text-blue-400")} />
                <span className="text-[9px] font-bold uppercase tracking-[0.1em]">{tab.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute -top-1 w-12 h-1 bg-blue-500 rounded-full"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
