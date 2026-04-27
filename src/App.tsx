/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useFinanceStore } from './store/useFinanceStore';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import QuickTour from './components/QuickTour';
import PrivacyLock from './components/PrivacyLock';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';

// Adaptive Loading: Only load these components when the user clicks their tab
const ExpenseList = lazy(() => import('./components/ExpenseList'));
const ExpenseForm = lazy(() => import('./components/ExpenseForm'));
const Bills = lazy(() => import('./components/Bills'));
const Goals = lazy(() => import('./components/Goals'));
const Reports = lazy(() => import('./components/Reports'));
const Settings = lazy(() => import('./components/Settings'));
const Notifications = lazy(() => import('./components/Notifications'));

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const { init, isInitialized, profile, setProfile } = useFinanceStore();

  useEffect(() => {
    init();
  }, [init]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setProfile({ ...profile, hasSeenJoyride: true });
    }
  };

  const tourSteps = [
    {
      target: '.tour-dashboard',
      content: 'This is your Dashboard. It shows your available balance until next payday.',
      disableBeacon: true,
    },
    {
      target: '.tour-add-expense',
      content: 'Tap here to log a new expense or use a Quick Add template.',
    },
    {
      target: '.tour-navigation',
      content: 'Use this bar to switch between your Expenses history, upcoming Bills, and Savings Goals.',
    }
  ];

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

  if (!isInitialized) return null;

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {profile.hasSeenTour && !profile.hasSeenJoyride && (
        <Joyride
          steps={tourSteps}
          run={true}
          continuous={true}
          showSkipButton={true}
          callback={handleJoyrideCallback}
          styles={{
            options: {
              primaryColor: '#2563eb', // blue-600
              zIndex: 1000,
            }
          }}
        />
      )}
      
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
          <Suspense fallback={
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          }>
            {renderContent()}
          </Suspense>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showExpenseForm && (
          <Suspense fallback={null}>
            <ExpenseForm onClose={() => setShowExpenseForm(false)} />
          </Suspense>
        )}
      </AnimatePresence>
    </Layout>
  );
}

