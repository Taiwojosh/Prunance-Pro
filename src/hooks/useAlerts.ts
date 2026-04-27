import { useMemo, useEffect, useRef } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatCurrency } from '../lib/utils';
import { AlertCircle, TrendingUp, Target, LucideIcon } from 'lucide-react';
import { format, addDays, isAfter, isBefore, startOfWeek, subWeeks, startOfMonth } from 'date-fns';
import { notificationService } from '../services/notificationService';

export interface Alert {
  id: string;
  type: 'warning' | 'info' | 'critical';
  title: string;
  message: string;
  icon: LucideIcon;
  isCritical: boolean;
}

export function useAlerts() {
  const { expenses, bills, goals, profile, dismissedAlerts } = useFinanceStore();
  const lastAlertCount = useRef(0);

  const alerts = useMemo(() => {
    const activeAlerts: Alert[] = [];
    const today = new Date();
    
    // 1. Projected Balance Alert
    let lastPayday = new Date(today.getFullYear(), today.getMonth(), profile.payday);
    if (isAfter(lastPayday, today)) {
      lastPayday = new Date(today.getFullYear(), today.getMonth() - 1, profile.payday);
    }
    
    const nextPayday = new Date(lastPayday);
    nextPayday.setMonth(nextPayday.getMonth() + 1);

    const expensesSincePayday = expenses.filter(e => isAfter(new Date(e.date), lastPayday));
    const totalSpentSincePayday = expensesSincePayday.reduce((sum, e) => sum + e.amount, 0);

    const upcomingBills = bills.filter(b => {
      const due = new Date(b.dueDate);
      return isAfter(due, today) && isBefore(due, nextPayday);
    });
    const totalUpcomingBills = upcomingBills.reduce((sum, b) => sum + b.amount, 0);
    
    const last30Days = expenses.filter(e => isAfter(new Date(e.date), addDays(today, -30)));
    const avgDailySpending = last30Days.length > 0 ? last30Days.reduce((sum, e) => sum + e.amount, 0) / 30 : 0;
    const daysUntilPayday = Math.max(1, (nextPayday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const projectedFutureSpending = avgDailySpending * daysUntilPayday;
    const projectedBalance = profile.monthlyIncome - totalSpentSincePayday - totalUpcomingBills - projectedFutureSpending;

    if (projectedBalance < 0) {
      activeAlerts.push({
        id: 'critical-balance',
        type: 'critical',
        title: 'Critical: Negative Balance Projected',
        message: `You are projected to run out of money before payday (${format(nextPayday, 'MMM d')}). Projected: ${formatCurrency(projectedBalance, profile.currency)}`,
        icon: AlertCircle,
        isCritical: true
      });
    } else if (projectedBalance < profile.lowBalanceThreshold) {
      activeAlerts.push({
        id: 'low-balance',
        type: 'warning',
        title: 'Low Balance Alert',
        message: `Projected balance may drop below ${formatCurrency(profile.lowBalanceThreshold, profile.currency)} before payday.`,
        icon: AlertCircle,
        isCritical: false
      });
    }

    // 2. Spending Anomaly Detection
    const currentWeekStart = startOfWeek(today);
    const currentWeekExpenses = expenses.filter(e => isAfter(new Date(e.date), currentWeekStart));
    const currentWeekTotal = currentWeekExpenses.reduce((sum, e) => sum + e.amount, 0);

    const last8WeeksStart = subWeeks(currentWeekStart, 8);
    const last8WeeksExpenses = expenses.filter(e => isAfter(new Date(e.date), last8WeeksStart) && isBefore(new Date(e.date), currentWeekStart));
    const avgWeeklySpending = last8WeeksExpenses.reduce((sum, e) => sum + e.amount, 0) / 8;

    if (currentWeekTotal > avgWeeklySpending * 1.5 && avgWeeklySpending > 0) {
      activeAlerts.push({
        id: 'anomaly-critical',
        type: 'critical',
        title: 'Critical Spending Spike',
        message: `Your spending this week is 50% higher than your average!`,
        icon: TrendingUp,
        isCritical: true
      });
    } else if (currentWeekTotal > avgWeeklySpending * 1.2 && avgWeeklySpending > 0) {
      activeAlerts.push({
        id: 'anomaly',
        type: 'info',
        title: 'Spending Spike',
        message: `Your spending this week is 20% higher than your 8-week average.`,
        icon: TrendingUp,
        isCritical: false
      });
    }

    // 3. Savings Goal Pacing
    goals.forEach(goal => {
      const deadline = new Date(goal.deadline);
      const daysLeft = Math.max(1, (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (goal.monthlyContribution) {
        const monthsLeft = daysLeft / 30;
        const projectedTotal = goal.currentAmount + (goal.monthlyContribution * monthsLeft);
        if (projectedTotal < goal.targetAmount) {
          activeAlerts.push({
            id: `goal-${goal.id}`,
            type: 'warning',
            title: `Goal Behind: ${goal.name}`,
            message: `You're behind by ${formatCurrency(goal.targetAmount - projectedTotal, profile.currency)} to reach this goal on time.`,
            icon: Target,
            isCritical: false
          });
        }
      }
    });

    // 4. Budget Overages
    const currentMonthStart = startOfMonth(today);
    const monthExpenses = expenses.filter(e => isAfter(new Date(e.date), currentMonthStart));
    
    (profile.budgets || []).forEach(budget => {
      const spent = monthExpenses
        .filter(e => e.category === budget.category)
        .reduce((sum, e) => sum + e.amount, 0);
      
      if (spent > budget.limit * 1.5) {
        activeAlerts.push({
          id: `budget-critical-${budget.category}`,
          type: 'critical',
          title: `Critical Overage: ${budget.category}`,
          message: `You've exceeded your ${budget.category} budget by over 50%! (${formatCurrency(spent - budget.limit, profile.currency)})`,
          icon: AlertCircle,
          isCritical: true
        });
      } else if (spent > budget.limit) {
        activeAlerts.push({
          id: `budget-${budget.category}`,
          type: 'warning',
          title: `Over Budget: ${budget.category}`,
          message: `You've exceeded your ${budget.category} budget by ${formatCurrency(spent - budget.limit, profile.currency)}.`,
          icon: AlertCircle,
          isCritical: false
        });
      } else if (spent > budget.limit * 0.8) {
        activeAlerts.push({
          id: `budget-near-${budget.category}`,
          type: 'info',
          title: `Near Budget: ${budget.category}`,
          message: `You've used ${Math.round((spent / budget.limit) * 100)}% of your ${budget.category} budget.`,
          icon: AlertCircle,
          isCritical: false
        });
      }
    });

    return activeAlerts;
  }, [expenses, bills, goals, profile]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => !dismissedAlerts.includes(alert.id));
  }, [alerts, dismissedAlerts]);

  const criticalAlerts = useMemo(() => {
    return filteredAlerts.filter(alert => alert.isCritical);
  }, [filteredAlerts]);

  useEffect(() => {
    // Request permissions on mount
    notificationService.requestPermissions();
  }, []);

  useEffect(() => {
    if (!profile.name || useFinanceStore.getState().isInitialized === false) return;

    // Check which alerts have NOT been notified yet
    const notifiedIds = profile.notifiedAlerts || [];
    const unnotifiedAlerts = filteredAlerts.filter(alert => !notifiedIds.includes(alert.id));

    if (unnotifiedAlerts.length > 0) {
      unnotifiedAlerts.forEach(alert => {
        notificationService.schedule(alert.title, alert.message);
        useFinanceStore.getState().markAlertAsNotified(alert.id);
      });
    }

    // 5. Security Alert (One time)
    if (!profile.privacyLock && !notifiedIds.includes('security-lock-suggest')) {
      notificationService.schedule(
        'Secure Your Data', 
        'Tap to set up a Privacy Lock and protect your financial info.'
      );
      useFinanceStore.getState().markAlertAsNotified('security-lock-suggest');
    }
  }, [filteredAlerts, profile.notifiedAlerts, profile.name]);

  return {
    allAlerts: alerts,
    activeAlerts: filteredAlerts,
    criticalAlerts
  };
}
