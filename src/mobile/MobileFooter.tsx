import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function MobileFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-4 pt-8 pb-8">
      <div className="max-w-lg mx-auto text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-4 h-4 text-arcade-pink" />
          <span className="font-display font-bold text-sm">
            <span className="gradient-text">final</span>STREAm
          </span>
        </div>
        <div className="flex items-center justify-center gap-4 text-sm">
          <Link to="/terms" className="text-neutral-500 active:text-neutral-300 transition-colors duration-100 min-h-[44px] inline-flex items-center">Terms</Link>
          <Link to="/privacy" className="text-neutral-500 active:text-neutral-300 transition-colors duration-100 min-h-[44px] inline-flex items-center">Privacy</Link>
          <Link to="/contact" className="text-neutral-500 active:text-neutral-300 transition-colors duration-100 min-h-[44px] inline-flex items-center">Contact</Link>
        </div>
        <div className="relative inline-flex">
          <select
            className="appearance-none bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-neutral-400 outline-none focus:border-arcade-yellow/30 transition-colors min-h-[44px] pr-8"
            defaultValue="en"
          >
            <option value="en" className="bg-[#111]">English</option>
            <option value="es" className="bg-[#111]">Español</option>
            <option value="fr" className="bg-[#111]">Français</option>
            <option value="de" className="bg-[#111]">Deutsch</option>
            <option value="pt" className="bg-[#111]">Português</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none text-xs">▼</span>
        </div>
        <p className="text-sm text-neutral-600">© 2026 finalSTREAm. All rights reserved.</p>
      </div>
    </footer>
  );
}
