import { motion } from 'framer-motion';
import { Activity, Lock, Radio } from 'lucide-react';

interface LiveElectionIndicatorProps {
  isAdmin?: boolean;
}

export default function LiveElectionIndicator({ isAdmin = false }: LiveElectionIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full p-8 rounded-2xl bg-gradient-to-b from-[var(--color-surface)] to-transparent border border-white/5 relative overflow-hidden">
      
      {/* Animated Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[var(--color-primary)]/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center max-w-lg text-center space-y-8">
        
        {/* Radar / Pulse Animation */}
        <div className="relative flex items-center justify-center w-32 h-32">
          <motion.div
            className="absolute inset-0 border border-[var(--color-primary)] rounded-full opacity-20"
            animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-4 border border-[var(--color-primary)] rounded-full opacity-40"
            animate={{ scale: [1, 2], opacity: [0.8, 0] }}
            transition={{ duration: 2, delay: 0.4, repeat: Infinity, ease: 'easeOut' }}
          />
          <div className="relative w-16 h-16 bg-[var(--color-surface)] border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.3)] backdrop-blur-md">
            <Radio className="w-8 h-8 text-[var(--color-primary)] animate-pulse" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <motion.h2 
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Live Election in Progress
          </motion.h2>
          
          <motion.p 
            className="text-gray-400 text-lg leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Votes are being securely collected in real-time. 
            The live tally is currently hidden to preserve the integrity of the election.
          </motion.p>
        </div>

        {/* Status Pills */}
        <motion.div 
          className="flex items-center gap-4 mt-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm font-medium">
            <Activity className="w-4 h-4 animate-spin-slow" />
            Active Collection
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-medium">
            <Lock className="w-4 h-4" />
            Results Secured
          </div>
        </motion.div>
        
        {isAdmin && (
          <motion.p
             className="text-xs text-gray-500 mt-4 max-w-sm mx-auto"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5 }}
          >
            You configured this election to hide live numbers from admins during the voting phase.
          </motion.p>
        )}
      </div>
    </div>
  );
}
