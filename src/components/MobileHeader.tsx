import { Link } from 'react-router-dom';
import { ChevronLeft, Coins } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../context/AppContext';

export default function MobileHeader() {
  const { user } = useAuth();
  const { profile } = useApp();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-arcade-pink/10">
      <div className="flex items-center justify-between px-4 h-14">
        <Link to="/" className="flex items-center gap-2">
          <ChevronLeft className="w-5 h-5 text-neutral-400" />
          <span className="font-display font-bold text-sm tracking-wider"><span className="gradient-text">final</span>STREAm</span>
        </Link>
        <div className="flex items-center gap-2.5">
          {profile && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-arcade-yellow/10 border border-arcade-yellow/25">
              <Coins className="w-3 h-3 text-arcade-yellow" />
              <span className="text-xs font-bold text-arcade-yellow">{profile.coins}</span>
            </div>
          )}
          {user && profile && (
            <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full border border-arcade-blue/40" />
          )}
        </div>
      </div>
    </header>
  );
}
