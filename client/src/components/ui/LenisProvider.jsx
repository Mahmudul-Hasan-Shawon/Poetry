import { createContext, useContext, useEffect, useState } from 'react';
import Lenis from 'lenis';

const LenisContext = createContext(null);

const reducedMotionQuery =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

export default function LenisProvider({ children }) {
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    if (reducedMotionQuery?.matches) return;

    const instance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    let rafId;
    const loop = (time) => {
      instance.raf(time);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    setLenis(instance);

    return () => {
      cancelAnimationFrame(rafId);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export function useLenis() {
  const lenis = useContext(LenisContext);
  return lenis;
}

// Smooth scroll helper: lenis when active, native fallback otherwise.
export function useLenisScroll() {
  const lenis = useLenis();

  const scrollTo = (target, options = {}) => {
    if (lenis) {
      lenis.scrollTo(target, options);
      return;
    }
    const { immediate, behavior } = options;
    if (target === 0 && immediate) {
      window.scrollTo(0, 0);
      return;
    }
    if (typeof target === 'number' && immediate) {
      window.scrollTo(0, target);
      return;
    }
    if (typeof target === 'object') {
      target.scrollIntoView({ behavior: behavior || 'smooth' });
    } else if (typeof target === 'string') {
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: behavior || 'smooth' });
    }
  };

  const scrollTopInstant = () => {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  };

  return { scrollTo, scrollTopInstant };
}