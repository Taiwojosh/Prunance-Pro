export type Category = 
  | 'Food' 
  | 'Transport' 
  | 'Shopping' 
  | 'Entertainment' 
  | 'Health' 
  | 'Bills' 
  | 'Income' 
  | 'Other';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string;
  notes: string;
  receiptUrl?: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO string
  frequency: 'weekly' | 'monthly' | 'yearly';
  category: Category;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  monthlyContribution?: number;
  isLocked?: boolean;
}

export interface QuickAddTemplate {
  id: string;
  name: string;
  amount: number;
  category: Category;
}

export interface Budget {
  category: Category;
  limit: number;
}

export interface UserProfile {
  name: string;
  monthlyIncome: number;
  payday: number; // Day of month
  budgets: Budget[];
  quickAdds: QuickAddTemplate[];
  currency: string;
  lowBalanceThreshold: number;
  hasSeenTour: boolean;
  privacyMode?: boolean;
  privacyLock?: string; // PIN
  notifiedAlerts?: string[]; // IDs of alerts already sent as system notifications
}

export interface FinanceState {
  expenses: Expense[];
  bills: Bill[];
  goals: SavingsGoal[];
  profile: UserProfile;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addBill: (bill: Omit<Bill, 'id'>) => void;
  updateBill: (id: string, bill: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  topUpGoal: (id: string, amount: number) => void;
  setProfile: (profile: UserProfile) => void;
  addQuickAdd: (template: Omit<QuickAddTemplate, 'id'>) => void;
  deleteQuickAdd: (id: string) => void;
  updateBudget: (category: Category, limit: number) => void;
  dismissedAlerts: string[];
  dismissAlert: (id: string) => void;
  clearDismissedAlerts: () => void;
  clearAllData: () => Promise<void>;
  exportData: () => Promise<void>;
  importData: (jsonData: string) => Promise<void>;
  completeTour: () => void;
  setPrivacyLock: (pin: string | undefined) => void;
  togglePrivacyMode: () => void;
  markAlertAsNotified: (id: string) => void;
  init: () => Promise<void>;
}
