import React, { useMemo, useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend, ScatterChart, Scatter
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, startOfYear, endOfYear, subDays } from 'date-fns';
import { formatCurrency, getCurrencySymbol, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Activity, PieChart as PieIcon, BarChart3, Info, ChevronRight, Zap } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export default function Reports() {
  const { expenses, profile } = useFinanceStore();
  const [timeRange, setTimeRange] = useState<'month' | 'year'>('month');

  // 1. Spending Trend (Area Chart)
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

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, timeRange]);

  // 3. Stats KPIs
  const kpis = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    const currentMonthExpenses = expenses.filter(e => isWithinInterval(new Date(e.date), { start, end }));
    const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const prevStart = startOfMonth(subMonths(new Date(), 1));
    const prevEnd = endOfMonth(subMonths(new Date(), 1));
    const prevMonthExpenses = expenses.filter(e => isWithinInterval(new Date(e.date), { start: prevStart, end: prevEnd }));
    const prevSpent = prevMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const change = prevSpent === 0 ? 0 : ((totalSpent - prevSpent) / prevSpent) * 100;

    return [
      { 
        label: 'Current Volume', 
        value: totalSpent, 
        change: change.toFixed(1) + '%', 
        trend: change <= 0 ? 'down' : 'up',
        icon: Activity,
        color: 'blue'
      },
      { 
        label: 'Daily Average', 
        value: totalSpent / 30, 
        change: 'Based on 30d', 
        trend: 'neutral',
        icon: Zap,
        color: 'emerald'
      },
      { 
        label: 'Top Category', 
        value: categoryData[0]?.name || 'N/A', 
        change: categoryData[0] ? formatCurrency(categoryData[0].value, profile.currency, profile.privacyMode) : '0.00',
        trend: 'neutral',
        icon: PieIcon,
        color: 'orange'
      }
    ];
  }, [expenses, profile, categoryData]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-24"
    >
      <div className="flex justify-between items-end px-1">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Analysis</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Institutional Intelligence</p>
        </div>
        <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 shadow-sm">
          <button
            onClick={() => setTimeRange('month')}
            className={cn(
              "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              timeRange === 'month' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"
            )}
          >
            MTH
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={cn(
              "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              timeRange === 'year' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"
            )}
          >
            YR
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div 
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-4 group hover:shadow-xl hover:shadow-slate-100 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                kpi.color === 'blue' ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" :
                kpi.color === 'emerald' ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white" :
                "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white"
              )}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div className={cn(
                "text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest",
                kpi.trend === 'up' ? "bg-red-50 text-red-600" : 
                kpi.trend === 'down' ? "bg-emerald-50 text-emerald-600" :
                "bg-slate-50 text-slate-400"
              )}>
                {kpi.trend === 'up' && '▲ '}{kpi.trend === 'down' && '▼ '}{kpi.change}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
              <h4 className="text-2xl font-display font-bold text-slate-900 mt-0.5">
                {typeof kpi.value === 'number' ? formatCurrency(kpi.value, profile.currency, profile.privacyMode) : kpi.value}
              </h4>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Pulse Chart */}
      <section className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h3 className="text-xl font-display font-bold text-slate-900">Deployment Velocity</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Capital Flux across Timeline</p>
          </div>
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
            <Activity className="w-5 h-5" />
          </div>
        </div>
        
        <div className="h-80 w-full relative z-10">
          {trendData.some(d => d.amount > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b', transform: 'translate(0, 10)' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  tickFormatter={(val) => `${getCurrencySymbol(profile.currency)}${val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}
                  formatter={(val: number) => [formatCurrency(val, profile.currency, profile.privacyMode), 'Volume']}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorAmount)"
                  activeDot={{ r: 8, strokeWidth: 0, fill: '#3b82f6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No spectral data detected</p>
            </div>
          )}
        </div>
      </section>

      {/* Grid: Category & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-display font-bold text-slate-900">Distribution</h3>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg">By Asset Class</span>
          </div>
          
          <div className="flex-1 min-h-[250px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                    formatter={(val: number) => [formatCurrency(val, profile.currency, profile.privacyMode), 'Allocated']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <PieIcon className="w-12 h-12 opacity-20" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-8">
            {categoryData.slice(0, 6).map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[80px]">{entry.name}</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-900">
                  {Math.round((entry.value / categoryData.reduce((sum, e) => sum + e.value, 0)) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-300" />
              </div>
              <h3 className="text-2xl font-display font-bold">Insights Engine</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your spending velocity has {kpis[0].trend === 'down' ? 'decreased' : 'increased'} by {kpis[0].change} this period. Highly concentrated behavior detected in <span className="text-blue-400 font-bold">{categoryData[0]?.name || 'new categories'}</span>.
              </p>
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 group-hover:gap-3 transition-all">
                Full Systems Audit <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-[40px] -mr-16 -mt-16" />
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm space-y-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Efficiency Rating</h3>
            <div className="space-y-4">
              {[
                { label: 'Budget Adherence', score: 88, color: 'emerald' },
                { label: 'Saving Velocity', score: 42, color: 'blue' },
                { label: 'Debt Liquidation', score: 95, color: 'purple' }
              ].map(item => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">{item.label}</span>
                    <span className={cn(
                      item.color === 'emerald' ? "text-emerald-600" :
                      item.color === 'blue' ? "text-blue-600" : "text-purple-600"
                    )}>{item.score}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      className={cn(
                        "h-full rounded-full",
                        item.color === 'emerald' ? "bg-emerald-500" :
                        item.color === 'blue' ? "bg-blue-500" : "bg-purple-500"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
