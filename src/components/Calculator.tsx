import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator as CalcIcon, X, Delete } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Calculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNumber = (n: string) => {
    setDisplay(prev => prev === '0' ? n : prev + n);
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const fullEquation = equation + display;
      // eslint-disable-next-line no-eval
      const result = eval(fullEquation.replace('×', '*').replace('÷', '/'));
      setDisplay(String(Number(result.toFixed(2))));
      setEquation('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const deleteLast = () => {
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  return (
    <>
      {/* FAB */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-44 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-95 transition-transform hover:bg-slate-800"
      >
        <CalcIcon className="w-5 h-5 text-blue-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-48 right-6 w-80 bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden z-50 p-6 flex flex-col gap-4"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Quick Calc</span>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-3xl text-right">
              <div className="text-[10px] text-gray-400 font-mono h-4 truncate">{equation}</div>
              <div className="text-3xl font-bold font-mono tracking-tighter truncate">{display}</div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button onClick={clear} className="p-4 bg-gray-100 rounded-2xl text-xs font-bold text-red-500 hover:bg-gray-200">AC</button>
              <button onClick={deleteLast} className="p-4 bg-gray-100 rounded-2xl flex items-center justify-center hover:bg-gray-200"><Delete className="w-4 h-4" /></button>
              <button onClick={() => handleOperator('%')} className="p-4 bg-gray-100 rounded-2xl text-xs font-bold hover:bg-gray-200">%</button>
              <button onClick={() => handleOperator('÷')} className="p-4 bg-blue-50 text-blue-600 rounded-2xl text-lg font-bold hover:bg-blue-100">÷</button>

              {[7, 8, 9].map(n => (
                <button key={n} onClick={() => handleNumber(String(n))} className="p-4 bg-gray-50 rounded-2xl text-lg font-bold hover:bg-gray-100">{n}</button>
              ))}
              <button onClick={() => handleOperator('×')} className="p-4 bg-blue-50 text-blue-600 rounded-2xl text-lg font-bold hover:bg-blue-100">×</button>

              {[4, 5, 6].map(n => (
                <button key={n} onClick={() => handleNumber(String(n))} className="p-4 bg-gray-50 rounded-2xl text-lg font-bold hover:bg-gray-100">{n}</button>
              ))}
              <button onClick={() => handleOperator('-')} className="p-4 bg-blue-50 text-blue-600 rounded-2xl text-lg font-bold hover:bg-blue-100">−</button>

              {[1, 2, 3].map(n => (
                <button key={n} onClick={() => handleNumber(String(n))} className="p-4 bg-gray-50 rounded-2xl text-lg font-bold hover:bg-gray-100">{n}</button>
              ))}
              <button onClick={() => handleOperator('+')} className="p-4 bg-blue-50 text-blue-600 rounded-2xl text-lg font-bold hover:bg-blue-100">+</button>

              <button onClick={() => handleNumber('0')} className="col-span-2 p-4 bg-gray-50 rounded-2xl text-lg font-bold hover:bg-gray-100">0</button>
              <button onClick={() => handleNumber('.')} className="p-4 bg-gray-50 rounded-2xl text-lg font-bold hover:bg-gray-100">.</button>
              <button onClick={calculate} className="p-4 bg-blue-600 text-white rounded-2xl text-lg font-bold hover:bg-blue-700">=</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
