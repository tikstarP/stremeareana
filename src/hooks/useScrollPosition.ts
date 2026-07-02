import { useState, useEffect, useRef } from 'react';

export function useScrollPosition(element?: HTMLElement | null) {
  const [scrollTop, setScrollTop] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const target = element || window;
    const handleScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        setScrollTop(element ? element.scrollTop : window.scrollY);
      });
    };
    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      target.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(raf.current);
    };
  }, [element]);

  return scrollTop;
}
