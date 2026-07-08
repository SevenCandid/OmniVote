import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Vote, Shield, Zap, Sparkles } from 'lucide-react';
import { BaseButton } from '../components/ui/BaseButton';
import { BaseCard } from '../components/ui/BaseCard';

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-16 py-8 sm:py-12 lg:py-16 overflow-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold select-none"
        >
          <Sparkles size={12} />
          <span>Introducing OmniVote v1.0</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="text-4xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-indigo-500 to-indigo-700 bg-clip-text text-transparent font-sans"
        >
          One System. Every Vote.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="text-base sm:text-xl text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] max-w-2xl"
        >
          Secure, multi-tenant voting SaaS built for democratic organizational elections and high-throughput public contests. Trust starts with cryptography.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto shrink-0"
        >
          <Link to="/vote" className="w-full sm:w-auto">
            <BaseButton variant="primary" size="lg" className="w-full">
              Enter Voter Portal
            </BaseButton>
          </Link>
          <Link to="/dashboard" className="w-full sm:w-auto">
            <BaseButton variant="secondary" size="lg" className="w-full">
              Go to Admin Console
            </BaseButton>
          </Link>
        </motion.div>
      </section>

      {/* 2. Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <BaseCard hoverable className="flex flex-col gap-4 h-full">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Shield size={24} />
            </div>
            <h3 className="text-lg font-bold">End-to-End Verifiable</h3>
            <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
              Cryptographic receipts allow voters to audit their ballots individually and ensure their vote is tallied correctly.
            </p>
          </BaseCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <BaseCard hoverable className="flex flex-col gap-4 h-full">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
              <Zap size={24} />
            </div>
            <h3 className="text-lg font-bold">High-Throughput Scale</h3>
            <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
              Designed to handle thousands of concurrent transactions for paid public contests and massive SMS/USSD voting events.
            </p>
          </BaseCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <BaseCard hoverable className="flex flex-col gap-4 h-full">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Vote size={24} />
            </div>
            <h3 className="text-lg font-bold">Multi-Channel Access</h3>
            <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
              Cast your ballot securely through Web client app, mobile applications, USSD session dial-ins, or SMS message relays.
            </p>
          </BaseCard>
        </motion.div>

      </section>

    </div>
  );
}
