import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface LiveCounterProps {
  endValue: number;
  duration?: number;
  label?: string;
}

export const LiveCounter: React.FC<LiveCounterProps> = ({ endValue, duration = 3, label }) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const count = useMotionValue(0);
  
  // Smooth spring animation
  const springCount = useSpring(count, {
    damping: 30,
    stiffness: 100,
    duration: duration * 1000
  });

  // Transform the raw number into a formatted string (e.g., 1,234,567)
  const displayCount = useTransform(springCount, (latest) => {
    return Math.floor(latest).toLocaleString();
  });

  useEffect(() => {
    // Start animation immediately
    count.set(endValue);
    setHasAnimated(true);
    
    // Simulate live incrementing after initial load
    const interval = setInterval(() => {
      if (hasAnimated) {
        // Add random small increments to simulate live activity
        const current = count.get();
        count.set(current + Math.floor(Math.random() * 5));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [count, endValue, hasAnimated]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Live Network
        </span>
      </div>
      <motion.div className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-gray-900 dark:text-white mt-2">
        {displayCount}
      </motion.div>
      {label && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {label}
        </div>
      )}
    </div>
  );
};
