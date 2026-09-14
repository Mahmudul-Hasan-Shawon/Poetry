import { motion } from 'framer-motion';

/** Signature ease used across the site. */
export const EASE = [0.22, 1, 0.36, 1];

/**
 * Parent that staggers its <Item> children in, on mount or on scroll.
 * Variant propagation flows through plain DOM elements, so children can
 * be nested (e.g. motion.tr inside a table inside Stagger).
 */
export function Stagger({ children, className = '', delay = 0, step = 0.07, inView = false, amount = 0.15, as = 'div' }) {
  const M = motion[as] || motion.div;
  const revealProps = inView
    ? { whileInView: 'show', viewport: { once: true, amount } }
    : { animate: 'show' };
  return (
    <M
      className={className}
      initial="hidden"
      {...revealProps}
      variants={{
        hidden: {},
        show: { transition: { delayChildren: delay, staggerChildren: step } },
      }}
    >
      {children}
    </M>
  );
}

/** Child of <Stagger> — fades up softly. Set y={0} for a pure fade. */
export function Item({ children, className = '', y = 18, as = 'div', style }) {
  const M = motion[as] || motion.div;
  return (
    <M
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
      }}
    >
      {children}
    </M>
  );
}
