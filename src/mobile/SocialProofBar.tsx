import { Users, Gamepad2, Globe } from 'lucide-react';

export default function SocialProofBar() {
  return (
    <div className="border-y border-white/[0.06] bg-white/[0.02] overflow-x-auto no-scrollbar">
      <div className="flex items-center justify-center gap-6 sm:gap-10 px-4 py-3 min-w-max mx-auto max-w-lg">
        <div className="flex items-center gap-2 shrink-0">
          <Users className="w-4 h-4 text-arcade-pink/70" />
          <span className="text-sm text-neutral-400 whitespace-nowrap">12K+ Creators</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Gamepad2 className="w-4 h-4 text-arcade-purple/70" />
          <span className="text-sm text-neutral-400 whitespace-nowrap">50K+ Games Played</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Globe className="w-4 h-4 text-arcade-blue/70" />
          <span className="text-sm text-neutral-400 whitespace-nowrap">Global</span>
        </div>
      </div>
    </div>
  );
}
