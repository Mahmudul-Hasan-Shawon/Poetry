import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useLenis, useLenisScroll } from './LenisProvider';

const VeilContext = createContext(null);

const reducedMotionQuery =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
const isReducedMotion = () => (reducedMotionQuery ? reducedMotionQuery.matches : false);

function pathKey(pathname, search) {
  return `${pathname.replace(/\/+$/, '') || '/'}${search}`;
}

export default function VeilTransition({ children }) {
  const veilRef = useRef(null);
  const transitioning = useRef(false);
  const activeTimeline = useRef(null);
  const navigate = useNavigate();
  const lenis = useLenis();
  const { scrollTo, scrollTopInstant } = useLenisScroll();

  const scrollToHash = useCallback(
    (url) => {
      if (!url.hash) return;
      const id = decodeURIComponent(url.hash.slice(1));
      const el = document.getElementById(id);
      if (el) scrollTo(el, { duration: 1.2, offset: 0 });
    },
    [scrollTo]
  );

  const go = useCallback(
    (target) => {
      if (transitioning.current) return;

      const url = new URL(target, window.location.origin);
      const to = url.pathname + url.search + url.hash;
      const current = pathKey(window.location.pathname, window.location.search);
      const destination = pathKey(url.pathname, url.search);

      // In-page hash on the same path: smooth-scroll, never run the veil.
      if (destination === current) {
        if (url.hash) {
          window.history.replaceState({}, '', to);
          scrollToHash(url);
        }
        return;
      }

      // Respect prefers-reduced-motion: swap instantly.
      if (isReducedMotion()) {
        navigate(to);
        if (url.hash) scrollToHash(url);
        else scrollTopInstant();
        return;
      }

      transitioning.current = true;
      lenis?.stop();

      const veil = veilRef.current;
      const tl = gsap.timeline();
      activeTimeline.current = tl;

      tl.set(veil, { visibility: 'visible' })
        .fromTo(
          veil,
          { clipPath: 'inset(100% 0 0 0)' },
          { clipPath: 'inset(0% 0 0 0)', duration: 0.5, ease: 'power4.inOut' }
        )
        .add(() => {
          navigate(to);
          if (url.hash) gsap.delayedCall(0.05, () => scrollToHash(url));
          else scrollTopInstant();
        })
        .to(veil, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.55,
          ease: 'power4.inOut',
          delay: 0.08,
        })
        .set(veil, { visibility: 'hidden', clipPath: 'inset(100% 0 0 0)' });

      tl.eventCallback('onComplete', () => {
        lenis?.start();
        activeTimeline.current = null;
        transitioning.current = false;
      });
    },
    [navigate, lenis, scrollTo, scrollTopInstant, scrollToHash]
  );

  // Back/forward: the router swaps instantly — just cancel any in-flight wipe.
  useEffect(() => {
    const onPopState = () => {
      if (activeTimeline.current) {
        activeTimeline.current.kill();
        lenis?.start();
        activeTimeline.current = null;
        transitioning.current = false;
        const veil = veilRef.current;
        if (veil) gsap.set(veil, { visibility: 'hidden', clipPath: 'inset(100% 0 0 0)' });
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [lenis]);

  // Intercept internal anchor clicks in the capture phase so our preventDefault
  // runs before react-router's Link handler (which skips nav when defaultPrevented).
  useEffect(() => {
    const handleClick = (e) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const el = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (!el) return;
      if (el.target && el.target.toLowerCase() !== '_self') return;
      if (el.hasAttribute('download')) return;

      let url;
      try {
        url = new URL(el.href, window.location.origin);
      } catch {
        return;
      }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
      if (url.origin !== window.location.origin) return;

      e.preventDefault();
      go(url.pathname + url.search + url.hash);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [go]);

  return (
    <VeilContext.Provider value={go}>
      {children}
      <div
        ref={veilRef}
        aria-hidden="true"
        className="fixed inset-0 z-[150] flex items-center justify-center"
        style={{
          visibility: 'hidden',
          clipPath: 'inset(100% 0 0 0)',
          pointerEvents: 'none',
          background: 'linear-gradient(160deg, #141210 0%, #1e1a15 45%, #141210 100%)',
        }}
      >
        <img
          src="/Images/logo/logo.svg"
          alt=""
          className="h-20 w-auto object-contain opacity-90"
        />
      </div>
    </VeilContext.Provider>
  );
}

export function useVeilNavigate() {
  const ctx = useContext(VeilContext);
  if (!ctx) throw new Error('useVeilNavigate must be used within <VeilTransition>');
  return ctx;
}