import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X, Trophy, Coins, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../context/AppContext';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useApp();
  const isHome = location.pathname === '/' || location.pathname === '/streamer' || location.pathname === '/viewer';
  const currentRole = location.pathname === '/streamer' ? 'streamer' : location.pathname === '/viewer' ? 'viewer' : null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isHome ? 'bg-transparent' : 'glass-strong border-b border-arcade-pink/10'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Zap className="w-7 h-7 text-arcade-pink group-hover:text-arcade-blue transition-colors" />
              <div className="absolute inset-0 bg-arcade-pink/30 blur-lg rounded-full group-hover:bg-arcade-blue/30 transition-colors" />
            </div>
            <span className="font-display font-bold text-xl tracking-wider">
              <span className="gradient-text">final</span>STREAm
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {isHome && (
              <>
                <a href="#features" className="text-neutral-400 hover:text-arcade-pink transition-colors text-sm font-medium">Features</a>
                <a href="#how-it-works" className="text-neutral-400 hover:text-arcade-pink transition-colors text-sm font-medium">How It Works</a>
                <a href="#art" className="text-neutral-400 hover:text-arcade-pink transition-colors text-sm font-medium">Art Arena</a>
                <a href="#faq" className="text-neutral-400 hover:text-arcade-pink transition-colors text-sm font-medium">FAQ</a>
              </>
            )}
            <LanguageSelector />
            {currentRole && (
              <Link to="/entry" className="text-xs text-neutral-400 hover:text-arcade-yellow transition-colors underline underline-offset-2">
                Switch Role
              </Link>
            )}
            {user && profile ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-arcade-yellow/10 border border-arcade-yellow/30">
                  <Coins className="w-3.5 h-3.5 text-arcade-yellow" />
                  <span className="text-sm font-semibold text-arcade-yellow">{profile.coins}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-arcade-purple/10 border border-arcade-purple/30">
                  <Trophy className="w-4 h-4 text-arcade-purple" />
                  <span className="text-sm font-semibold text-arcade-purple">{profile.points}</span>
                </div>
                <Link to="/dashboard">
                  <img src={profile.avatar_url} alt={profile.username} className="w-8 h-8 rounded-full border border-arcade-blue/50 hover:border-arcade-pink/50 transition-colors" />
                </Link>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-arcade-pink to-arcade-blue text-white text-sm font-semibold hover:opacity-90 transition-opacity glow-pink">
                <LogIn className="w-4 h-4" />Sign In
              </Link>
            )}
            <Link to="/join" className="px-5 py-2 rounded-lg bg-gradient-to-r from-arcade-yellow to-arcade-orange text-black text-sm font-semibold hover:opacity-90 transition-opacity">
              Join Room
            </Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} className="md:hidden min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto p-2 text-neutral-400 hover:text-white">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-arcade-pink/10 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {isHome && (
                <>
                  <a href="#features" onClick={() => setMobileOpen(false)} className="block text-neutral-400 hover:text-arcade-pink min-h-[44px] sm:min-h-auto py-2">Features</a>
                  <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="block text-neutral-400 hover:text-arcade-pink min-h-[44px] sm:min-h-auto py-2">How It Works</a>
                  <a href="#art" onClick={() => setMobileOpen(false)} className="block text-neutral-400 hover:text-arcade-pink min-h-[44px] sm:min-h-auto py-2">Art Arena</a>
                  <a href="#faq" onClick={() => setMobileOpen(false)} className="block text-neutral-400 hover:text-arcade-pink min-h-[44px] sm:min-h-auto py-2">FAQ</a>
                </>
              )}
              <div className="flex items-center gap-4 py-2">
                <LanguageSelector compact />
                {currentRole && (
                  <Link to="/entry" onClick={() => setMobileOpen(false)} className="text-xs text-neutral-400 hover:text-arcade-yellow underline underline-offset-2">
                    Switch Role
                  </Link>
                )}
                {user && profile && (
                  <>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-arcade-yellow/10 border border-arcade-yellow/30">
                      <Coins className="w-3.5 h-3.5 text-arcade-yellow" />
                      <span className="text-sm font-semibold text-arcade-yellow">{profile.coins}</span>
                    </div>
                  </>
                )}
              </div>
              {user ? (
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block text-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-arcade-purple to-arcade-blue text-white text-sm font-semibold">
                  Dashboard
                </Link>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-arcade-pink to-arcade-blue text-white text-sm font-semibold">
                  Sign In
                </Link>
              )}
              <Link to="/join" onClick={() => setMobileOpen(false)} className="block text-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-arcade-yellow to-arcade-orange text-black text-sm font-semibold">
                Join Room
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
