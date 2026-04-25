import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[500] bg-blue-600 flex flex-col items-center justify-center text-white"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring",
              damping: 12,
              stiffness: 200,
              delay: 0.2
            }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center shadow-2xl">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold tracking-tighter">Prunance</h1>
              <p className="text-blue-100 text-sm font-bold uppercase tracking-[0.3em] ml-1">Finance</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-12 flex flex-col items-center gap-4"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5,
                    delay: i * 0.2
                  }}
                  className="w-1.5 h-1.5 bg-white rounded-full"
                />
              ))}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Securely Loading</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
