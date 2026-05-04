import { Expense, Bill, SavingsGoal, UserProfile, Category } from '../types';
import { subDays, startOfMonth, format } from 'date-fns';

const categories: Category[] = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills'];

const generateRandomExpenses = (count: number, daysBack: number): Expense[] => {
  const expenses: Expense[] = [];
  for (let i = 0; i < count; i++) {
    const date = subDays(new Date(), Math.floor(Math.random() * daysBack));
    expenses.push({
      id: crypto.randomUUID(),
      amount: Math.floor(Math.random() * 100) + 5,
      category: categories[Math.floor(Math.random() * categories.length)],
      date: date.toISOString(),
      notes: 'Sample expense'
    });
  }
  return expenses;
};

export const personas = {
  student: {
    profile: { name: 'Alex (Student)', monthlyIncome: 1200, payday: 1, currency: 'NGN', lowBalanceThreshold: 50 },
    expenses: generateRandomExpenses(20, 30),
    bills: [
      { id: 'b1', name: 'Rent', amount: 600, dueDate: startOfMonth(new Date()).toISOString(), frequency: 'monthly', category: 'Bills' },
      { id: 'b2', name: 'Spotify', amount: 10, dueDate: subDays(new Date(), 2).toISOString(), frequency: 'monthly', category: 'Bills' }
    ] as Bill[],
    goals: [
      { id: 'g1', name: 'Summer Trip', targetAmount: 1000, currentAmount: 250, deadline: '2026-08-01' }
    ] as SavingsGoal[]
  },
  professional: {
    profile: { name: 'Sarah (Professional)', monthlyIncome: 4500, payday: 25, currency: 'NGN', lowBalanceThreshold: 200 },
    expenses: generateRandomExpenses(40, 60),
    bills: [
      { id: 'b1', name: 'Mortgage', amount: 1800, dueDate: '2026-04-25', frequency: 'monthly', category: 'Bills' },
      { id: 'b2', name: 'Gym', amount: 50, dueDate: '2026-04-15', frequency: 'monthly', category: 'Bills' },
      { id: 'b3', name: 'Internet', amount: 70, dueDate: '2026-04-20', frequency: 'monthly', category: 'Bills' }
    ] as Bill[],
    goals: [
      { id: 'g1', name: 'New Car', targetAmount: 25000, currentAmount: 8000, deadline: '2027-12-01', monthlyContribution: 500 },
      { id: 'g2', name: 'Emergency Fund', targetAmount: 15000, currentAmount: 12000, deadline: '2026-12-31' }
    ] as SavingsGoal[]
  },
  frugal: {
    profile: { name: 'Mark (Frugal)', monthlyIncome: 2800, payday: 28, currency: 'NGN', lowBalanceThreshold: 100 },
    expenses: generateRandomExpenses(15, 30).map(e => ({ ...e, amount: e.amount * 0.5 })),
    bills: [
      { id: 'b1', name: 'Shared Rent', amount: 400, dueDate: '2026-04-28', frequency: 'monthly', category: 'Bills' }
    ] as Bill[],
    goals: [
      { id: 'g1', name: 'Early Retirement', targetAmount: 500000, currentAmount: 45000, deadline: '2040-01-01', monthlyContribution: 1000 }
    ] as SavingsGoal[]
  }
};
