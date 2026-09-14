import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiSearch } from '../../api/client';
import QuoteCard from '../../components/quotes/QuoteCard';
import { Skeleton } from '../../components/ui/Skeletons';
import { debounce } from '../../utils/helpers';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const q = searchParams.get('q') || '';

  useEffect(() => {
    if (!q) {
      setResults(null);
      return;
    }
    async function search() {
      setLoading(true);
      try {
        const data = await apiSearch.search({ q });
        setResults(data);
      } catch {}
      setLoading(false);
    }
    search();
  }, [q]);

  const handleSearch = useCallback(
    debounce((value) => {
      setSearchParams(value ? { q: value } : {});
    }, 400),
    [setSearchParams]
  );

  const handleInput = (e) => {
    setQuery(e.target.value);
    handleSearch(e.target.value);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="font-body text-xs uppercase tracking-[0.3em] text-gold-500/60 mb-4 block">
            Search
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-light text-ink-100 mb-8">
            Find Words
          </h1>

          <div className="max-w-xl mx-auto relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={handleInput}
              placeholder="Search for love, silence, Rumi, life..."
              className="input-field pl-12 text-center"
              autoFocus
            />
          </div>
        </motion.div>

        {loading && (
          <div className="max-w-3xl mx-auto mt-12 space-y-4" aria-hidden="true">
            <Skeleton className="w-3/4 h-6" />
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-1/2 h-6" />
            <Skeleton className="w-2/3 h-6 mt-8" />
            <Skeleton className="w-5/6 h-6" />
          </div>
        )}

        {results && !loading && (
          <div className="space-y-16">
            {/* Authors */}
            {results.authors?.length > 0 && (
              <section>
                <h2 className="font-body text-xs uppercase tracking-[0.3em] text-gold-500/60 mb-6">
                  Authors
                </h2>
                <div className="flex flex-wrap gap-4">
                  {results.authors.map((author) => (
                    <Link
                      key={author.id}
                      to={`/authors/${author.slug}`}
                      className="flex items-center gap-3 p-4 bg-ink-900/30 border border-ink-800/30 rounded-sm hover:border-gold-500/30 transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-600/10 flex items-center justify-center">
                        <span className="font-display text-sm text-gold-400">{author.name[0]}</span>
                      </div>
                      <div>
                        <h3 className="font-display text-sm text-ink-100">{author.name}</h3>
                        <p className="font-body text-xs text-ink-500">{author.writing_count} writings</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Categories */}
            {results.categories?.length > 0 && (
              <section>
                <h2 className="font-body text-xs uppercase tracking-[0.3em] text-gold-500/60 mb-6">
                  Categories
                </h2>
                <div className="flex flex-wrap gap-2">
                  {results.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/explore?category=${cat.slug}`}
                      className="font-body text-sm text-ink-300 bg-ink-900/30 border border-ink-800/30 px-4 py-2 rounded-sm hover:border-gold-500/30 hover:text-gold-400 transition-all"
                    >
                      {cat.name}
                      <span className="text-ink-600 ml-2">({cat.writing_count})</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Collections */}
            {results.collections?.length > 0 && (
              <section>
                <h2 className="font-body text-xs uppercase tracking-[0.3em] text-gold-500/60 mb-6">
                  Collections
                </h2>
                <div className="flex flex-wrap gap-4">
                  {results.collections.map((col) => (
                    <Link
                      key={col.id}
                      to={`/collections/${col.slug}`}
                      className="p-4 bg-ink-900/30 border border-ink-800/30 rounded-sm hover:border-gold-500/30 transition-all"
                    >
                      <h3 className="font-display text-sm text-ink-100">{col.name}</h3>
                      <p className="font-body text-xs text-ink-500 mt-1">{col.writing_count} writings</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Writings */}
            {results.writings?.length > 0 && (
              <section>
                <h2 className="font-body text-xs uppercase tracking-[0.3em] text-gold-500/60 mb-6">
                  Writings ({results.writings.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.writings.map((writing, i) => (
                    <QuoteCard key={writing.id} writing={writing} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* No results */}
            {results.writings?.length === 0 && results.authors?.length === 0 && (
              <div className="text-center py-20">
                <p className="font-display text-2xl text-ink-400 italic">No results found</p>
                <p className="font-body text-sm text-ink-500 mt-2">Try a different search term</p>
              </div>
            )}
          </div>
        )}

        {!q && !loading && (
          <div className="text-center py-20">
            <p className="font-display text-xl text-ink-400 italic">
              Begin typing to discover words of wisdom...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
