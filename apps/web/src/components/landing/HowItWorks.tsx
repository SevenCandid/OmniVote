import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, KeySquare, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <UserCheck className="w-8 h-8" />,
      title: "1. Verify Identity",
      description: "Voters authenticate securely via their unique voter ID and optional OTP verification to ensure eligibility.",
      delay: 0.1
    },
    {
      icon: <KeySquare className="w-8 h-8" />,
      title: "2. Cast Encrypted Ballot",
      description: "The ballot is cryptographically sealed in the browser before being transmitted to our secure ledger.",
      delay: 0.3
    },
    {
      icon: <CheckCircle2 className="w-8 h-8" />,
      title: "3. Tally & Audit",
      description: "Votes are tallied using zero-knowledge proofs, allowing public verification without breaking anonymity.",
      delay: 0.5
    }
  ];

  return (
    <div className="relative max-w-5xl mx-auto px-4 py-16 w-full">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          How OmniVote Works
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          A seamless, cryptographic pipeline that protects election integrity from end to end.
        </p>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Connecting Line (Desktop only) */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent -translate-y-1/2 z-0" />

        {steps.map((step, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: step.delay }}
            className="relative z-10 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#18181B] border-2 border-emerald-500/20 dark:border-emerald-500/30 shadow-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 relative">
              {/* Glowing aura */}
              <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl -z-10" />
              {step.icon}
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {step.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
