import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiCollections } from '../../api/client';
import QuoteCard from '../../components/quotes/QuoteCard';
import { Skeleton, QuoteCardSkeleton } from '../../components/ui/Skeletons';

export default function CollectionPage() {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [writings, setWritings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiCollections.get(slug);
        setCollection(data.collection);
        setWritings(data.writings);
      } catch {}
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-6" aria-hidden="true">
          <div className="text-center mb-16">
            <Skeleton className="w-40 h-4 mx-auto mb-4" />
            <Skeleton className="w-64 h-12 mx-auto mb-4" />
            <Skeleton className="w-48 h-4 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <QuoteCardSkeleton key={i} index={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (!collection) return <div className="pt-24 text-center font-body text-ink-400">Collection not found</div>;

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="font-body text-xs uppercase tracking-[0.3em] text-gold-500/60 mb-4 block">
            Collection
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-light text-ink-100 mb-4">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="font-body text-ink-400 max-w-lg mx-auto mb-4">
              {collection.description}
            </p>
          )}
          <p className="font-body text-sm text-ink-500">
            {writings.length} {writings.length === 1 ? 'writing' : 'writings'}
          </p>
        </motion.div>

        {writings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {writings.map((writing, i) => (
              <QuoteCard key={writing.id} writing={writing} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-ink-400">This collection is empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
