/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useFinanceStore } from './store/useFinanceStore';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Bills from './components/Bills';
import Goals from './components/Goals';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Notifications from './components/Notifications';
import QuickTour from './components/QuickTour';
import PrivacyLock from './components/PrivacyLock';
import SplashScreen from './components/SplashScreen';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const { init } = useFinanceStore();

  useEffect(() => {
    (useFinanceStore.getState() as any).init();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onAddExpense={() => setShowExpenseForm(true)} onNavigate={setActiveTab} />;
      case 'expenses':
        return <ExpenseList />;
      case 'bills':
        return <Bills />;
      case 'goals':
        return <Goals />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'notifications':
        return <Notifications />;
      default:
        return <Dashboard onAddExpense={() => setShowExpenseForm(true)} onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <SplashScreen />
      <PrivacyLock />
      <QuickTour />
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showExpenseForm && (
          <ExpenseForm onClose={() => setShowExpenseForm(false)} />
        )}
      </AnimatePresence>
    </Layout>
  );
}

