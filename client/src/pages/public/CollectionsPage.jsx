import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiCollections } from '../../api/client';
import { Skeleton, CollectionCardSkeleton } from '../../components/ui/Skeletons';

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiCollections.list();
        setCollections(data);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16" aria-hidden="true">
            <Skeleton className="w-40 h-4 mx-auto mb-4" />
            <Skeleton className="w-64 h-12 mx-auto mb-4" />
            <Skeleton className="w-80 h-4 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <CollectionCardSkeleton key={i} index={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="font-body text-xs uppercase tracking-[0.3em] text-gold-500/60 mb-4 block">
            Curated
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-light text-ink-100 mb-4">
            Collections
          </h1>
          <p className="font-body text-ink-400 max-w-lg mx-auto">
            Thoughtfully curated groupings of writings around themes, emotions, and ideas.
          </p>
        </motion.div>

        {collections.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-ink-400 italic">No collections yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection, i) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Link
                  to={`/collections/${collection.slug}`}
                  className="block group p-8 bg-ink-900/30 border border-ink-800/30 rounded-sm card-hover"
                >
                  <h2 className="font-display text-2xl text-ink-100 group-hover:text-gold-400 transition-colors mb-3">
                    {collection.name}
                  </h2>
                  {collection.description && (
                    <p className="font-body text-sm text-ink-400 line-clamp-3 mb-4">
                      {collection.description}
                    </p>
                  )}
                  <div className="font-body text-xs text-ink-500">
                    {collection.writing_count} {collection.writing_count === 1 ? 'writing' : 'writings'}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
