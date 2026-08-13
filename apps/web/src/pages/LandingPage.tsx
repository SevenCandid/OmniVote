import { HeroSection } from '../components/landing/HeroSection';
import { FeatureCards } from '../components/landing/FeatureCards';
import { HowItWorks } from '../components/landing/HowItWorks';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full bg-white dark:bg-[#050505] overflow-x-hidden selection:bg-gray-900/10 dark:selection:bg-white/20 selection:text-gray-900 dark:selection:text-white transition-colors duration-500">
      {/* 1. Immersive Hero */}
      <HeroSection />

      {/* 2. Visual Pipeline: How it works */}
      <HowItWorks />

      {/* 3. Asymmetrical Features & Trust */}
      <FeatureCards />

      {/* 4. Footer CTA */}
      <section className="py-32 relative border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#050505] overflow-hidden transition-colors duration-500">
        {/* Subtle ambient glow behind footer */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[800px] h-[400px] bg-indigo-200/50 dark:bg-indigo-500/20 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center px-4 relative z-10 flex flex-col items-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-light text-gray-900 dark:text-white mb-12 tracking-tight leading-tight"
          >
            Ready to secure your <br /> next election?
          </motion.h2>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/vote"
            className="inline-flex items-center justify-center px-12 py-5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-[#050505] text-lg font-medium shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all"
          >
            Enter Voter Portal
          </motion.a>
        </div>
      </section>
    </div>
  );
}
