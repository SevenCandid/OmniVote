import { motion, useScroll, useTransform } from 'framer-motion';
import { Mail, MessageSquare, Briefcase, Send } from 'lucide-react';

export default function ContactPage() {
  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacityTitle = useTransform(scrollY, [0, 200, 350], [1, 1, 0]);

  const contactOptions = [
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Sales & Enterprise',
      description: 'Interested in hosting a massive election or need custom cryptographic deployment? Talk to our sales engineers.',
      email: 'enterprise@veroseven.com'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Technical Support',
      description: 'Need help as a voter or election administrator? Our support team is ready to assist you.',
      email: 'support@omnivote.app'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Press & Partnerships',
      description: 'For media inquiries, security audits, or potential partnerships, reach out here.',
      email: 'press@veroseven.com'
    },
  ];

  return (
    <div className="flex flex-col w-full bg-transparent overflow-x-hidden selection:bg-gray-900/10 dark:selection:bg-white/20 selection:text-gray-900 dark:selection:text-white transition-colors duration-500">
      
      {/* 1. Immersive Hero */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 flex flex-col items-center justify-center overflow-hidden bg-transparent">
        <div className="absolute inset-0 w-full h-full -z-10 pointer-events-none">
          <motion.div 
            animate={{ x: ['-10%', '10%', '-10%'], y: ['-5%', '5%', '-5%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 right-1/4 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-emerald-300/30 dark:bg-emerald-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"
          />
        </div>

        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(black,transparent_80%)] dark:[mask-image:radial-gradient(white,transparent_80%)] opacity-5 dark:opacity-10 pointer-events-none -z-10" />

        <motion.div 
          style={{ y: yText, opacity: opacityTitle }}
          className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto w-full"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-gray-900 dark:text-white mb-6"
          >
            Get in <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400">touch.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-2xl text-gray-600 dark:text-gray-400 font-light max-w-2xl tracking-wide leading-relaxed"
          >
            Whether you are hosting a national election or just have a question about our zero-knowledge proofs, we are here to help.
          </motion.p>
        </motion.div>
      </section>

      {/* 2. Contact Options */}
      <section className="relative py-16 px-4 max-w-7xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {contactOptions.map((option, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 p-8 rounded-3xl shadow-sm hover:border-emerald-500/50 transition-colors flex flex-col h-full"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                {option.icon}
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                {option.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-8 flex-1">
                {option.description}
              </p>
              <a href={`mailto:${option.email}`} className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                {option.email}
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Direct Contact Form */}
      <section className="relative py-24 md:py-32 px-4 max-w-3xl mx-auto w-full z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-sm"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-light text-gray-900 dark:text-white mb-4">Send us a message</h2>
            <p className="text-gray-600 dark:text-gray-400 font-light">Fill out the form below and we will get back to you shortly.</p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Name</label>
                <input type="text" className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-gray-900 dark:text-white" placeholder="Jane Doe" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email</label>
                <input type="email" className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-gray-900 dark:text-white" placeholder="jane@example.com" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Subject</label>
              <input type="text" className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-gray-900 dark:text-white" placeholder="How can we help?" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Message</label>
              <textarea rows={5} className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-gray-900 dark:text-white resize-none" placeholder="Tell us more about your inquiry..." />
            </div>

            <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm">
              <Send size={18} />
              Send Message
            </button>
          </form>
        </motion.div>
      </section>

    </div>
  );
}
