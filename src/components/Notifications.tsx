import React from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { useFinanceStore } from '../store/useFinanceStore';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Trash2, CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Notifications() {
  const { activeAlerts, allAlerts } = useAlerts();
  const { dismissAlert, clearDismissedAlerts, dismissedAlerts } = useFinanceStore();

  const hasAlerts = activeAlerts.length > 0;
  const hasHistory = dismissedAlerts.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-bold">Notifications</h2>
        {hasHistory && (
          <button 
            onClick={clearDismissedAlerts}
            className="text-xs font-bold text-red-600 uppercase flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Clear History
          </button>
        )}
      </div>

      {/* Active Alerts */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1 flex items-center gap-2">
          <Bell className="w-3 h-3" /> Active Alerts ({activeAlerts.length})
        </h3>
        
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {activeAlerts.map((alert) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={alert.id}
                className={cn(
                  "p-5 rounded-3xl border flex gap-4 items-start shadow-sm transition-all bg-white",
                  alert.type === 'critical' ? "border-red-100" :
                  alert.type === 'warning' ? "border-orange-100" : 
                  "border-blue-100"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl",
                  alert.type === 'critical' ? "bg-red-50 text-red-600" :
                  alert.type === 'warning' ? "bg-orange-50 text-orange-600" : 
                  "bg-blue-50 text-blue-600"
                )}>
                  <alert.icon className="w-5 h-5" />
                </div>
                
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-gray-900">{alert.title}</h4>
                    <button 
                      onClick={() => dismissAlert(alert.id)}
                      className="text-gray-300 hover:text-green-500 transition-colors"
                      title="Dismiss"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{alert.message}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {!hasAlerts && (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center space-y-3">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm font-bold text-gray-900">All caught up!</p>
              <p className="text-xs text-gray-400">Your financial health looks stable right now.</p>
            </div>
          )}
        </div>
      </section>

      {/* History */}
      {hasHistory && (
        <section className="space-y-4 opacity-60">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1">Recently Dismissed</h3>
          <div className="space-y-2">
            {allAlerts.filter(a => dismissedAlerts.includes(a.id)).map(alert => (
              <div key={alert.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                <alert.icon className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 truncate">{alert.title}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
