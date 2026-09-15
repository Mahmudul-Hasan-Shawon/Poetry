import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiAuthors } from '../../api/client';
import QuoteCard from '../../components/quotes/QuoteCard';
import { Skeleton, QuoteCardSkeleton } from '../../components/ui/Skeletons';
import { languageLabel } from '../../utils/helpers';

export default function AuthorPage() {
  const { slug } = useParams();
  const [author, setAuthor] = useState(null);
  const [writings, setWritings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiAuthors.get(slug);
        setAuthor(data.author);
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
            <Skeleton className="w-16 h-16 mx-auto mb-6 rounded-full" />
            <Skeleton className="w-56 h-10 mx-auto mb-4" />
            <Skeleton className="w-72 h-4 mx-auto" />
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
  if (!author) return <div className="pt-24 text-center font-body text-ink-400">Author not found</div>;

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Author Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-600/10 flex items-center justify-center border-2 border-gold-500/30">
            <span className="font-display text-3xl text-gold-400">
              {author.name[0]}
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-light text-ink-100 mb-4">
            {author.name}
          </h1>

          {(author.birth_date || author.death_date) && (
            <p className="font-body text-sm text-ink-400 mb-3">
              {author.birth_date || '?'} — {author.death_date || '?'}
            </p>
          )}

          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            {author.country && (
              <span className="font-body text-xs text-ink-500">{author.country}</span>
            )}
            {author.primary_language && (
              <>
                <span className="text-ink-700">·</span>
                <span className="font-body text-xs text-ink-500">{languageLabel(author.primary_language)}</span>
              </>
            )}
          </div>

          {author.short_bio && (
            <p className="font-body text-base text-ink-300 max-w-2xl mx-auto leading-relaxed mb-8">
              {author.short_bio}
            </p>
          )}

          {author.full_bio && (
            <div className="max-w-2xl mx-auto mb-8">
              <p className="font-body text-sm text-ink-400 leading-relaxed">
                {author.full_bio}
              </p>
            </div>
          )}

          <p className="font-body text-sm text-gold-500/60">
            {writings.length} {writings.length === 1 ? 'writing' : 'writings'}
          </p>
        </motion.div>

        {/* Writings */}
        {writings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {writings.map((writing, i) => (
              <QuoteCard key={writing.id} writing={writing} index={i} />
            ))}
          </div>
        )}

        {writings.length === 0 && (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-ink-400">No writings yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
