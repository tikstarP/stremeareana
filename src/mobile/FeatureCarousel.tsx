import { useState, useRef, useEffect, useCallback } from 'react';
import { Gamepad2, Palette, Trophy, Coins, Volume2, Bot, Crown, Monitor, Shield, Star } from 'lucide-react';

const viewerFeatures = [
  { icon: Gamepad2, title: 'Play Live Games', desc: 'Quiz, guess the number, fastest finger. Compete live.' },
  { icon: Palette, title: 'Submit Fan Art', desc: 'Upload your art. Get rated live by the streamer on stream.' },
  { icon: Trophy, title: 'Climb Leaderboard', desc: 'Earn points for every game, win, and participation.' },
  { icon: Coins, title: 'Use Coins', desc: 'Skip the queue. Trigger sounds. Get priority everywhere.' },
  { icon: Volume2, title: 'Trigger Sounds', desc: 'Play sound effects that everyone in the room hears.' },
  { icon: Bot, title: 'AI Voice Shoutouts', desc: 'Hear your name announced by the AI host on stream.' },
];

const streamerFeatures = [
  { icon: Crown, title: 'Live Control Panel', desc: 'Start rounds, manage queue, and control games from your dashboard.' },
  { icon: Monitor, title: 'OBS Overlay', desc: 'Built-in overlay with timer, queue, art, and leaderboard for broadcast.' },
  { icon: Shield, title: 'Safe & Moderated', desc: 'Choose Safe, Review, or Loose moderation for your room.' },
  { icon: Coins, title: 'Coin Economy', desc: 'Priority queue pricing and coin rewards controlled by you.' },
  { icon: Volume2, title: 'Sound & AI Voice', desc: 'Trigger effects and let the AI host announce players automatically.' },
  { icon: Star, title: 'Leaderboards', desc: 'Track top players and celebrate winners on stream.' },
];

interface FeatureCarouselProps {
  role?: 'streamer' | 'viewer';
}

export default function FeatureCarousel({ role = 'viewer' }: FeatureCarouselProps) {
  const features = role === 'streamer' ? streamerFeatures : viewerFeatures;
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.querySelector('div')?.clientWidth ?? 280;
    const gap = 12;
    const index = Math.round(scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(index, features.length - 1));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <section className="py-12">
      <h2 className="font-display text-2xl font-bold text-center mb-6 px-4">
        <span className="text-text-primary">What Can You </span><span className="gradient-text">Do?</span>
      </h2>

      <div
        ref={containerRef}
        className="flex overflow-x-auto gap-3 px-4 pb-4 no-scrollbar"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {features.map((f, i) => (
          <div
            key={i}
            className="min-w-[260px] max-w-[280px] flex-shrink-0 rounded-xl bg-[#111] p-5 flex flex-col transition-all duration-300"
            style={{
              scrollSnapAlign: 'center',
              height: '180px',
              border: i === activeIndex
                ? '1px solid rgba(245, 158, 11, 0.25)'
                : '1px solid rgba(255,255,255,0.08)',
              boxShadow: i === activeIndex
                ? '0 0 12px rgba(245, 158, 11, 0.08)'
                : 'none',
            }}
          >
            <f.icon className="w-8 h-8 text-arcade-yellow mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">{f.title}</h3>
            <p className="text-sm text-neutral-400 leading-relaxed line-clamp-2">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {features.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === activeIndex ? '24px' : '6px',
              height: '6px',
              background: i === activeIndex
                ? 'linear-gradient(135deg, #f59e0b, #f97316)'
                : 'rgba(75,85,99,1)',
            }}
          />
        ))}
      </div>
    </section>
  );
}
