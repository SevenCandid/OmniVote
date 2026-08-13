import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Mail, Key, Award, CheckCircle, BarChart3, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VoterLandingPage() {
  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacityTitle = useTransform(scrollY, [0, 200, 350], [1, 1, 0]);
  const opacitySubtitle = useTransform(scrollY, [0, 300, 450], [1, 1, 0]);

  const votingLogics = [
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'Standard Elections',
      description: 'Traditional first-past-the-post or multi-seat elections. Perfect for board members, student councils, and official union votes.',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Award Categories',
      description: 'Vote across multiple creative or performance categories. Ideal for ceremonies, employee recognition, and community awards.',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Ranked Choice',
      description: 'Rank candidates in order of preference. The system automatically computes instant runoffs to find the true consensus winner.',
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Public Contests',
      description: 'Vote via USSD, SMS shortcodes, or public links. Designed for high-volume competitions, pageants, reality shows, and mass public polling.',
    },
  ];

  return (
    <div className="flex flex-col w-full bg-transparent overflow-x-hidden selection:bg-gray-900/10 dark:selection:bg-white/20 selection:text-gray-900 dark:selection:text-white transition-colors duration-500">
      
      {/* 1. Immersive Hero */}
      <section className="relative h-screen min-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-transparent">
        {/* Massive Ethereal Gradients */}
        <div className="absolute inset-0 w-full h-full -z-10 pointer-events-none">
          <motion.div 
            animate={{ x: ['-20%', '20%', '-20%'], y: ['-10%', '10%', '-10%'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/4 right-1/4 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-purple-300/40 dark:bg-purple-900/30 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"
          />
          <motion.div 
            animate={{ x: ['20%', '-20%', '20%'], y: ['10%', '-10%', '10%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-1/4 left-1/4 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-blue-200/40 dark:bg-blue-900/20 rounded-full blur-[140px] mix-blend-multiply dark:mix-blend-screen"
          />
        </div>

        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(black,transparent_80%)] dark:[mask-image:radial-gradient(white,transparent_80%)] opacity-5 dark:opacity-10 pointer-events-none -z-10" />

        <motion.div 
          style={{ y: yText }}
          className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto w-full mt-4"
        >
          <motion.h1
            style={{ opacity: opacityTitle }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-gray-900 dark:text-white mb-6"
          >
            Your Voice. <br />
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400">
              Mathematically Secured.
            </span>
          </motion.h1>

          <motion.p
            style={{ opacity: opacitySubtitle }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-2xl text-gray-600 dark:text-gray-400 font-light max-w-2xl tracking-wide leading-relaxed"
          >
            Welcome to the OmniVote Voter Portal. To cast your ballot, you must be explicitly invited by an election organizer.
          </motion.p>
        </motion.div>
      </section>

      {/* 2. How to Vote (Invite Only) */}
      <section className="relative py-24 md:py-32 px-4 max-w-7xl mx-auto w-full z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
        >
          <div>
            <h2 className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-4">Access Control</h2>
            <p className="text-3xl md:text-5xl font-light text-gray-900 dark:text-white leading-tight mb-6">
              Strictly by invitation.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-light leading-relaxed mb-8">
              To ensure absolute integrity, you cannot simply log in to browse active elections. Every voter must receive a unique, cryptographic invitation link directly from their organization.
            </p>
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">1. Receive your link</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Check your email or SMS for your unique voter invitation from your organization.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                  <Key size={18} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">2. Authenticate</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Click the link to verify your identity and securely access your specific ballot.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 aspect-square flex items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
             <Mail className="w-32 h-32 text-gray-300 dark:text-gray-700" />
          </div>
        </motion.div>
      </section>

      {/* 3. Voting Logics */}
      <section className="relative py-24 md:py-32 bg-gray-50 dark:bg-black/20 border-y border-gray-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16 md:mb-24 text-center"
          >
            <h2 className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-4">Flexible Ballots</h2>
            <p className="text-3xl md:text-5xl font-light text-gray-900 dark:text-white leading-tight">
              Designed for every election.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {votingLogics.map((logic, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 1, delay: idx * 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 p-8 rounded-3xl shadow-sm group hover:border-purple-500/50 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-300 mb-6 group-hover:scale-110 transition-transform">
                  {logic.icon}
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3 tracking-wide">
                  {logic.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                  {logic.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Security CTA */}
      <section className="relative py-32 px-4 max-w-4xl mx-auto w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-8">
            <Shield size={28} />
          </div>
          <h2 className="text-3xl md:text-5xl font-light text-gray-900 dark:text-white mb-6 tracking-tight">
            100% Verifiable. <br /> 100% Anonymous.
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-light leading-relaxed mb-10 max-w-2xl mx-auto">
            Your identity is verified to ensure you are eligible to vote, but your ballot is cryptographically sealed using Zero-Knowledge Proofs. Once submitted, it is mathematically impossible to trace your vote back to you.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-transparent border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            Host an Election
          </Link>
        </motion.div>
      </section>

    </div>
  );
}
