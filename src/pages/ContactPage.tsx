import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MessageSquare, AtSign } from 'lucide-react';
import MoltenBackground from '../components/MoltenBackground';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <MoltenBackground />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-text-primary transition-colors mb-8 text-sm min-h-[44px] sm:min-h-auto">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arcade-blue to-arcade-green flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold break-words"><span className="gradient-text">Contact</span> Us</h1>
          </div>
          <div className="grid gap-4">
            {[
              { icon: AtSign, label: 'Email', value: 'support@finalstre.am', color: 'from-arcade-pink to-arcade-purple' },
              { icon: MessageSquare, label: 'Discord', value: 'Join our community', color: 'from-arcade-blue to-arcade-cyan', note: 'Link coming soon' },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white/[0.03] rounded-2xl p-6 border border-arcade-pink/10 flex items-center gap-4"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-0.5">{item.label}</p>
                  <p className="text-sm text-text-primary font-medium">{item.value}</p>
                  {item.note && <p className="text-xs text-text-muted mt-0.5">{item.note}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
