import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const HeroSection = () => {
  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacityText = useTransform(scrollY, [0, 500], [1, 0]);
  const scaleGlow = useTransform(scrollY, [0, 1000], [1, 1.5]);

  return (
    <section className="relative h-screen min-h-[800px] flex flex-col items-center justify-center overflow-hidden bg-gray-50 dark:bg-[#050505] transition-colors duration-500">
      {/* Massive Ethereal Gradients */}
      <motion.div 
        style={{ scale: scaleGlow }}
        className="absolute inset-0 w-full h-full -z-10 pointer-events-none"
      >
        <motion.div 
          animate={{ 
            x: ['-20%', '20%', '-20%'], 
            y: ['-10%', '10%', '-10%'] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-indigo-200/50 dark:bg-slate-800/40 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"
        />
        <motion.div 
          animate={{ 
            x: ['20%', '-20%', '20%'], 
            y: ['10%', '-10%', '10%'] 
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-emerald-200/40 dark:bg-indigo-900/30 rounded-full blur-[140px] mix-blend-multiply dark:mix-blend-screen"
        />
      </motion.div>

      {/* Grid Overlay for texture */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(black,transparent_80%)] dark:[mask-image:radial-gradient(white,transparent_80%)] opacity-5 dark:opacity-10 pointer-events-none -z-10" />

      {/* Content */}
      <motion.div 
        style={{ y: yText, opacity: opacityText }}
        className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-7xl mx-auto w-full mt-4"
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl sm:text-7xl lg:text-9xl font-light tracking-tight text-gray-900 dark:text-white mb-8"
        >
          Trust <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-800 dark:from-gray-200 dark:to-gray-500">Secured.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-light max-w-3xl tracking-wide leading-relaxed mb-16"
        >
          OmniVote is the institutional-grade voting ledger. <br className="hidden md:block" />
          End-to-end verifiable cryptography meets infinite scale.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
        >
          <Link to="/vote" className="group">
            <button className="relative w-full sm:w-auto px-10 py-5 bg-gray-900 dark:bg-white text-white dark:text-black font-medium text-lg rounded-full overflow-hidden transition-all hover:scale-105 duration-300 shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Enter Portal <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Link>
          <Link to="/dashboard" className="group">
            <button className="relative w-full sm:w-auto px-10 py-5 bg-transparent border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-medium text-lg rounded-full overflow-hidden transition-all hover:bg-gray-100 dark:hover:bg-white/5 duration-300">
              <span className="relative z-10">Admin Console</span>
            </button>
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">Discover</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-gray-400 dark:from-gray-500 to-transparent" />
      </motion.div>
    </section>
  );
};
