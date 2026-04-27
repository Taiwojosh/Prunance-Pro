import React from 'react';
import { LayoutDashboard, ReceiptText, CalendarClock, Target, PieChart, Settings, Bell, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAlerts } from '../hooks/useAlerts';
import { useFinanceStore } from '../store/useFinanceStore';
import { motion, AnimatePresence } from 'motion/react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Shield } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { activeAlerts } = useAlerts();
  const { profile, togglePrivacyMode } = useFinanceStore();
  const alertCount = activeAlerts.length;

  React.useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initMobileUI = async () => {
      try {
        if (isDark) {
          document.documentElement.classList.add('dark');
          await StatusBar.setBackgroundColor({ color: '#121212' }); // Dark zinc
          await StatusBar.setStyle({ style: Style.Dark });
        } else {
          document.documentElement.classList.remove('dark');
          await StatusBar.setBackgroundColor({ color: '#ffffff' }); // White
          await StatusBar.setStyle({ style: Style.Light });
        }
      } catch (e) {
        // Not on mobile
      }
    };
    initMobileUI();
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: ReceiptText },
    { id: 'bills', label: 'Bills', icon: CalendarClock },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'reports', label: 'Reports', icon: PieChart },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24 font-sans text-[#1a1a1a]">
      <header className="sticky top-0 z-10 bg-white/80 px-6 py-4 backdrop-blur-md border-b border-gray-100 safe-area-top">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="text-xl font-semibold tracking-tight">Prunance</h1>
          <div className="flex items-center gap-1">
            <button 
              onClick={togglePrivacyMode} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              title={profile.privacyMode ? "Show amounts" : "Hide amounts"}
            >
              {profile.privacyMode ? <EyeOff className="w-5 h-5 text-blue-600" /> : <Eye className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setActiveTab('notifications')} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <Bell className={cn("w-5 h-5", activeTab === 'notifications' ? "text-blue-600 fill-blue-50" : "text-gray-500")} />
              {alertCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {alertCount}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('settings')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Settings className={cn("w-5 h-5", activeTab === 'settings' ? "text-blue-600 fill-blue-50" : "text-gray-500")} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-4 py-3 z-20 safe-area-bottom">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-200 relative py-1 px-3 rounded-2xl",
                  isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "fill-blue-50")} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -top-1 w-1 h-1 bg-blue-600 rounded-full"
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
