import { HeroSection } from '../components/landing/HeroSection';
import { FeatureCards } from '../components/landing/FeatureCards';
import { HowItWorks } from '../components/landing/HowItWorks';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full bg-white dark:bg-[#0A0A0B] overflow-x-hidden selection:bg-emerald-500/30">
      {/* 1. Hero Section with Live Counter & Abstract Animations */}
      <HeroSection />

      {/* 2. Visual Pipeline: How it works */}
      <section className="py-24 relative border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0F0F11]">
        <HowItWorks />
      </section>

      {/* 3. Features & Trust */}
      <section className="py-32 relative">
        <div className="text-center mb-16 px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Scale & Trust</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Whether it's a private board election or a massive public television poll, OmniVote delivers unparalleled security and performance.
          </motion.p>
        </div>
        <FeatureCards />
      </section>

      {/* 4. Footer CTA */}
      <section className="py-24 relative border-t border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-gray-50 dark:from-[#0A0A0B] dark:to-[#050505]">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            Ready to secure your next election?
          </h2>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/vote"
            className="inline-flex items-center justify-center h-16 px-10 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-lg font-bold shadow-2xl shadow-gray-900/20 dark:shadow-white/10 hover:shadow-emerald-500/20 transition-shadow"
          >
            Enter Voter Portal
          </motion.a>
        </div>
      </section>
    </div>
  );
}
