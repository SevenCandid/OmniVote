import { motion } from 'framer-motion';
import { Shield, Server, Lock } from 'lucide-react';

export const FeatureCards = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "End-to-End Verifiable",
      description: "Cryptographic receipts allow voters to individually audit their ballots and mathematically prove their vote was tallied.",
    },
    {
      icon: <Server className="w-8 h-8" />,
      title: "Immutable Ledger",
      description: "All transactions are hashed into an append-only ledger, ensuring the history of an election cannot be rewritten.",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Zero-Knowledge",
      description: "Advanced cryptographic primitives ensure voter anonymity while maintaining 100% verifiable election integrity.",
    }
  ];

  return (
    <section className="relative py-20 md:py-32 px-4 max-w-7xl mx-auto w-full z-10 bg-transparent transition-colors duration-500">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
        
        {/* Left Side: Massive Typography */}
        <div className="lg:w-1/3 flex flex-col justify-center sticky top-20 md:top-32 h-fit">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-4 md:mb-6 leading-tight tracking-tight">
              Security without <br />
              <span className="text-gray-400 dark:text-gray-500">compromise.</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg font-light leading-relaxed">
              OmniVote abandons traditional black-box architecture in favor of a mathematically provable, cryptographic pipeline.
            </p>
          </motion.div>
        </div>

        {/* Right Side: Asymmetrical List */}
        <div className="lg:w-2/3 flex flex-col gap-10 md:gap-12 mt-8 lg:mt-0">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: idx * 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-6 sm:gap-10 group"
            >
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white group-hover:border-gray-300 dark:group-hover:border-white/30 transition-all duration-500">
                {feature.icon}
              </div>
              <div className="flex flex-col justify-center border-b border-gray-200 dark:border-white/5 pb-10 md:pb-12 w-full group-hover:border-gray-300 dark:group-hover:border-white/20 transition-colors duration-500">
                <h3 className="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-2 md:mb-3 tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed text-base md:text-lg max-w-lg">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
