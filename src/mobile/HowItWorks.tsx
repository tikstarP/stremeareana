const viewerSteps = [
  {
    num: '01',
    title: 'Get a Room Code',
    desc: 'Ask your streamer for their 6-character room code. Shared via stream, chat, or Discord.',
  },
  {
    num: '02',
    title: 'Enter & Join',
    desc: 'Type the code above and join instantly. No sign-up, no email, no password.',
  },
  {
    num: '03',
    title: 'Play & Win Coins',
    desc: 'Join games, submit art, trigger sounds, and climb the leaderboard with coins.',
  },
];

const streamerSteps = [
  {
    num: '01',
    title: 'Create Room',
    desc: 'Set up your room with a name, game mode, and moderation settings in seconds.',
  },
  {
    num: '02',
    title: 'Share Code',
    desc: 'Share your 6-character room code with viewers on stream or Discord.',
  },
  {
    num: '03',
    title: 'Go Live',
    desc: 'Start rounds, manage the queue, and let viewers play and submit art.',
  },
  {
    num: '04',
    title: 'Engage & Grow',
    desc: 'Rate art, give AI shoutouts, and build a community that keeps coming back.',
  },
];

interface HowItWorksProps {
  role?: 'streamer' | 'viewer';
}

export default function HowItWorks({ role = 'viewer' }: HowItWorksProps) {
  const steps = role === 'streamer' ? streamerSteps : viewerSteps;
  return (
    <section className="px-4 py-12">
      <div className="max-w-lg mx-auto">
        <h2 className="font-display text-2xl font-bold text-center mb-8">
          <span className="text-text-primary">How It </span><span className="gradient-text">Works</span>
        </h2>
        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full border border-arcade-yellow/30 bg-[#111] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-arcade-yellow">{step.num}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-gradient-to-b from-arcade-yellow/20 to-transparent min-h-[24px]" />
                )}
              </div>
              <div className={`pb-8 ${i === steps.length - 1 ? 'pb-0' : ''}`}>
                <h3 className="text-base font-bold text-white mb-1">{step.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
