import { useEffect, useRef, useCallback, useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  size: number;
  color: string;
  shadow: string;
  duration: number;
  delay: number;
  dx: number;
}

function generateParticles(count: number): Particle[] {
  // Slightly brighter, more varied glow
  const palette = [
    { color: 'rgba(255,242,221,0.48)', shadow: '0 0 3px 1px rgba(255,242,221,0.28)' },
    { color: 'rgba(255,210,160,0.44)', shadow: '0 0 3px 1px rgba(255,210,160,0.24)' },
    { color: 'rgba(255,176,0,0.42)', shadow: '0 0 3px 1px rgba(255,176,0,0.22)' },
    { color: 'rgba(255,195,130,0.44)', shadow: '0 0 3px 1px rgba(255,195,130,0.22)' },
  ];

  return Array.from({ length: count }, (_, i) => {
    const p = palette[Math.floor(Math.random() * palette.length)];
    const rand = Math.random();
    const size = rand < 0.7 ? 0.5 : rand < 0.95 ? 1 : 1.5;

    return {
      id: i,
      x: Math.random() * 100,
      size,
      color: p.color,
      shadow: p.shadow,
      duration: 1.5 + Math.random() * 2.5,
      delay: -(Math.random() * 5),
      dx: (Math.random() - 0.5) * 10,
    };
  });
}

export default function MoltenBackground() {
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const targetRef = useRef({ x: -500, y: -500 });
  const currentRef = useRef({ x: -500, y: -500 });

  const particles = useMemo(() => generateParticles(20), []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    targetRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const animate = () => {
      const lerp = 0.06;
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * lerp;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * lerp;

      if (glowRef.current) {
        glowRef.current.style.transform =
          `translate3d(${currentRef.current.x - 220}px, ${currentRef.current.y - 220}px, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  return (
    <>
      <style>{`
        @keyframes moltenBeamDrift {
          0% {
            transform: rotate(-18deg) translateY(0px);
            opacity: 1;
          }
          100% {
            transform: rotate(-18deg) translateY(-16px);
            opacity: 0.82;
          }
        }
        @keyframes particleRise {
          0% {
            transform: translate3d(var(--pdx), 0, 0);
            opacity: 0;
          }
          8% {
            opacity: 0.55;
          }
          85% {
            opacity: 0.45;
          }
          100% {
            transform: translate3d(var(--pdx), calc(-100vh - 40px), 0);
            opacity: 0;
          }
        }
      `}</style>

      {/* DARK OVERLAY — deeper blacks */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          background: 'rgba(0,0,0,0.35)',
        }}
      />

      {/* LAYER 6 — Large Diagonal Light Beam (softer) */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: '-20%',
          left: '8%',
          width: '46vw',
          height: '120vh',
          background:
            'linear-gradient(18deg, transparent 0%, rgba(255,176,0,0.05) 35%, transparent 70%)',
          transform: 'rotate(-18deg)',
          filter: 'blur(10px)',
          pointerEvents: 'none',
          zIndex: 3,
          willChange: 'transform',
          animation: 'moltenBeamDrift 8s ease-in-out alternate infinite',
          overflow: 'hidden',
        }}
      />

      {/* AMBIENT DEPTH — very soft warm center glow for cinematic depth */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 3,
          background:
            'radial-gradient(ellipse 70% 55% at 50% 45%, rgba(255,140,60,0.035) 0%, transparent 70%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* AMBIENT PARTICLE LAYER — 75 warm glowing motes rising upward */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 4,
          overflow: 'hidden',
        }}
      >
        {particles.map((p) => (
          <span
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              bottom: '-10px',
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              backgroundColor: p.color,
              boxShadow: p.shadow,
              willChange: 'transform, opacity',
              ['--pdx' as string]: `${p.dx}px`,
              transform: 'scale(0.82)',
              animation: `particleRise ${p.duration}s ${p.delay}s linear infinite`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* LAYER 9 — Cursor Glow (larger, softer) */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '440px',
          height: '440px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at center, rgba(255,176,0,0.16) 0%, rgba(255,90,31,0.07) 35%, transparent 68%)',
          filter: 'blur(12px)',
          pointerEvents: 'none',
          zIndex: 5,
          willChange: 'transform',
          mixBlendMode: 'screen',
        }}
      />
    </>
  );
}
