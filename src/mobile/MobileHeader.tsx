import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function MobileHeader() {
  return (
    <header
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
      className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/90 backdrop-blur-[10px] border-b border-white/[0.06]"
    >
      <div className="flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2 active:scale-[0.97] transition-transform duration-100">
          <Zap className="w-5 h-5 text-arcade-pink" />
          <span className="font-display font-bold text-sm tracking-wider">
            <span className="gradient-text">final</span><span className="text-text-primary">STREAm</span>
          </span>
        </Link>
        <Link
          to="/login"
          className="min-h-[44px] inline-flex items-center px-4 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-neutral-300 active:scale-[0.97] active:opacity-90 transition-all duration-100 touch-manipulation "
        >
          Sign In
        </Link>
      </div>
    </header>
  );
}


