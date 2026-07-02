import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import MoltenBackground from '../components/MoltenBackground';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <MoltenBackground />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-text-primary transition-colors mb-8 text-sm min-h-[44px] sm:min-h-auto">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arcade-purple to-arcade-pink flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold break-words"><span className="gradient-text">Terms</span> of Service</h1>
          </div>
          <div className="bg-white/[0.03] rounded-2xl p-6 sm:p-8 border border-arcade-pink/10 space-y-4 text-sm text-neutral-400 leading-relaxed">
            <p>Last updated: 2026</p>
            <h2 className="text-text-primary font-bold text-base">1. Acceptance of Terms</h2>
            <p>By using finalSTREAm, you agree to these terms. If you do not agree, do not use the platform.</p>
            <h2 className="text-text-primary font-bold text-base">2. User Conduct</h2>
            <p>You agree not to misuse the platform, harass others, or upload inappropriate content. Streamers are responsible for moderating their rooms.</p>
            <h2 className="text-text-primary font-bold text-base">3. Content Ownership</h2>
            <p>You retain ownership of content you submit (art, messages). By submitting, you grant finalSTREAm permission to display it on the platform and stream overlays.</p>
            <h2 className="text-text-primary font-bold text-base">4. Limitation of Liability</h2>
            <p>finalSTREAm is provided as-is. We are not liable for any damages arising from use of the platform.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
