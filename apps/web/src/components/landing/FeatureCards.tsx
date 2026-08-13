import { motion } from 'framer-motion';
import { Shield, Zap, Vote, Lock, Globe, Server } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export const FeatureCards: React.FC = () => {
  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "End-to-End Verifiable",
      description: "Cryptographic receipts allow voters to individually audit their ballots and ensure accurate tallying.",
      color: "from-emerald-400/20 to-emerald-500/5",
      iconColor: "text-emerald-500 dark:text-emerald-400"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "High-Throughput Scale",
      description: "Handle thousands of concurrent transactions for paid public contests and massive SMS voting events.",
      color: "from-cyan-400/20 to-cyan-500/5",
      iconColor: "text-cyan-500 dark:text-cyan-400"
    },
    {
      icon: <Vote className="w-6 h-6" />,
      title: "Multi-Channel Access",
      description: "Cast ballots securely via Web client, mobile apps, USSD session dial-ins, or SMS message relays.",
      color: "from-indigo-400/20 to-indigo-500/5",
      iconColor: "text-indigo-500 dark:text-indigo-400"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Zero-Knowledge Proofs",
      description: "Advanced cryptographic primitives ensure voter anonymity while maintaining verifiable election integrity.",
      color: "from-purple-400/20 to-purple-500/5",
      iconColor: "text-purple-500 dark:text-purple-400"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global CDN Edge",
      description: "Distributed infrastructure guarantees low latency and 99.99% uptime during critical election hours.",
      color: "from-blue-400/20 to-blue-500/5",
      iconColor: "text-blue-500 dark:text-blue-400"
    },
    {
      icon: <Server className="w-6 h-6" />,
      title: "Immutable Ledger",
      description: "All voting transactions are hashed and appended to an append-only ledger for post-election audits.",
      color: "from-rose-400/20 to-rose-500/5",
      iconColor: "text-rose-500 dark:text-rose-400"
    }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
    >
      {features.map((feature, idx) => (
        <motion.div 
          key={idx} 
          variants={itemVariants}
          whileHover={{ y: -5, scale: 1.02 }}
          className="group relative rounded-2xl bg-white/50 dark:bg-[#18181B]/60 backdrop-blur-xl border border-gray-200/50 dark:border-white/5 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
        >
          {/* Subtle gradient background that glows on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          
          <div className="relative p-8 flex flex-col h-full z-10">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-white dark:bg-black/50 border border-gray-100 dark:border-white/10 shadow-sm mb-6 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
              {feature.description}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
