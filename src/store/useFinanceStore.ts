import { create } from 'zustand';
import { FinanceState, Expense, Bill, SavingsGoal, UserProfile } from '../types';
import { dbHelper } from '../lib/db';

// We'll use crypto.randomUUID()
const generateId = () => crypto.randomUUID();

export const useFinanceStore = create<FinanceState>((set, get) => ({
  expenses: [],
  bills: [],
  goals: [],
  profile: {
    name: '',
    monthlyIncome: 0,
    payday: 1,
    budgets: [],
    currency: 'USD',
    lowBalanceThreshold: 50,
    hasSeenTour: false,
    privacyMode: false,
    quickAdds: [
      { id: 'q1', name: 'Coffee', amount: 4.5, category: 'Food' },
      { id: 'q2', name: 'Lunch', amount: 12, category: 'Food' },
      { id: 'q3', name: 'Bus Fare', amount: 2.5, category: 'Transport' },
      { id: 'q4', name: 'Grocery', amount: 45, category: 'Food' },
    ],
    notifiedAlerts: []
  },
  isInitialized: false,

  addExpense: async (expenseData) => {
    const expense = { ...expenseData, id: generateId() };
    await dbHelper.put('expenses', expense);
    set((state) => ({ expenses: [expense, ...state.expenses] }));
  },

  updateExpense: async (id, expenseData) => {
    const current = get().expenses.find(e => e.id === id);
    if (!current) return;
    const updated = { ...current, ...expenseData };
    await dbHelper.put('expenses', updated);
    set((state) => ({
      expenses: state.expenses.map(e => e.id === id ? updated : e)
    }));
  },

  deleteExpense: async (id) => {
    await dbHelper.delete('expenses', id);
    set((state) => ({
      expenses: state.expenses.filter(e => e.id !== id)
    }));
  },

  addBill: async (billData) => {
    const bill = { ...billData, id: generateId() };
    await dbHelper.put('bills', bill);
    set((state) => ({ bills: [...state.bills, bill] }));
  },

  updateBill: async (id, billData) => {
    const current = get().bills.find(b => b.id === id);
    if (!current) return;
    const updated = { ...current, ...billData };
    await dbHelper.put('bills', updated);
    set((state) => ({
      bills: state.bills.map(b => b.id === id ? updated : b)
    }));
  },

  deleteBill: async (id) => {
    await dbHelper.delete('bills', id);
    set((state) => ({
      bills: state.bills.filter(b => b.id !== id)
    }));
  },

  addGoal: async (goalData) => {
    const goal = { ...goalData, id: generateId() };
    await dbHelper.put('goals', goal);
    set((state) => ({ goals: [...state.goals, goal] }));
  },

  updateGoal: async (id, goalData) => {
    const current = get().goals.find(g => g.id === id);
    if (!current) return;
    const updated = { ...current, ...goalData };
    await dbHelper.put('goals', updated);
    set((state) => ({
      goals: state.goals.map(g => g.id === id ? updated : g)
    }));
  },

  deleteGoal: async (id) => {
    await dbHelper.delete('goals', id);
    set((state) => ({
      goals: state.goals.filter(g => g.id !== id)
    }));
  },

  topUpGoal: async (id, amount) => {
    const current = get().goals.find(g => g.id === id);
    if (!current) return;
    const updated = { ...current, currentAmount: current.currentAmount + amount };
    await dbHelper.put('goals', updated);
    set((state) => ({
      goals: state.goals.map(g => g.id === id ? updated : g)
    }));
  },

  setProfile: async (profile) => {
    await dbHelper.put('profile', { ...profile, id: 'current' });
    set({ profile });
  },

  addQuickAdd: async (templateData) => {
    const template = { ...templateData, id: generateId() };
    const newProfile = { ...get().profile, quickAdds: [...get().profile.quickAdds, template] };
    await dbHelper.put('profile', { ...newProfile, id: 'current' });
    set({ profile: newProfile });
  },

  deleteQuickAdd: async (id) => {
    const newProfile = { ...get().profile, quickAdds: get().profile.quickAdds.filter(q => q.id !== id) };
    await dbHelper.put('profile', { ...newProfile, id: 'current' });
    set({ profile: newProfile });
  },

  updateBudget: async (category, limit) => {
    const budgets = get().profile.budgets.filter(b => b.category !== category);
    if (limit > 0) {
      budgets.push({ category, limit });
    }
    const newProfile = { ...get().profile, budgets };
    await dbHelper.put('profile', { ...newProfile, id: 'current' });
    set({ profile: newProfile });
  },

  dismissedAlerts: [],
  dismissAlert: (id: string) => {
    set((state) => ({
      dismissedAlerts: [...state.dismissedAlerts, id]
    }));
  },

  clearDismissedAlerts: () => {
    set({ dismissedAlerts: [] });
  },

  clearAllData: async () => {
    await dbHelper.clear('expenses');
    await dbHelper.clear('bills');
    await dbHelper.clear('goals');
    await dbHelper.clear('profile');
    
    // Reset to initial state
    set({
      expenses: [],
      bills: [],
      goals: [],
      dismissedAlerts: [],
      profile: {
        name: '',
        monthlyIncome: 0,
        payday: 1,
        budgets: [],
        currency: 'USD',
        lowBalanceThreshold: 50,
        hasSeenTour: false,
        privacyMode: false,
        quickAdds: [
          { id: 'q1', name: 'Coffee', amount: 4.5, category: 'Food' },
          { id: 'q2', name: 'Lunch', amount: 12, category: 'Food' },
          { id: 'q3', name: 'Bus Fare', amount: 2.5, category: 'Transport' },
          { id: 'q4', name: 'Grocery', amount: 45, category: 'Food' },
        ],
        notifiedAlerts: []
      }
    });
  },

  exportData: async () => {
    const data = {
      expenses: await dbHelper.getAll('expenses'),
      bills: await dbHelper.getAll('bills'),
      goals: await dbHelper.getAll('goals'),
      profile: await dbHelper.getAll('profile'),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prosper-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  importData: async (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      
      // Basic validation
      if (!data.expenses || !data.bills || !data.goals || !data.profile) {
        throw new Error('Invalid backup file format');
      }

      // Clear current data
      await dbHelper.clear('expenses');
      await dbHelper.clear('bills');
      await dbHelper.clear('goals');
      await dbHelper.clear('profile');

      // Import new data
      for (const e of data.expenses) await dbHelper.put('expenses', e);
      for (const b of data.bills) await dbHelper.put('bills', b);
      for (const g of data.goals) await dbHelper.put('goals', g);
      for (const p of data.profile) await dbHelper.put('profile', p);

      // Re-initialize
      await get().init();
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  },

  completeTour: async () => {
    const newProfile = { ...get().profile, hasSeenTour: true };
    await dbHelper.put('profile', { ...newProfile, id: 'current' });
    set({ profile: newProfile });
  },

  setPrivacyLock: async (pin) => {
    const newProfile = { ...get().profile, privacyLock: pin };
    await dbHelper.put('profile', { ...newProfile, id: 'current' });
    set({ profile: newProfile });
  },

  togglePrivacyMode: async () => {
    const newProfile = { ...get().profile, privacyMode: !get().profile.privacyMode };
    await dbHelper.put('profile', { ...newProfile, id: 'current' });
    set({ profile: newProfile });
  },

  markAlertAsNotified: async (id) => {
    const notifiedAlerts = get().profile.notifiedAlerts || [];
    if (notifiedAlerts.includes(id)) return;
    
    const newProfile = { 
      ...get().profile, 
      notifiedAlerts: [...notifiedAlerts, id] 
    };
    await dbHelper.put('profile', { ...newProfile, id: 'current' });
    set({ profile: newProfile });
  },

  // Initialize store from DB
  init: async () => {
    const expenses = await dbHelper.getAll<Expense>('expenses');
    const bills = await dbHelper.getAll<Bill>('bills');
    const goals = await dbHelper.getAll<SavingsGoal>('goals');
    const profiles = await dbHelper.getAll<UserProfile & { id: string }>('profile');
    const dbProfile = profiles.length > 0 ? profiles[0] : null;
    
    set({
      expenses: expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      bills,
      goals,
      profile: dbProfile ? {
        ...get().profile,
        ...dbProfile,
        budgets: dbProfile.budgets || [],
        quickAdds: dbProfile.quickAdds || get().profile.quickAdds,
        currency: dbProfile.currency || 'USD',
        lowBalanceThreshold: dbProfile.lowBalanceThreshold || 100
      } : get().profile,
      isInitialized: true
    });
  }
}));
