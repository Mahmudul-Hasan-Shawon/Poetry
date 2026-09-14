import { motion } from 'framer-motion';

/** Base shimmering block. */
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/** Skeleton matching QuoteCard's layout, for quote/writing grids. */
export function QuoteCardSkeleton({ index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: 'easeOut' }}
      className="h-full p-7 bg-ink-900/40 border border-ink-800/30 rounded-sm"
      aria-hidden="true"
    >
      <Skeleton className="w-1/2 h-4 mb-3" />
      <Skeleton className="w-12 h-px mb-6" />
      <div className="space-y-3 min-h-[160px]">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-11/12 h-4" />
        <Skeleton className="w-4/5 h-4" />
      </div>
      <div className="mt-6 pt-5 border-t border-ink-800/40 flex items-center justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
    </motion.div>
  );
}

/** Skeleton matching the author circle cards. */
export function AuthorCardSkeleton({ index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: 'easeOut' }}
      className="text-center p-6 border border-ink-800/30 rounded-sm"
      aria-hidden="true"
    >
      <Skeleton className="w-16 h-16 mx-auto mb-4 rounded-full" />
      <Skeleton className="w-3/4 h-4 mx-auto mb-2" />
      <Skeleton className="w-1/2 h-3 mx-auto" />
    </motion.div>
  );
}

/** Skeleton matching the collection cover cards. */
export function CollectionCardSkeleton({ index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: 'easeOut' }}
      className="p-7 border border-ink-800/30 rounded-sm"
      aria-hidden="true"
    >
      <Skeleton className="w-14 h-14 mb-5 rounded-full" />
      <Skeleton className="w-2/3 h-5 mb-3" />
      <Skeleton className="w-full h-3 mb-2" />
      <Skeleton className="w-5/6 h-3" />
    </motion.div>
  );
}
