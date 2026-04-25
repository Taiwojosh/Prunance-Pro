import { openDB, IDBPDatabase } from 'idb';
import { Expense, Bill, SavingsGoal, UserProfile } from '../types';

const DB_NAME = 'prosper-finance-db';
const DB_VERSION = 1;

export interface ProsperDB {
  expenses: Expense;
  bills: Bill;
  goals: SavingsGoal;
  profile: UserProfile;
}

export const initDB = async (): Promise<IDBPDatabase<ProsperDB>> => {
  return openDB<ProsperDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('expenses')) {
        db.createObjectStore('expenses', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('bills')) {
        db.createObjectStore('bills', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('goals')) {
        db.createObjectStore('goals', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'id' });
      }
    },
  });
};

export const dbHelper = {
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await initDB();
    return db.getAll(storeName as any);
  },
  async put(storeName: string, item: any) {
    const db = await initDB();
    return db.put(storeName as any, item);
  },
  async delete(storeName: string, id: string) {
    const db = await initDB();
    return db.delete(storeName as any, id);
  },
  async clear(storeName: string) {
    const db = await initDB();
    return db.clear(storeName as any);
  }
};
