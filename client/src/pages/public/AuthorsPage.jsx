import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiAuthors } from '../../api/client';
import { Skeleton, AuthorCardSkeleton } from '../../components/ui/Skeletons';

export default function AuthorsPage() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiAuthors.list();
        setAuthors(data);
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
            <Skeleton className="w-56 h-4 mx-auto mb-4" />
            <Skeleton className="w-44 h-12 mx-auto mb-4" />
            <Skeleton className="w-80 h-4 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <AuthorCardSkeleton key={i} index={i} />
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
            Voices Across Time
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-light text-ink-100 mb-4">
            Authors
          </h1>
          <p className="font-body text-ink-400 max-w-lg mx-auto">
            Poets, philosophers, writers, and thinkers whose words transcend centuries.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {authors.map((author, i) => (
            <motion.div
              key={author.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Link
                to={`/authors/${author.slug}`}
                className="block group p-8 bg-ink-900/30 border border-ink-800/30 rounded-sm card-hover text-center h-full flex flex-col"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-600/10 flex items-center justify-center border border-gold-500/20 group-hover:border-gold-500/40 transition-colors">
                  <span className="font-display text-2xl text-gold-400">
                    {author.name[0]}
                  </span>
                </div>

                <h2 className="font-display text-xl text-ink-100 group-hover:text-gold-400 transition-colors mb-2">
                  {author.name}
                </h2>

                {author.country && (
                  <p className="font-body text-xs text-ink-500 mb-2">{author.country}</p>
                )}

                {author.birth_date && (
                  <p className="font-body text-xs text-ink-600 mb-3">
                    {author.birth_date}{author.death_date ? ` — ${author.death_date}` : ''}
                  </p>
                )}

                {author.short_bio && (
                  <p className="font-body text-xs text-ink-400 line-clamp-3 mb-4 flex-1">
                    {author.short_bio}
                  </p>
                )}

                <div className="font-body text-xs text-gold-500/60 group-hover:text-gold-400 transition-colors mt-auto pt-2">
                  {author.writing_count} {author.writing_count === 1 ? 'writing' : 'writings'} →
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
