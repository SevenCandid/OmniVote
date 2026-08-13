import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { LiveCounter } from './LiveCounter';
import { BaseButton } from '../ui/BaseButton';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 w-full h-full -z-10 pointer-events-none">
        {/* Glow / Mesh Gradients */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] opacity-50 dark:opacity-30 mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] opacity-50 dark:opacity-30 mix-blend-screen" />
        
        {/* Abstract Floating Shapes (Representing Data Packets / Votes) */}
        <motion.div 
          animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/6 w-24 h-32 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md rotate-12 hidden md:block"
        />
        <motion.div 
          animate={{ y: [0, 40, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 right-1/6 w-32 h-24 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md -rotate-6 hidden lg:block"
        />
        <motion.div 
          animate={{ y: [0, -50, 0], rotate: [0, 45, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md hidden md:block"
        />
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto px-4 flex flex-col items-center gap-8 mt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold select-none shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          <Sparkles size={16} className="animate-pulse" />
          <span>The Next Generation of Secure Voting</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-gray-900 dark:text-white leading-[1.1]"
        >
          One System. <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500">
            Every Vote.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium"
        >
          Secure, multi-tenant voting SaaS built for democratic organizational
          elections and high-throughput public contests. Trust starts with
          cryptography.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto"
        >
          <Link to="/vote" className="w-full sm:w-auto group">
            <BaseButton size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/25 px-8 text-base h-14 rounded-xl">
              Enter Voter Portal
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </BaseButton>
          </Link>
          <Link to="/dashboard" className="w-full sm:w-auto">
            <BaseButton variant="secondary" size="lg" className="w-full sm:w-auto px-8 text-base h-14 rounded-xl border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 backdrop-blur-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              Go to Admin Console
            </BaseButton>
          </Link>
        </motion.div>

        {/* Live Counter Component */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
          className="mt-16 w-full max-w-md mx-auto"
        >
          <LiveCounter endValue={12485902} label="Votes processed securely across all tenants" />
        </motion.div>
      </div>
    </section>
  );
};
