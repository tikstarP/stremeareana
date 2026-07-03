import { Link } from 'react-router-dom';
import { Crown, ArrowRight } from 'lucide-react';

export default function StreamerTeaser() {
  return (
    <section className="px-4 py-8">
      <div className="max-w-lg mx-auto rounded-2xl border border-arcade-purple/15 bg-gradient-to-br from-arcade-purple/8 to-transparent p-5">
        <div className="flex items-start gap-3 mb-3">
          <Crown className="w-6 h-6 text-arcade-purple shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-white mb-1">Are you a streamer?</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Host live games, manage queues, and control your room from the dashboard.
            </p>
          </div>
        </div>
        <Link
          to="/entry"
          className="mt-3 w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border border-arcade-purple/25 text-arcade-purple text-sm font-semibold active:scale-[0.97] active:opacity-90 transition-all duration-100 touch-manipulation "
        >
          Learn More <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-xs text-neutral-500 text-center mt-3">
          Streamer tools work best on desktop
        </p>
      </div>
    </section>
  );
}


