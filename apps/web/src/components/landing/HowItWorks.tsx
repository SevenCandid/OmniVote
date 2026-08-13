import { motion } from 'framer-motion';

export const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Authentication",
      description: "Identity is verified securely without linking the voter to the actual ballot content."
    },
    {
      number: "02",
      title: "Encryption",
      description: "The ballot is cryptographically sealed in the browser before ever touching the network."
    },
    {
      number: "03",
      title: "Consensus",
      description: "Zero-knowledge proofs validate the ballot's integrity while maintaining absolute anonymity."
    }
  ];

  return (
    <section className="relative py-32 bg-gray-50 dark:bg-[#050505] overflow-hidden border-t border-gray-200 dark:border-white/5 transition-colors duration-500">
      {/* Background ambient glow */}
      <div className="absolute inset-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-100 dark:bg-white/5 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto px-4 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-24"
        >
          <h2 className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-4">Architecture</h2>
          <p className="text-3xl md:text-5xl font-light text-gray-900 dark:text-white leading-tight">
            The anatomy of a <br className="hidden md:block"/> mathematically secure vote.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: idx * 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col relative"
            >
              {/* Connecting line (Desktop) */}
              {idx !== steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-16 right-0 h-[1px] bg-gradient-to-r from-gray-300 dark:from-white/20 to-transparent" />
              )}
              
              <div className="text-6xl font-light text-gray-200 dark:text-white/10 mb-6 font-mono tracking-tighter">
                {step.number}
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4 tracking-wide">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
