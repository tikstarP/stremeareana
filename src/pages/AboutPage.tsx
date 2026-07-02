import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, Zap } from 'lucide-react';
import MoltenBackground from '../components/MoltenBackground';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <MoltenBackground />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-text-primary transition-colors mb-8 text-sm min-h-[44px] sm:min-h-auto">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arcade-yellow to-arcade-pink flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold break-words"><span className="gradient-text">About</span> finalSTREAm</h1>
          </div>
          <div className="bg-white/[0.03] rounded-2xl p-6 sm:p-8 border border-arcade-pink/10 space-y-4 text-sm text-neutral-400 leading-relaxed">
            <p>finalSTREAm is an interactive live streaming platform that lets viewers join rooms, play mini-games, submit art, trigger sounds, and compete on leaderboards — all from their browser.</p>
            <p>Built for streamers who want deeper engagement with their audience, and for viewers who want more than just watching.</p>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-arcade-pink/10 to-arcade-blue/10 border border-arcade-pink/20 mt-4">
              <Zap className="w-6 h-6 text-arcade-pink shrink-0" />
              <p className="text-xs text-neutral-400">No downloads. No setup. Just a link to share.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
