import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import MoltenBackground from '../components/MoltenBackground';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <MoltenBackground />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-text-primary transition-colors mb-8 text-sm min-h-[44px] sm:min-h-auto">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arcade-pink to-arcade-blue flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold break-words"><span className="gradient-text">Privacy</span> Policy</h1>
          </div>
          <div className="bg-white/[0.03] rounded-2xl p-6 sm:p-8 border border-arcade-pink/10 space-y-4 text-sm text-neutral-400 leading-relaxed">
            <p>Last updated: 2026</p>
            <h2 className="text-text-primary font-bold text-base">1. Information We Collect</h2>
            <p>We collect information you provide when creating an account (email, username) and data from your activity on the platform (game scores, art submissions, chat messages).</p>
            <h2 className="text-text-primary font-bold text-base">2. How We Use Your Information</h2>
            <p>Your information is used to operate the platform, display content on stream overlays, and improve user experience. We do not sell your personal data.</p>
            <h2 className="text-text-primary font-bold text-base">3. Data Storage</h2>
            <p>Your data is stored securely with Supabase. We retain your data as long as your account is active. You can request deletion at any time.</p>
            <h2 className="text-text-primary font-bold text-base">4. Contact</h2>
            <p>For privacy-related inquiries, please contact us through the platforms official channels.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
