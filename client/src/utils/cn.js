export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function staggerDelay(index) {
  return { transition: { delay: index * 0.1 } };
}
