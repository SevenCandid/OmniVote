import { motion, useScroll, useTransform } from 'framer-motion';
import { EyeOff, ShieldCheck, Cpu } from 'lucide-react';

export default function AboutPage() {
  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacityTitle = useTransform(scrollY, [0, 200, 350], [1, 1, 0]);
  const opacitySubtitle = useTransform(scrollY, [0, 300, 450], [1, 1, 0]);

  return (
    <div className="flex flex-col w-full bg-transparent overflow-x-hidden selection:bg-gray-900/10 dark:selection:bg-white/20 selection:text-gray-900 dark:selection:text-white transition-colors duration-500">
      
      {/* 1. Immersive Hero */}
      <section className="relative h-screen min-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-transparent">
        <div className="absolute inset-0 w-full h-full -z-10 pointer-events-none">
          <motion.div 
            animate={{ x: ['-20%', '20%', '-20%'], y: ['-10%', '10%', '-10%'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/4 right-1/4 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-indigo-300/40 dark:bg-indigo-900/30 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"
          />
          <motion.div 
            animate={{ x: ['20%', '-20%', '20%'], y: ['10%', '-10%', '10%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-1/4 left-1/4 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-slate-300/40 dark:bg-slate-800/40 rounded-full blur-[140px] mix-blend-multiply dark:mix-blend-screen"
          />
        </div>

        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(black,transparent_80%)] dark:[mask-image:radial-gradient(white,transparent_80%)] opacity-5 dark:opacity-10 pointer-events-none -z-10" />

        <motion.div 
          style={{ y: yText }}
          className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto w-full mt-4"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-6"
          >
            The Manifesto
          </motion.h2>
          <motion.h1
            style={{ opacity: opacityTitle }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-gray-900 dark:text-white mb-6"
          >
            Trust must be <br />
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-slate-500 dark:from-indigo-400 dark:to-slate-400">
              mathematically proven.
            </span>
          </motion.h1>

          <motion.p
            style={{ opacity: opacitySubtitle }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-2xl text-gray-600 dark:text-gray-400 font-light max-w-3xl tracking-wide leading-relaxed"
          >
            We are building the definitive infrastructure for secure organizational voting, shifting the paradigm from blind trust to end-to-end verifiability.
          </motion.p>
        </motion.div>
      </section>

      {/* 2. The Problem */}
      <section className="relative py-24 md:py-32 px-4 max-w-7xl mx-auto w-full z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
        >
          <div className="order-2 md:order-1 relative rounded-3xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 aspect-square flex items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-br from-gray-300/20 to-gray-400/10 dark:from-white/5 dark:to-transparent" />
             <EyeOff className="w-32 h-32 text-gray-400 dark:text-gray-600" />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-4">The Status Quo</h2>
            <p className="text-3xl md:text-5xl font-light text-gray-900 dark:text-white leading-tight mb-6">
              The Black Box Problem.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-light leading-relaxed mb-6">
              In traditional digital voting systems, a vote is cast into a digital void. As a voter, you have absolutely no way to verify if your ballot was actually counted, or if it was tampered with during the tally.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-light leading-relaxed">
              You are forced to rely entirely on <strong>blind trust</strong> in the election organizers and the software vendors. We believe this is fundamentally broken.
            </p>
          </div>
        </motion.div>
      </section>

      {/* 3. The Solution */}
      <section className="relative py-24 md:py-32 bg-gray-50 dark:bg-black/20 border-y border-gray-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
          >
            <div>
              <h2 className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-4">The OmniVote Standard</h2>
              <p className="text-3xl md:text-5xl font-light text-gray-900 dark:text-white leading-tight mb-6">
                End-to-End Verifiable.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-light leading-relaxed mb-6">
                OmniVote replaces trust with advanced cryptography. Using Zero-Knowledge Proofs, we decouple your identity from your ballot.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-light leading-relaxed">
                When you vote, you receive a cryptographic receipt. This allows you to independently verify that your specific ballot was included in the final immutable ledger, without ever revealing who or what you voted for.
              </p>
            </div>
            <div className="relative rounded-3xl overflow-hidden bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 aspect-square flex items-center justify-center">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10" />
               <ShieldCheck className="w-32 h-32 text-indigo-400 dark:text-indigo-600" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Origin & Team */}
      <section className="relative py-32 px-4 max-w-4xl mx-auto w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-full flex items-center justify-center mb-8">
            <Cpu size={28} />
          </div>
          <h2 className="text-3xl md:text-5xl font-light text-gray-900 dark:text-white mb-6 tracking-tight">
            Engineered by VeroSeven.
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-light leading-relaxed mb-10 max-w-2xl mx-auto">
            OmniVote is developed and maintained by VeroSeven. We are a team of security engineers and cryptographers dedicated to building uncompromisable digital infrastructure for the modern world.
          </p>
        </motion.div>
      </section>

    </div>
  );
}
