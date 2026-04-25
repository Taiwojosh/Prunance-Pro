import React, { useMemo, useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, startOfYear, endOfYear } from 'date-fns';
import { formatCurrency, getCurrencySymbol, cn } from '../lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export default function Reports() {
  const { expenses, profile } = useFinanceStore();
  const [timeRange, setTimeRange] = useState<'month' | 'year'>('month');

  // 1. Spending Trend
  const trendData = useMemo(() => {
    const data = [];
    const count = timeRange === 'month' ? 6 : 12;
    for (let i = count - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      
      const monthExpenses = expenses.filter(e => 
        isWithinInterval(new Date(e.date), { start, end })
      );
      
      data.push({
        name: format(date, timeRange === 'month' ? 'MMM' : 'MMM yy'),
        amount: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
      });
    }
    return data;
  }, [expenses, timeRange]);

  // 2. Category Breakdown
  const categoryData = useMemo(() => {
    const start = timeRange === 'month' ? startOfMonth(new Date()) : startOfYear(new Date());
    const end = timeRange === 'month' ? endOfMonth(new Date()) : endOfYear(new Date());
    
    const rangeExpenses = expenses.filter(e => 
      isWithinInterval(new Date(e.date), { start, end })
    );

    const categories: Record<string, number> = {};
    rangeExpenses.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [expenses, timeRange]);

  // 3. Budget vs Actual
  const budgetData = useMemo(() => {
    const start = timeRange === 'month' ? startOfMonth(new Date()) : startOfYear(new Date());
    const end = timeRange === 'month' ? endOfMonth(new Date()) : endOfYear(new Date());
    
    const rangeExpenses = expenses.filter(e => 
      isWithinInterval(new Date(e.date), { start, end })
    );

    return (profile.budgets || []).map((budget) => {
      const actual = rangeExpenses
        .filter(e => e.category === budget.category)
        .reduce((sum, e) => sum + e.amount, 0);
      
      const adjustedBudget = timeRange === 'month' ? budget.limit : budget.limit * 12;

      return {
        name: budget.category,
        Budget: adjustedBudget,
        Actual: actual
      };
    });
  }, [expenses, profile.budgets, timeRange]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-bold">Reports</h2>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setTimeRange('month')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
              timeRange === 'month' ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"
            )}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
              timeRange === 'year' ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"
            )}
          >
            Year
          </button>
        </div>
      </div>

      {/* Spending Trend */}
      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
          {timeRange === 'month' ? '6-Month' : '12-Month'} Trend
        </h3>
        <div className="h-64 w-full">
          {trendData.some(d => d.amount > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }}
                  tickFormatter={(val) => `${getCurrencySymbol(profile.currency)}${val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(val: number) => [formatCurrency(val, profile.currency, profile.privacyMode), 'Spent']}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <p className="text-sm font-medium">No spending data for this period</p>
            </div>
          )}
        </div>
      </section>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">By Category</h3>
          <div className="h-64 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(val: number) => [formatCurrency(val, profile.currency, profile.privacyMode), 'Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p className="text-sm font-medium">No category data</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] font-bold text-gray-500 truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Budget vs Actual */}
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Budget vs Actual</h3>
          <div className="h-64 w-full">
            {budgetData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="Budget" fill="#f3f4f6" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="Actual" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p className="text-sm font-medium">No budgets set</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
